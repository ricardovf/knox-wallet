/*
 *******************************************************************************
 *   Java Card Bitcoin Hardware Wallet
 *   (c) 2015 Ledger
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Affero General Public License as
 *   published by the Free Software Foundation, either version 3 of the
 *   License, or (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Affero General Public License for more details.
 *
 *   You should have received a copy of the GNU Affero General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *******************************************************************************
 */

package com.knox.playground.basic;

import com.knox.playground.dongle.BTChipException;
import com.licel.jcardsim.utils.ByteUtil;
import org.bitcoinj.core.ECKey;
import org.bitcoinj.core.NetworkParameters;
import org.bitcoinj.core.Sha256Hash;
import org.bitcoinj.core.Utils;
import org.bitcoinj.crypto.ChildNumber;
import org.bitcoinj.crypto.DeterministicKey;
import org.bitcoinj.crypto.HDKeyDerivation;
import org.bitcoinj.params.TestNet3Params;
import org.bitcoinj.wallet.DeterministicSeed;
import org.bitcoinj.wallet.UnreadableWalletException;
import org.bitcoinj.wallet.Wallet;
import org.junit.Assert;
import org.junit.Test;

import static org.junit.Assert.assertTrue;

public class BitcoinJTest extends AbstractJavaCardTest {
//    @Test
//    public void testSignMessage() throws BTChipException {
////        BTChipDongle dongle = prepareDongleRestoreTestnet(true);
////        dongle.verifyPin(DEFAULT_PIN);
////        dongle.signMessagePrepare("13'/0'/0'/0/42", MSG.getBytes());
////        BTChipDongle.BTChipSignature signature = dongle.signMessageSign(null);
////        assertTrue(Arrays.equals(canonicalizeSignature(signature.getSignature()), EXPECTED_SIGNATURE));
//    }

    @Test
    public void backupToMnemonicSeed() throws UnreadableWalletException {
        NetworkParameters params = TestNet3Params.get();

        DeterministicSeed seed = new DeterministicSeed(new String(DEFAULT_SEED_WORDS), null, "", 1409478661L);

//        Wallet wallet = Wallet.fromSeed(params, seed);

        Assert.assertEquals(new String(DEFAULT_SEED_WORDS), Utils.join(seed.getMnemonicCode()));
    }

    @Test
    public void generateAddress() throws UnreadableWalletException {
        NetworkParameters params = TestNet3Params.get();

        DeterministicSeed seed = new DeterministicSeed(new String(DEFAULT_SEED_WORDS), null, "", 1409478661L);

//        Wallet wallet = Wallet.fromSeed(params, seed);

        DeterministicKey dkRoot = HDKeyDerivation.createMasterPrivateKey(seed.getSeedBytes());
        DeterministicKey dk44H = HDKeyDerivation.deriveChildKey(dkRoot, 44 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H = HDKeyDerivation.deriveChildKey(dk44H, 0 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H0H = HDKeyDerivation.deriveChildKey(dk44H0H, 0 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H0H0 = HDKeyDerivation.deriveChildKey(dk44H0H0H, 1);
        DeterministicKey dk44H0H0H042 = HDKeyDerivation.deriveChildKey(dk44H0H0H0, 42);

        System.out.println(dk44H0H0H042.toAddress(params));
        System.out.println(dk44H0H0H042.getPubKeyPoint());
    }

    @Test
    public void generateAddress13() throws UnreadableWalletException {
        NetworkParameters params = TestNet3Params.get();

        DeterministicSeed seed = new DeterministicSeed(new String(DEFAULT_SEED_WORDS), null, "", 1409478661L);

//        Wallet wallet = Wallet.fromSeed(params, seed);

        // "13'/0'/0'/0/42"
        DeterministicKey dkRoot = HDKeyDerivation.createMasterPrivateKey(seed.getSeedBytes());
        DeterministicKey dk44H = HDKeyDerivation.deriveChildKey(dkRoot, 13 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H = HDKeyDerivation.deriveChildKey(dk44H, 0 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H0H = HDKeyDerivation.deriveChildKey(dk44H0H, 0 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H0H0 = HDKeyDerivation.deriveChildKey(dk44H0H0H, 0);
        DeterministicKey dk44H0H0H042 = HDKeyDerivation.deriveChildKey(dk44H0H0H0, 42);

//        System.out.println(dk44H0H0H042.toAddress(params));
//        System.out.println(dk44H0H0H042.getPubKeyPoint());
//        System.out.println(ByteUtil.hexString(dk44H0H0H042.getChainCode()));

        Sha256Hash hash = Sha256Hash.wrap("9566fb3aee440cf853372f2ed1f287d7c7e01717f22f6427056efa0cae52252c");
        // Sign
        ECKey.ECDSASignature signature = dk44H0H0H042.sign(hash);
//        System.out.println(signature.isCanonical());
//        System.out.println(signature.r);
//        System.out.println(signature.s);
//        System.out.println(ByteUtil.hexString(signature.encodeToDER()));
        assertTrue(dk44H0H0H042.verify(hash, signature));
//
//        signature = ECKey.ECDSASignature.decodeFromDER(ByteUtil.byteArray("304402205eabeefae7d20bfe0e6c43012cd2348598cae7b052f6df0add9fd70161941c8802200f9520b90f46d39265a75f652d2741cd3130989017795213b6decde30ed543ca"));
//        System.out.println(signature.isCanonical());
//        System.out.println(signature.r);
//        System.out.println(signature.s);
//        System.out.println(ByteUtil.hexString(signature.encodeToDER()));
//        assertTrue(dk44H0H0H042.verify(hash, signature));
    }


}

