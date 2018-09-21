/*
*******************************************************************************    
*   BTChip Bitcoin Hardware Wallet Java API
*   (c) 2014 BTChip - 1BTChip7VfTnrPra5jqci7ejnMguuHogTn
*   
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*   limitations under the License.
********************************************************************************
*/

package com.knox.playground.dongle;

import java.io.ByteArrayOutputStream;
import java.util.Arrays;

import com.knox.playground.dongle.comm.BTChipTransport;
import com.knox.playground.dongle.utils.*;

import javax.smartcardio.CommandAPDU;
import javax.smartcardio.ResponseAPDU;

public class BTChipDongle implements BTChipConstants {
	
	public enum OperationMode {
		WALLET(0x01),
		DEVELOPER(0x08);
		
		private int value;
		
		OperationMode(int value) {
			this.value = value;
		}
		
		public int getValue() {
			return value;
		}
	};

	public enum UserConfirmation {
		NONE(0x00);

		private int value;
		
		UserConfirmation(int value) {
			this.value = value;
		}
		
		public int getValue() {
			return value;
		}
	}

	public class BTChipPublicKey {
		private byte[] publicKey;
		private String address;
		private byte[] chainCode;
		
		public BTChipPublicKey(byte[] publicKey, String address, byte[] chainCode) {
			this.publicKey = publicKey;
			this.address = address;
			this.chainCode = chainCode;
		}
		
		public byte[] getPublicKey() {
			return publicKey;
		}		
		public String getAddress() {
			return address;
		}		
		public byte[] getChainCode() {
			return chainCode;
		}
		
		@Override
		public String toString() {
			StringBuffer buffer = new StringBuffer();
			buffer.append("Address ");
			buffer.append(address);
			buffer.append(" public key ");
			buffer.append(Dump.dump(publicKey));
			buffer.append(" chaincode ");
			buffer.append(Dump.dump(chainCode));
			return buffer.toString();
		}
	}
	
	public class BTChipSignature {
		private byte[] signature;
		private int yParity;
		
		public BTChipSignature(byte[] signature, int yParity) {
			this.signature = signature;
			this.yParity = yParity;
		}
		
		public byte[] getSignature() {
			return signature;
		}		
		public int getYParity() {
			return yParity;
		}
		
		@Override
		public String toString() {
			StringBuffer buffer = new StringBuffer();
			buffer.append("Signature ");
			buffer.append(Dump.dump(signature));
			buffer.append(" y parity ");
			buffer.append(yParity);
			return buffer.toString();
		}
	}
	
	public class BTChipFirmware {
		private int major;
		private int minor;
		private int patch;

		public BTChipFirmware(int major, int minor, int patch) {
			this.major = major;
			this.minor = minor;
			this.patch = patch;
		}
		
		public int getMajor() {
			return major;
		}
		public int getMinor() {
			return minor;
		}
		public int getPatch() {
			return patch;
		}

		@Override
		public String toString() {
			StringBuffer buffer = new StringBuffer();
			buffer.append(major).append('.').append(minor).append('.').append(patch);
			return buffer.toString();
		}
	}
	
	public class BTChipInput {
		private byte[] value;
		private boolean trusted;
		
		public BTChipInput(byte[] value, boolean trusted) {
			this.value = value;
			this.trusted = trusted;
		}
		
		public byte[] getValue() {
			return value;
		}
		public boolean isTrusted() {
			return trusted;
		}
		
		@Override
		public String toString() {
			StringBuffer buffer = new StringBuffer();
			buffer.append("Value ").append(Dump.dump(value));
			buffer.append(" trusted ").append(trusted);
			return buffer.toString();
		}
	}

	public class BTChipOutput {
		private byte[] value;
		private UserConfirmation userConfirmation;
		
		public BTChipOutput(byte[] value, UserConfirmation userConfirmation) {
			this.value = value;
			this.userConfirmation = userConfirmation;
		}
		
		public byte[] getValue() {
			return value;
		}
		public boolean isConfirmationNeeded() {
			return (!userConfirmation.equals(UserConfirmation.NONE));
		}
		public UserConfirmation getUserConfirmation() {
			return userConfirmation;
		}
		
