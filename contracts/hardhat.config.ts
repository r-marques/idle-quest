import { HardhatUserConfig, vars } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

// Random defaults so that hardhat does not fail when developing locally
// and the vars are not set
const INFURA_API_KEY = vars.get('INFURA_API_KEY', 'apikey');
const BASE_SEPOLIA_PRIVATE_KEY = vars.get(
  'BASE_SEPOLIA_PRIVATE_KEY',
  '0xadf600bca523b58ffda76eda51c29c378451a9803f506361a1f906da4df1de78',
);

const config: HardhatUserConfig = {
  solidity: '0.8.28',
  networks: {
    'base-sepolia': {
      url: `https://base-sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [BASE_SEPOLIA_PRIVATE_KEY],
    },
  },
};

export default config;
