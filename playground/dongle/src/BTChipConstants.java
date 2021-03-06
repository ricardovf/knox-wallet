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

public interface BTChipConstants {
    byte CLA = (byte) 0xE0;
    byte INS_SETUP = (byte) 0x20;
    byte INS_VERIFY_PIN = (byte) 0x22;
    byte INS_PIN_VERIFIED = (byte) 0x62;
    byte INS_CHANGE_PIN = (byte) 0x4B;
    byte INS_PREPARE_SEED = (byte) 0x4C;
    byte INS_GET_GENUINENESS_KEY = (byte) 0x4D;
    byte INS_PROVE_GENUINENESS = (byte) 0x4F;
    byte INS_CHANGE_NETWORK = (byte) 0x50;
    byte INS_VALIDATE_SEED_BACKUP = (byte) 0x52;
    byte INS_SIGN_TRANSACTION = (byte) 0x54;
    byte INS_GET_STATE = (byte) 0x56;
    byte INS_GET_MODE = (byte) 0x60;
    byte INS_ERASE = (byte) 0x58;
    byte INS_GET_WALLET_PUBLIC_KEY = (byte) 0x40;
    byte INS_GET_FIRMWARE_VERSION = (byte) 0xC4;

    int SW_OK = 0x9000;
}