		@Override
		public String toString() {
			StringBuffer buffer = new StringBuffer();
			buffer.append("Value ").append(Dump.dump(value));
			buffer.append(" confirmation type ").append(userConfirmation.toString());
			return buffer.toString();
		}
	}
	
	public class BTChipOutputKeycard extends BTChipOutput {
		private byte[] keycardIndexes;
				
		public BTChipOutputKeycard(byte[] value, UserConfirmation userConfirmation, byte[] keycardIndexes) {
			super(value, userConfirmation);
			this.keycardIndexes = keycardIndexes;
		}
		
		public byte[] getKeycardIndexes() {
			return keycardIndexes;
		}
		
		@Override
		public String toString() {
			StringBuffer buffer = new StringBuffer();
			buffer.append(super.toString());
			buffer.append(" address indexes ");
			for (int i=0; i<keycardIndexes.length; i++) {
				buffer.append(i).append(" ");
			}
			return buffer.toString();
		}				
	}

	private BTChipTransport transport;
	private int lastSW;
	
	private static final int OK[] = { SW_OK };
	private static final byte DUMMY[] = { 0 };
	
	public BTChipDongle(BTChipTransport transport) {
		this.transport = transport;
	}

	private byte[] exchange(byte[] apdu) throws BTChipException {
		return exchange(apdu, false);
	}

	private byte[] exchange(byte[] apdu, boolean rawResponse) throws BTChipException {
		ResponseAPDU responseAPDU = transport.exchange(apdu);
		byte[] response = responseAPDU.getBytes();

		if (rawResponse) return response;

		if (response.length < 2) {
			throw new BTChipException("Truncated response");
		}
		lastSW = ((int)(response[response.length - 2] & 0xff) << 8) | 
				(int)(response[response.length - 1] & 0xff);
		byte[] result = new byte[response.length - 2];
		System.arraycopy(response, 0, result, 0, response.length - 2);
		return result;
	}
	
	private byte[] exchangeCheck(byte[] apdu, int acceptedSW[]) throws BTChipException {
		byte[] response = exchange(apdu);
		if (acceptedSW == null) {
			return response;
		}
		for (int SW : acceptedSW) {
			if (lastSW == SW) {
				return response;
			}
		}
		throw new BTChipException("Invalid status", lastSW);
	}
	
	private byte[] exchangeApdu(byte cla, byte ins, byte p1, byte p2, byte[] data, int acceptedSW[]) throws BTChipException {
		byte[] apdu = new byte[data.length + 5];
		apdu[0] = cla;
		apdu[1] = ins;
		apdu[2] = p1;
		apdu[3] = p2;
		apdu[4] = (byte)(data.length);
		System.arraycopy(data, 0, apdu, 5, data.length);
		return exchangeCheck(apdu, acceptedSW);
	}
	
	private byte[] exchangeApdu(byte cla, byte ins, byte p1, byte p2, int length, int acceptedSW[]) throws BTChipException {
		byte[] apdu = new byte[5];
		apdu[0] = cla;
		apdu[1] = ins;
		apdu[2] = p1;
		apdu[3] = p2;
		apdu[4] = (byte)(length);
		return exchangeCheck(apdu, acceptedSW);
	}

	private byte[] exchangeApduSplit(byte cla, byte ins, byte p1, byte p2, byte[] data, int acceptedSW[]) throws BTChipException {
		int offset = 0;
		byte[] result = null;
		while (offset < data.length) {
			int blockLength = ((data.length - offset) > 255 ? 255 : data.length - offset);
			byte[] apdu = new byte[blockLength + 5];
			apdu[0] = cla;
			apdu[1] = ins;
			apdu[2] = p1;
			apdu[3] = p2;
			apdu[4] = (byte)(blockLength);
			System.arraycopy(data, offset, apdu, 5, blockLength);
			result = exchangeCheck(apdu, acceptedSW);
			offset += blockLength;
		}
		return result;
	}

