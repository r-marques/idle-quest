import { HardhatUserConfig, vars } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const INFURA_API_KEY = vars.get('INFURA_API_KEY', 'default-for-CI');
const BASE_SEPOLIA_PRIVATE_KEY = vars.get(
  'BASE_SEPOLIA_PRIVATE_KEY',
  'default-for-CI',
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
