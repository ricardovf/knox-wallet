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

import javacard.framework.Util;
import javacard.security.Signature;

public class Bip32 {
	
	protected static final short OFFSET_DERIVATION_INDEX = (short)64;
	
	private static final byte BITCOIN_SEED[] = {'B', 'i', 't', 'c', 'o', 'i', 'n', ' ', 's', 'e', 'e', 'd'};
	private static final byte BIP39_PASSWORD[] = {
		'm', 'n', 'e', 'm', 'o', 'n', 'i', 'c'
	};
	
	private static final short OFFSET_TMP = (short)100;	
	private static final short OFFSET_BLOCK = (short)127;

	/**
	 * Derive the master key from the BIP39 seed (that should be located at the scratch memory, position 0)
	 */
	public static void deriveSeed() {
		if (Crypto.signatureHmac != null) {
			Crypto.keyHmac2.setKey(BITCOIN_SEED, (short)0, (short)BITCOIN_SEED.length);

			if ((BasicWalletApplet.proprietaryAPI != null) && (BasicWalletApplet.proprietaryAPI.hasHmacSHA512())) {
				BasicWalletApplet.proprietaryAPI.hmacSHA512(Crypto.keyHmac2, BasicWalletApplet.scratch256, (short)0, (short)64, BasicWalletApplet.masterDerived, (short)0);
			} else {
				Crypto.signatureHmac.init(Crypto.keyHmac2, Signature.MODE_SIGN);
				Crypto.signatureHmac.sign(BasicWalletApplet.scratch256, (short)0, (short)64, BasicWalletApplet.masterDerived, (short)0);
			}
		}
		else {
			HmacSha512.hmac(BITCOIN_SEED, (short)0, (short)BITCOIN_SEED.length, BasicWalletApplet.scratch256, (short)0, (short)64, BasicWalletApplet.masterDerived, (short)0, BasicWalletApplet.scratch256, (short)64);
		}
	}
	
	// scratch255 : 0-64 : key + chain / 64-67 : derivation index / 100-165 : tmp
	// apduBuffer : block (128, starting at 127)
	// result : scratch255 0-64
	public static boolean derive(byte[] apduBuffer) {
		boolean isZero = true;
		byte i;
		if ((BasicWalletApplet.scratch256[OFFSET_DERIVATION_INDEX] & (byte)0x80) == 0) {
			if (BasicWalletApplet.proprietaryAPI != null) {
				BasicWalletApplet.proprietaryAPI.getUncompressedPublicPoint(BasicWalletApplet.scratch256, (short)0, BasicWalletApplet.scratch256, OFFSET_TMP);
			}
			else {				
				if (!Bip32Cache.copyLastPublic(BasicWalletApplet.scratch256, OFFSET_TMP)) {
					return false;
				}
			}
			AddressUtils.compressPublicKey(BasicWalletApplet.scratch256, OFFSET_TMP);
		}
		else {
			BasicWalletApplet.scratch256[OFFSET_TMP] = 0;
			Util.arrayCopyNonAtomic(BasicWalletApplet.scratch256, (short)0, BasicWalletApplet.scratch256, (short)(OFFSET_TMP + 1), (short)32);
		}
		Util.arrayCopyNonAtomic(BasicWalletApplet.scratch256, OFFSET_DERIVATION_INDEX, BasicWalletApplet.scratch256, (short)(OFFSET_TMP + 33), (short)4);
		if (Crypto.signatureHmac != null) {
			Crypto.keyHmac.setKey(BasicWalletApplet.scratch256, (short)32, (short)32);
			if ((BasicWalletApplet.proprietaryAPI != null) && (BasicWalletApplet.proprietaryAPI.hasHmacSHA512())) {
				BasicWalletApplet.proprietaryAPI.hmacSHA512(Crypto.keyHmac, BasicWalletApplet.scratch256, OFFSET_TMP, (short)37, BasicWalletApplet.scratch256, OFFSET_TMP);
			}
			else {
				Crypto.signatureHmac.init(Crypto.keyHmac, Signature.MODE_SIGN);
				Crypto.signatureHmac.sign(BasicWalletApplet.scratch256, OFFSET_TMP, (short)37, BasicWalletApplet.scratch256, OFFSET_TMP);
			}
		}
		else {
			HmacSha512.hmac(BasicWalletApplet.scratch256, (short)32, (short)32, BasicWalletApplet.scratch256, OFFSET_TMP, (short)37, BasicWalletApplet.scratch256, OFFSET_TMP, apduBuffer, OFFSET_BLOCK);
		}
		if (MathMod256.ucmp(BasicWalletApplet.scratch256, OFFSET_TMP, Secp256k1.SECP256K1_R, (short)0) >= 0) {
			return false;
		}
		MathMod256.addm(BasicWalletApplet.scratch256, (short)0, BasicWalletApplet.scratch256, OFFSET_TMP, BasicWalletApplet.scratch256, (short)0, Secp256k1.SECP256K1_R, (short)0);
		for (i=0; i<(byte)32; i++) {
			if (BasicWalletApplet.scratch256[i] != 0) {
				isZero = false;
				break;
			}
		}
		if (isZero) {
			return false;
		}
		Util.arrayCopyNonAtomic(BasicWalletApplet.scratch256, (short)(OFFSET_TMP + 32), BasicWalletApplet.scratch256, (short)32, (short)32);
		return true;
	}

}