    private byte[] exchangeApduSplit2(byte cla, byte ins, byte p1, byte p2, byte[] data, byte[] data2, int acceptedSW[]) throws BTChipException {
		int offset = 0;
		byte[] result = null;
		int maxBlockSize = 255 - data2.length;
		while (offset < data.length) {
			int blockLength = ((data.length - offset) > maxBlockSize ? maxBlockSize : data.length - offset);
			boolean lastBlock = ((offset + blockLength) == data.length);
			byte[] apdu = new byte[blockLength + 5 + (lastBlock ? data2.length : 0)];
			apdu[0] = cla;
			apdu[1] = ins;
			apdu[2] = p1;
			apdu[3] = p2;
			apdu[4] = (byte)(blockLength + (lastBlock ? data2.length : 0));
			System.arraycopy(data, offset, apdu, 5, blockLength);
			if (lastBlock) {
				System.arraycopy(data2, 0, apdu, 5 + blockLength, data2.length);
			}
			result = exchangeCheck(apdu, acceptedSW);
			offset += blockLength;
		}
		return result;
	}

	public void changePin(byte[] pin) throws BTChipException {
		exchangeApdu(BTCHIP_CLA, BTCHIP_INS_CHANGE_PIN, (byte)0x00, (byte)0x00, pin, OK);
	}
	
	public void verifyPin(byte[] pin) throws BTChipException {
		verifyPin(pin, OK);
	}

	public void verifyPin(byte[] pin, int acceptedSW[]) throws BTChipException {
		exchangeApdu(BTCHIP_CLA, BTCHIP_INS_VERIFY_PIN, (byte)0x00, (byte)0x00, pin, acceptedSW);
	}
	
	public int getVerifyPinRemainingAttempts() throws BTChipException {
		byte response[] = exchangeApdu(BTCHIP_CLA, BTCHIP_INS_VERIFY_PIN, (byte)0x80, (byte)0x00, DUMMY, null);

		if (response.length == 1) {
			return (int) response[0];
		}

		return lastSW;
	}
	
	public BTChipPublicKey getWalletPublicKey(String keyPath) throws BTChipException {
		byte data[] = BIP32Utils.splitPath(keyPath);
		byte response[] = exchangeApdu(BTCHIP_CLA, BTCHIP_INS_GET_WALLET_PUBLIC_KEY, (byte)0x00, (byte)0x00, data, OK);
		int offset = 0;
		byte publicKey[] = new byte[response[offset]];
		offset++;
		System.arraycopy(response, offset, publicKey, 0, publicKey.length);
		offset += publicKey.length;
		byte address[] = new byte[response[offset]];
		offset++;
		System.arraycopy(response, offset, address, 0, address.length);
		offset += address.length;
		byte chainCode[] = new byte[32];
		System.arraycopy(response, offset, chainCode, 0, chainCode.length);
		offset += address.length;		
		return new BTChipPublicKey(publicKey, new String(address), chainCode);
	}

	public byte[] getGenuinenessKey() throws BTChipException {
		byte response[] = exchangeApdu(BTCHIP_CLA, BTCHIP_INS_GET_GENUINENESS_KEY, (byte)0x00, (byte)0x00, DUMMY, OK);
		return response;
	}

	public byte[] proveGenuineness(byte[] challenge) throws BTChipException {
		byte response[] = exchangeApdu(BTCHIP_CLA, BTCHIP_INS_PROVE_GENUINENESS, (byte)0x00, (byte)0x00, challenge, OK);
		response[0] = (byte)0x30;
		return response;
	}

	public boolean signTransactionPrepare(String path, byte[] hash) throws BTChipException {
		ByteArrayOutputStream data = new ByteArrayOutputStream();
		BufferUtils.writeBuffer(data, BIP32Utils.splitPath(path));
		BufferUtils.writeBuffer(data, hash);
		exchangeApdu(BTCHIP_CLA, BTCHIP_INS_SIGN_TRANSACTION, (byte)0x00, (byte)0x00, data.toByteArray(), OK);
		return true;
	}
	
	public byte[] signTransaction() throws BTChipException {
		byte[] response = exchangeApdu(BTCHIP_CLA, BTCHIP_INS_SIGN_TRANSACTION, (byte)0x80, (byte)0x00, 0x00, OK);
		response[0] = (byte)0x30;
		return response;
	}
	
	public BTChipFirmware getFirmwareVersion() throws BTChipException {
		byte[] response = exchangeApdu(BTCHIP_CLA, BTCHIP_INS_GET_FIRMWARE_VERSION, (byte)0x00, (byte)0x00, 0x00, OK);
		int major = (int)(response[0] & 0xff);
		int minor = (int)(response[1] & 0xff);
		int patch = (int)(response[2] & 0xff);
		return new BTChipFirmware(major, minor, patch);
	}

