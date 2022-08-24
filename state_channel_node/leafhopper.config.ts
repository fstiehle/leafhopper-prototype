import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

const leafhopper = {
  identity: process.env.APP_IDENTITY!,
  mnemonic: process.env.APP_MNEMONIC!,

  contract: {
    address: process.env.APP_ADDRESS_CONTRACT!,
    deployFrom: {
      mnemonic: process.env.APP_DEPLOY_MNEMONIC!,
    },
    deployTo: {
      network: 'localhost',
      rpc: 'http://127.0.0.1:8545'
    },
    apikeys: {
      etherscan: "P9KCHUFR52IPJBB4RQCHWZXNCR3718VDS5"
    }
  },
  participants: [
    { 
      id: 0,
      address: "0xc825089A82DE2F9Bb23373f8B447f5783E661DDC",
      local_port: 8000,
      test_mnemonic: "decline fantasy twist absent spike life shoe split that brush dutch record"
    },
    {
      id: 1,
      address: "0x5fab6aDD5660AfA57fdD32A768FA0FA3F88F677c",
      local_port: 8001,
      test_mnemonic: "festival enroll attitude prepare throw insect drink dinosaur middle voice gold fault"
    },
    {
      id: 2,
      address: "0x66E67E0AE5A7B9BA53bc655B46C8d1d311aa9bfc",
      local_port: 8002,
      test_mnemonic: "festival iron churn learn alcohol joke add sunset position park melt recycle"
    },
    {
      id: 3,
      address: "0x91F7b8c40E196D726110eC1ECB831d74f3606a92",
      local_port: 8003,
      test_mnemonic: "bind craft broken bachelor imitate alcohol lamp pizza gate ten tag erode"
    },
    {
      id: 4,
      address: "0xc9C6f04461D5E3edf1e3e76EC55c83DE5e14903b",
      local_port: 8004,
      test_mnemonic: "item begin absurd result crawl purse vibrant salt below dash sketch refuse"
    }
  ]
}

export default leafhopper;