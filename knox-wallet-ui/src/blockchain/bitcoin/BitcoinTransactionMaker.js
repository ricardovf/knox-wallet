import Address from '../Address';
import { keys, runInAction, values } from 'mobx';
import Transaction from '../Transaction';
import * as bitcoin from 'bitcoinjs-lib';
import classify from 'bitcoinjs-lib/src/classify';
import { BTCToSatoshi } from '../Converter';
import { Big } from 'big.js';
import * as R from 'ramda';
import { SIGHASH_ALL } from '../../device/Constants';
import * as bitcore from 'bitcore-lib';

const SCRIPT_TYPES = classify.types;

export default class BitcoinTransactionMaker {
  api = null;
  deviceStore = null;

  constructor(api, device) {
    this.api = api;
    this.device = device;
  }

  /**
   * @param account {Account}
   * @param amountToSend {Big} in BTC
   * @param destination {String} address
   * @param fee {Big} in BTC
   * @return {Promise<*>}
   */
  async buildAndSignTransaction(account, amountToSend, destination, fee) {
    if (account && amountToSend && destination && fee) {
      // Make sure the coin is correct on the device
      await this.device.changeNetwork(
        account.coin.version,
        account.coin.p2shVersion
      );

      // Lets collect previous transactions beginning with change addresses until we have the needed amount + fee
      const {
        transactionsIdsVout,
        amountAvailable,
      } = await this._collectInputTransactions(account, amountToSend, fee);

      let transaction = new bitcore.Transaction();

      bitcore.Networks.defaultNetwork =
        account.coin.network === 'testnet'
          ? bitcore.Networks.testnet
          : bitcore.Networks.mainnet;

      // Inputs
      for (let inTx of transactionsIdsVout) {
        console.log(inTx);
        let utxo = {
          address: inTx.addresses[0],
          txId: inTx.id,
          outputIndex: inTx.voutN,
          script: inTx.script,
          satoshis: parseInt(BTCToSatoshi(inTx.value), 10),
        };
        transaction.from(utxo);
      }
      // seq 0xfffffffd

      // Destination
      transaction.to(destination, parseInt(BTCToSatoshi(amountToSend), 10));

      // Fee
      transaction.fee(parseInt(BTCToSatoshi(fee), 10));

      // Change
      let amountToChange = amountAvailable.minus(amountToSend).minus(fee);

      if (amountToChange.gt(0)) {
        const internalAddress = await this._findInternalAddress(account);

        transaction.change(internalAddress.address);
      }

      // Sign
      let index = 0;
      for (let inTx of transactionsIdsVout) {
        let path = account.getPathByAddress(inTx.addresses[0]);
        let pub = await this.device.getWalletPublicKey(path, false);

        let privateKey = new bitcore.PrivateKey();
        let sigtype = bitcore.crypto.Signature.SIGHASH_ALL;
        let hashData = bitcore.crypto.Hash.sha256ripemd160(pub.publicKey);

        let input = transaction.inputs[index];

        console.log(input);

        if (
          bitcore.util.buffer.equals(
            hashData,
            input.output.script.getPublicKeyHash()
          )
        ) {
          let hashbuf = bitcore.Transaction.sighash(
            transaction,
            sigtype,
            index,
            input.output.script
          );
          let ecdsa_ = bitcore.crypto.ECDSA().set({
            hashbuf: hashbuf,
            endian: 'little',
            privkey: privateKey,
          });

          let signatureHash = ecdsa_.hashbuf;

          console.log(`HASH: ${signatureHash.toString('hex')}`);

          // DER encoded signature without hash type
          const signatureDER = await this.device.signTransaction(
            path,
            signatureHash,
            false,
            false
          );

          let signature = new bitcore.crypto.Signature.fromDER(signatureDER);

          transaction.applySignature(
            new bitcore.Transaction.Signature({
              publicKey: privateKey.publicKey,
              prevTxId: input.prevTxId,
              outputIndex: input.outputIndex,
              inputIndex: index,
              signature: signature,
              sigtype: sigtype,
            })
          );
        }

        index++;
      }

      console.log(transaction.toObject());
      console.log(transaction.serialize());

      throw 'Error';

      let ourTransaction = new Transaction(null);
      ourTransaction.raw = transaction.serialize();

      return ourTransaction;
    }
    return false;
  }