	public byte getState() throws BTChipException {
		byte[] response = exchangeApdu(BTCHIP_CLA, BTCHIP_INS_GET_STATE, (byte)0x00, (byte)0x00, 0x00, OK);
		return response[0];
	}

	public byte getCurrentMode() throws BTChipException {
		byte[] response = exchangeApdu(BTCHIP_CLA, BTCHIP_INS_GET_MODE, (byte)0x00, (byte)0x00, 0x00, OK);
		return response[0];
	}

	public boolean setup(OperationMode supportedOperationModes[], int keyVersion, int keyVersionP2SH) throws BTChipException {
		return setup(supportedOperationModes, keyVersion, keyVersionP2SH, null, null);
	}

	public boolean setup(OperationMode supportedOperationModes[], int keyVersion, int keyVersionP2SH, byte[] userPin, byte[] seed) throws BTChipException {
		int operationModeFlags = 0;
		ByteArrayOutputStream data = new ByteArrayOutputStream();
		for (OperationMode currentOperationMode : supportedOperationModes) {
			operationModeFlags |= currentOperationMode.getValue();
		}
		data.write(operationModeFlags);
		data.write(keyVersion);
		data.write(keyVersionP2SH);

		if (operationModeFlags == 0x08) {
			// PIN
			if (userPin == null || (userPin.length < 0x04) || (userPin.length > 0x20)) {
				throw new BTChipException("Invalid user PIN length");
			}
			data.write(userPin.length);
			BufferUtils.writeBuffer(data, userPin);

			// SEED
			if (seed == null || (seed.length != 64)) {
				throw new BTChipException("Invalid seed length");
			}
			BufferUtils.writeBuffer(data, seed);
		}

		exchangeApdu(BTCHIP_CLA, BTCHIP_INS_SETUP, (byte)0x00, (byte)0x00, data.toByteArray(), OK);
		return true;
	}

	public boolean changeNetwork(int keyVersion, int keyVersionP2SH) throws BTChipException {
		ByteArrayOutputStream data = new ByteArrayOutputStream();
		data.write(keyVersion);
		data.write(keyVersionP2SH);

		exchangeApdu(BTCHIP_CLA, BTCHIP_INS_CHANGE_NETWORK, (byte)0x00, (byte)0x00, data.toByteArray(), OK);
		return true;
	}

	public byte[] randomSeedWords() throws BTChipException {
		return exchangeApdu(BTCHIP_CLA, BTCHIP_INS_PREPARE_SEED, (byte)0x00, (byte)0x00, DUMMY, OK);
	}

	public void erase() throws BTChipException {
		exchangeApdu(BTCHIP_CLA, BTCHIP_INS_ERASE, (byte)0x00, (byte)0x00, DUMMY, OK);
	}

	public void prepareSeed(byte[] seed) throws BTChipException {
		ByteArrayOutputStream data = new ByteArrayOutputStream();

		if ((seed.length != 64)) {
			throw new BTChipException("Invalid seed length");
		}
		BufferUtils.writeBuffer(data, seed);

		exchangeApdu(BTCHIP_CLA, BTCHIP_INS_PREPARE_SEED, (byte)0x80, (byte)0x00, data.toByteArray(), OK);
	}

	public void validateSeed(byte[] seed) throws BTChipException {
		ByteArrayOutputStream data = new ByteArrayOutputStream();

		if ((seed.length != 64)) {
			throw new BTChipException("Invalid seed length");
		}
		BufferUtils.writeBuffer(data, seed);

		exchangeApdu(BTCHIP_CLA, BTCHIP_INS_VALIDATE_SEED_BACKUP, (byte)0x00, (byte)0x00, data.toByteArray(), OK);
	}

	public ResponseAPDU sendRawAPDU(byte[] cmd, byte[] data) throws BTChipException {
        CommandAPDU commandAPDU = new CommandAPDU(APDUUtils.buildApdu(cmd, data));
        return new ResponseAPDU(exchange(commandAPDU.getBytes(), true));
    }
}
