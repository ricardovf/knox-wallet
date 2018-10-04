// Commands
export const CLA = 0xe0;
export const INS_SETUP = 0x20;
export const INS_VERIFY_PIN = 0x22;
export const INS_PIN_VERIFIED = 0x62;
export const INS_CHANGE_PIN = 0x4b;
export const INS_PREPARE_SEED = 0x4c;
export const INS_GET_GENUINENESS_KEY = 0x4d;
export const INS_PROVE_GENUINENESS = 0x4f;
export const INS_CHANGE_NETWORK = 0x50;
export const INS_VALIDATE_SEED_BACKUP = 0x52;
export const INS_SIGN_TRANSACTION = 0x54;
export const INS_GET_STATE = 0x56;
export const INS_GET_MODE = 0x60;
export const INS_ERASE = 0x58;
export const INS_GET_WALLET_PUBLIC_KEY = 0x40;
export const INS_GET_FIRMWARE_VERSION = 0xc4;
export const SW_OK = 0x9000;

// Wallet states
export const STATE_INSTALLED = 0x00;
export const STATE_SETUP_DONE = 0x11;
export const STATE_PIN_SET = 0x22;
export const STATE_READY = 0x33;

// Wallet modes
export const MODE_WALLET = 0x01;
export const MODE_DEVELOPMENT = 0x08;
export const USER_CONFIRMATION_NONE = 0x00;

// Bitcoin network
export const BITCOIN_TESTNET_VERSION = 111;
export const BITCOIN_TESTNET_P2SH_VERSION = 196;

export const PIN_MIN_LENGTH = 4;
export const PIN_MAX_LENGTH = 12;
export const PIN_MAX_ATTEMPTS = 5;
