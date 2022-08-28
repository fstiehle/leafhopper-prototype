import { HardhatUserConfig } from 'hardhat/config';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-solhint';
import 'solidity-coverage';
import '@nomiclabs/hardhat-etherscan';

import { ethers } from 'ethers';
import leafhopper from '../leafhopper.config'

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const config: HardhatUserConfig = {
  solidity: '0.8.9',
  defaultNetwork: leafhopper.contract.deployTo.network,
  networks: {
    hardhat: {
      accounts: [
        leafhopper.contract.deployFrom.mnemonic,
        ...leafhopper.participants.flatMap((p) => p.test_mnemonic)
      ] 
      .flatMap(m => { return { privateKey: ethers.Wallet.fromMnemonic(m).privateKey, balance: Math.pow(10, 18).toString() }}) 
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    rinkeby: {
      url: "https://api-rinkeby.etherscan.io/",
      accounts: {
        mnemonic: leafhopper.contract.deployFrom.mnemonic
      }
    }
  },
  paths: {
    sources: "./src"
  },
};

export default config;