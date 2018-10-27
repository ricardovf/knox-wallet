// import Address from '../Address';
// import { keys, runInAction, values } from 'mobx';
// import Transaction from '../Transaction';
// import * as bitcoin from 'bitcoinjs-lib';
// import classify from 'bitcoinjs-lib/src/classify';
// import { BTCToSatoshi } from '../Converter';
// import { Big } from 'big.js';
// import * as R from 'ramda';
// import { SIGHASH_ALL } from '../../device/Constants';
//
// const SCRIPT_TYPES = classify.types;
//
// export default class BitcoinTransactionMaker {
//   api = null;
//   deviceStore = null;
//
//   constructor(api, device) {
//     this.api = api;
//     this.device = device;
//   }
//
//   /**
//    * @param account {Account}
//    * @param amountToSend {Big} in BTC
//    * @param destination {String} address
//    * @param fee {Big} in BTC
//    * @return {Promise<*>}
//    */
//   async buildAndSignTransaction(account, amountToSend, destination, fee) {
//     if (account && amountToSend && destination && fee) {
//       console.log(
//         'Commiting transaction: ',
//         amountToSend.toString(),
//         fee.toString()
//       );
//       // Make sure the coin is correct on the device
//       await this.device.changeNetwork(
//         account.coin.version,
//         account.coin.p2shVersion
//       );
//
//       // Lets collect previous transactions beginning with change addresses until we have the needed amount + fee
//       const {
//         transactionsIdsVout,
//         amountAvailable,
//       } = await this._collectInputTransactions(account, amountToSend, fee);
//
//       console.log(transactionsIdsVout, amountAvailable.toString());
//
//       /**
//        * @type {TransactionBuilder}
//        */
//       // try {
//       const network =
//         account.coin.network === 'testnet'
//           ? bitcoin.networks.testnet
//           : bitcoin.networks.bitcoin;
//       const txb = new bitcoin.TransactionBuilder(network);
//
//       console.log(transactionsIdsVout);
//
//       txb.setVersion(1);
//       for (let inTx of transactionsIdsVout) {
//         // nSequence is disabled, nLocktime is enabled, RBF is signaled.
//         // https://en.bitcoinwiki.org/wiki/NSequence
//         txb.addInput(inTx.id, inTx.voutN, 0xfffffffd);
//         // txb.__addInputUnsafe(Buffer.from(inTx.id, 'hex'), inTx.voutN, {
//         //   sequence: 0xfffffffd,
//         //   prevOutScript: inTx.script,
//         //   value: parseInt(BTCToSatoshi(inTx.value), 10),
//         // });
//       }
//
//       // Destination
//       txb.addOutput(destination, parseInt(BTCToSatoshi(amountToSend), 10));
//
//       // Change
//       let amountToChange = amountAvailable.minus(amountToSend).minus(fee);
//
//       if (amountToChange.gt(0)) {
//         const internalAddress = await this._findInternalAddress(account);
//
//         txb.addOutput(
//           internalAddress.address,
//           parseInt(BTCToSatoshi(amountToChange), 10)
//         );
//       }
//
//       let i = 0;
//       for (let inTx of transactionsIdsVout) {
//         await this._signInput(txb, account, inTx.addresses[0], i++);
//       }
//
//       // prepare for broadcast to the Bitcoin network
//       let finalTx = txb.build();
//       let finalTxRaw = finalTx.toHex();
//
//       console.log(finalTx);
//       console.log(finalTxRaw);
//
//       let transaction = new Transaction(null);
//       transaction.raw = finalTxRaw;
//
//       return transaction;
//     }
//
//     return false;
//   }
//
//   /**
//    * @param account {Account}
//    * @param transaction {Transaction}
//    * @return {Promise<any>}
//    */
//   async broadcast(account, transaction) {
//     this.api.setEndPoint(account.coin.insightAPI);
//     return await this.api.broadcastTransaction(transaction);
//   }
//
//   async _collectInputTransactions(account, amount, fee) {
//     let amountWithFee = amount.plus(fee);
//     let amountAvailable = new Big(0);
//     let transactionsIdsVout = [];
//
//     let transactions = values(account.transactions);
//     let accountAddresses = R.map(R.prop('address'), values(account.addresses));
//     let accountAddressesInternal = R.map(
//       R.prop('address'),
//       values(account.addressesInternal)
//     );
//
//     let accountAddressesAll = [
//       ...accountAddresses,
//       ...accountAddressesInternal,
//     ];
//
//     // group transactions by day
//     for (let transaction of transactions) {
//       if (`${transaction.data.version}` !== '1') continue;
//
//       // Find output values (received) that can be used
//       if (Array.isArray(transaction.data.vout)) {
//         for (let outTx of transaction.data.vout) {
//           if (
//             outTx.spentTxId === null &&
//             outTx.scriptPubKey &&
//             Array.isArray(outTx.scriptPubKey.addresses) &&
//             R.intersection(outTx.scriptPubKey.addresses, accountAddressesAll)
//               .length > 0
//           ) {
//             let value = new Big(outTx.value);
//
//             // If we have collected enough value, we break
//             if (amountAvailable.gte(amountWithFee)) break;
//
//             amountAvailable = amountAvailable.plus(value);
//
//             transactionsIdsVout.push({
//               id: transaction.id,
//               script: transaction.script,
//               voutN: parseInt(outTx.n, 10),
//               addresses: R.intersection(
//                 outTx.scriptPubKey.addresses,
//                 accountAddressesAll
//               ),
//               value: value,
//             });
//           }
//         }
//       }
//     }
//
//     return {
//       amountAvailable,
//       transactionsIdsVout,
//     };
//   }
//
//   async _findInternalAddress(account) {
//     let internalAddress;
//     let maxInternalIndex =
//       account.addressesInternal.size > 0
//         ? Math.max(...keys(account.addressesInternal))
//         : 0;
//
//     maxInternalIndex = `${maxInternalIndex}`;
//
//     if (
//       account.addressesInternal.size > 0 &&
//       !account.addressesInternal.get(maxInternalIndex).hasAnyTransaction
//     ) {
//       internalAddress = account.addressesInternal.get(maxInternalIndex);
//     } else {
//       let nextFreshIndex =
//         account.addressesInternal.size > 0
//           ? parseInt(maxInternalIndex, 10) + 1
//           : 0;
//
//       nextFreshIndex = `${nextFreshIndex}`;
//
//       internalAddress = new Address();
//       internalAddress.index = nextFreshIndex;
//       internalAddress.path = `${account.purpose}'/${account.coin.coinType}'/${
//         account.index
//       }'/1/${nextFreshIndex}`;
//       internalAddress.internal = true;
//       internalAddress.address = await this.device.getAddress(
//         internalAddress.path
//       );
//
//       if (!account.addressesInternal.has(internalAddress.index)) {
//         runInAction(() => {
//           account.addressesInternal.set(internalAddress.index, internalAddress);
//         });
//       }
//     }
//
//     return internalAddress;
//   }
//
//   async _signInput(builder, account, address, vin) {
//     if (!builder.__inputs[vin]) throw new Error('No input at index: ' + vin);
//
//     let path = account.getPathByAddress(address);
//     let pub = await this.device.getWalletPublicKey(path, false);
//
//     if (pub.address.toString('ascii') !== address) {
//       throw new Error(
//         `The generated address ${pub.address.toString(
//           'ascii'
//         )} is different from the actual address ${address}`
//       );
//     }
//
//     builder.sign(vin, {
//       publicKey: pub.publicKey,
//       sign: hash => {
//         console.log(`HASH RECEIVED IS: ${hash.toString('hex')}`);
//         const signature = Buffer.from(
//           '30440220487542050d87efb2dddfff5563f9374c48cfd5141c184689b875be0e656c17bb0220441a70af0cc905d65b0469f9f5e38d0c40bda8b26a72a5c4855553952b817e4201',
//           'hex'
//         );
//         const ss = bitcoin.script.signature.decode(signature);
//
//         return ss.signature;
//       },
//     });
//
//     return true;
//   }
//
//   /**
//    * @param builder {TransactionBuilder}
//    * @param account {Account}
//    * @param address {String}
//    * @param vin {int}
//    * @return {Promise<boolean>}
//    * @private
//    */
//   // async _signInput(builder, account, address, vin) {
//   //   if (!builder.__inputs[vin]) throw new Error('No input at index: ' + vin);
//   //
//   //   let path = account.getPathByAddress(address);
//   //   let pub = await this.device.getWalletPublicKey(path, false);
//   //
//   //   if (pub.address.toString('ascii') !== address)
//   //     throw new Error(
//   //       `The generated address ${pub.address.toString(
//   //         'ascii'
//   //       )} is different from the actual address ${address}`
//   //     );
//   //
//   //   const hashType = SIGHASH_ALL;
//   //
//   //   let input = builder.__inputs[vin];
//   //
//   //   const ourPubKey = pub.publicKey;
//   //
//   //   if (!this._canSign(input)) {
//   //     const prepared = this._prepareInput(input, ourPubKey);
//   //
//   //     // updates inline
//   //     Object.assign(input, prepared);
//   //   }
//   //
//   //   if (!this._canSign(input))
//   //     throw new Error(input.prevOutType + ' not supported');
//   //
//   //   // ready to sign
//   //   let signatureHash = builder.__tx.hashForSignature(
//   //     vin,
//   //     input.signScript,
//   //     hashType
//   //   );
//   //
//   //   // enforce in order signing of public keys
//   //   let i = 0;
//   //   for (let pubKey of input.pubkeys) {
//   //     if (!ourPubKey.equals(pubKey)) {
//   //       console.log('!ourPubKey.equals(pubKey)', ourPubKey, pubKey);
//   //       i++;
//   //       continue;
//   //     }
//   //     if (input.signatures[i]) throw new Error('Signature already exists');
//   //
//   //     console.log(
//   //       `Signing ${address} (${path}), pubkey=${ourPubKey.toString(
//   //         'hex'
//   //       )}, hash=${signatureHash.toString('hex')}`
//   //     );
//   //
//   //     // DER encoded signature with hash type
//   //     const signature = await this.device.signTransaction(
//   //       path,
//   //       signatureHash,
//   //       false,
//   //       true
//   //     );
//   //
//   //     console.log(
//   //       `Signed: ${address} (${path}), hash=${signatureHash.toString(
//   //         'hex'
//   //       )}, signature=${signature.toString('hex')}`
//   //     );
//   //
//   //     // input.signatures[i] = signature;
//   //
//   //     const ss = bitcoin.script.signature.decode(signature);
//   //     const keyPair = bitcoin.ECPair.fromPublicKey(ourPubKey);
//   //     if (keyPair.verify(signatureHash, ss.signature)) {
//   //       console.log('Tudo certo na assinatura');
//   //     } else {
//   //       throw new Error('Problem verifing signature!');
//   //     }
//   //
//   //     input.signatures[i] = bitcoin.script.signature.encode(
//   //       ss.signature,
//   //       ss.hashType
//   //     );
//   //
//   //     return true;
//   //   }
//   //
//   //   throw new Error('Error signing inputs');
//   // }
//
//   _canSign(input) {
//     return (
//       input.signScript !== undefined &&
//       input.signType !== undefined &&
//       input.pubkeys !== undefined &&
//       input.signatures !== undefined &&
//       input.signatures.length === input.pubkeys.length &&
//       input.pubkeys.length > 0 &&
//       (input.hasWitness === false || input.value !== undefined)
//     );
//   }
//
//   _prepareInput(input, ourPubKey) {
//     if (input.prevOutType && input.prevOutScript) {
//       // embedded scripts are not possible without extra information
//       if (input.prevOutType === SCRIPT_TYPES.P2SH)
//         throw new Error(
//           'PrevOutScript is ' + input.prevOutType + ', requires redeemScript'
//         );
//       if (input.prevOutType === SCRIPT_TYPES.P2WSH)
//         throw new Error(
//           'PrevOutScript is ' + input.prevOutType + ', requires witnessScript'
//         );
//       if (!input.prevOutScript) throw new Error('PrevOutScript is missing');
//
//       const expanded = this._expandOutput(input.prevOutScript, ourPubKey);
//       if (!expanded.pubkeys)
//         throw new Error(
//           expanded.type +
//             ' not supported (' +
//             bitcoin.script.toASM(input.prevOutScript) +
//             ')'
//         );
//       if (input.signatures && input.signatures.some(x => x)) {
//         expanded.signatures = input.signatures;
//       }
//
//       let signScript = input.prevOutScript;
//       if (expanded.type === SCRIPT_TYPES.P2WPKH) {
//         signScript = bitcoin.payments.p2pkh({ pubkey: expanded.pubkeys[0] })
//           .output;
//       }
//
//       return {
//         prevOutType: expanded.type,
//         prevOutScript: input.prevOutScript,
//
//         hasWitness: expanded.type === SCRIPT_TYPES.P2WPKH,
//         signScript,
//         signType: expanded.type,
//
//         pubkeys: expanded.pubkeys,
//         signatures: expanded.signatures,
//       };
//     }
//
//     const prevOutScript = bitcoin.payments.p2pkh({ pubkey: ourPubKey }).output;
//     return {
//       prevOutType: SCRIPT_TYPES.P2PKH,
//       prevOutScript: prevOutScript,
//
//       hasWitness: false,
//       signScript: prevOutScript,
//       signType: SCRIPT_TYPES.P2PKH,
//
//       pubkeys: [ourPubKey],
//       signatures: [undefined],
//     };
//   }
//
//   _expandOutput(script, ourPubKey) {
//     const type = classify.output(script);
//
//     switch (type) {
//       case SCRIPT_TYPES.P2PKH: {
//         if (!ourPubKey) return { type };
//
//         // does our hash160(pubKey) match the output scripts?
//         const pkh1 = bitcoin.payments.p2pkh({ output: script }).hash;
//         const pkh2 = bitcoin.crypto.hash160(ourPubKey);
//         if (!pkh1.equals(pkh2)) return { type };
//
//         return {
//           type,
//           pubkeys: [ourPubKey],
//           signatures: [undefined],
//         };
//       }
//
//       case SCRIPT_TYPES.P2WPKH: {
//         if (!ourPubKey) return { type };
//
//         // does our hash160(pubKey) match the output scripts?
//         const wpkh1 = bitcoin.payments.p2wpkh({ output: script }).hash;
//         const wpkh2 = bitcoin.crypto.hash160(ourPubKey);
//         if (!wpkh1.equals(wpkh2)) return { type };
//
//         return {
//           type,
//           pubkeys: [ourPubKey],
//           signatures: [undefined],
//         };
//       }
//
//       case SCRIPT_TYPES.P2PK: {
//         const p2pk = bitcoin.payments.p2pk({ output: script });
//         return {
//           type,
//           pubkeys: [p2pk.pubkey],
//           signatures: [undefined],
//         };
//       }
//
//       case SCRIPT_TYPES.MULTISIG: {
//         const p2ms = bitcoin.payments.p2ms({ output: script });
//         return {
//           type,
//           pubkeys: p2ms.pubkeys,
//           signatures: p2ms.pubkeys.map(() => undefined),
//         };
//       }
//     }
//
//     return { type };
//   }
// }