  /**
   * @param account {Account}
   * @param transaction {Transaction}
   * @return {Promise<any>}
   */
  async broadcast(account, transaction) {
    this.api.setEndPoint(account.coin.insightAPI);
    await this.api.broadcastTransaction(transaction);
  }

  async _collectInputTransactions(account, amount, fee) {
    let amountWithFee = amount.plus(fee);
    let amountAvailable = new Big(0);
    let transactionsIdsVout = [];

    let transactions = values(account.transactions);
    let accountAddresses = R.map(R.prop('address'), values(account.addresses));
    let accountAddressesInternal = R.map(
      R.prop('address'),
      values(account.addressesInternal)
    );

    let accountAddressesAll = [
      ...accountAddresses,
      ...accountAddressesInternal,
    ];

    for (let transaction of transactions) {
      if (`${transaction.data.version}` !== '1') continue;

      // Find output values (received) that can be used
      if (Array.isArray(transaction.data.vout)) {
        for (let outTx of transaction.data.vout) {
          if (
            outTx.spentTxId === null &&
            outTx.scriptPubKey &&
            Array.isArray(outTx.scriptPubKey.addresses) &&
            R.intersection(outTx.scriptPubKey.addresses, accountAddressesAll)
              .length > 0
          ) {
            let value = new Big(outTx.value);

            // If we have collected enough value, we break
            if (amountAvailable.gte(amountWithFee)) break;

            amountAvailable = amountAvailable.plus(value);

            transactionsIdsVout.push({
              id: transaction.id,
              script: outTx.scriptPubKey.hex,
              voutN: parseInt(outTx.n, 10),
              addresses: R.intersection(
                outTx.scriptPubKey.addresses,
                accountAddressesAll
              ),
              value: value,
              valueBTC: value.toString(),
            });
          }
        }
      }
    }

    return {
      amountAvailable,
      transactionsIdsVout,
    };
  }

  async _findInternalAddress(account) {
    let internalAddress;
    let maxInternalIndex =
      account.addressesInternal.size > 0
        ? Math.max(...keys(account.addressesInternal))
        : 0;

    maxInternalIndex = `${maxInternalIndex}`;

    if (
      account.addressesInternal.size > 0 &&
      !account.addressesInternal.get(maxInternalIndex).hasAnyTransaction
    ) {
      internalAddress = account.addressesInternal.get(maxInternalIndex);
    } else {
      let nextFreshIndex =
        account.addressesInternal.size > 0
          ? parseInt(maxInternalIndex, 10) + 1
          : 0;

      nextFreshIndex = `${nextFreshIndex}`;

      internalAddress = new Address();
      internalAddress.index = nextFreshIndex;
      internalAddress.path = `${account.purpose}'/${account.coin.coinType}'/${
        account.index
      }'/1/${nextFreshIndex}`;
      internalAddress.internal = true;
      internalAddress.address = await this.device.getAddress(
        internalAddress.path
      );

      if (!account.addressesInternal.has(internalAddress.index)) {
        runInAction(() => {
          account.addressesInternal.set(internalAddress.index, internalAddress);
        });
      }
    }

    return internalAddress;
  }

  async _signInput(builder, account, address, vin) {
    if (!builder.__inputs[vin]) throw new Error('No input at index: ' + vin);

    let path = account.getPathByAddress(address);
    let pub = await this.device.getWalletPublicKey(path, false);

    if (pub.address.toString('ascii') !== address) {
      throw new Error(
        `The generated address ${pub.address.toString(
          'ascii'
        )} is different from the actual address ${address}`
      );
    }

    builder.sign(vin, {
      publicKey: pub.publicKey,
      sign: hash => {
        console.log(`HASH RECEIVED IS: ${hash.toString('hex')}`);
        const signature = Buffer.from(
          '30440220487542050d87efb2dddfff5563f9374c48cfd5141c184689b875be0e656c17bb0220441a70af0cc905d65b0469f9f5e38d0c40bda8b26a72a5c4855553952b817e4201',
          'hex'
        );
        const ss = bitcoin.script.signature.decode(signature);

        return ss.signature;
      },
    });

    return true;
  }
}
