/**
 * Contract addresses and configurations
 */

// For Alfajores testnet
export const ALFAJORES_CONTRACTS = {
  BETTING_FACTORY_ADDRESS: process.env.NEXT_PUBLIC_BETTING_FACTORY_ADDRESS || "",
  MOCK_TOKEN_ADDRESS: process.env.NEXT_PUBLIC_MOCK_TOKEN_ADDRESS || "",
  cUSD_TOKEN_ADDRESS: "0x765de816845861e75a25fca122bb6898b8b1282a",
  VALORA_NFT_CONTRACT: "0xDEd283f8Cc841a53BC2A85AD106b2654E650Cc7f",
};

// For Celo Mainnet - TBD
export const MAINNET_CONTRACTS = {
  BETTING_FACTORY_ADDRESS: "",
  MOCK_TOKEN_ADDRESS: "",
  cUSD_TOKEN_ADDRESS: "",
};

// Set the active network based on environment
export const ACTIVE_CONTRACTS = 
  process.env.NEXT_PUBLIC_NETWORK === "mainnet" 
    ? MAINNET_CONTRACTS 
    : ALFAJORES_CONTRACTS; 