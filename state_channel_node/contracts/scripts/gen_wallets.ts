import { ethers } from "ethers"

const AMOUNT = 5;
for (let index = 0; index < AMOUNT; index++) {
  const wallet = ethers.Wallet.createRandom();
  console.log('created with MNEMONIC: ', wallet.mnemonic);
  console.log('and address: ', wallet.address)
}