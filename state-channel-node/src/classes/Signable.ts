import crypto from 'crypto';
import {ethers} from 'ethers';
import {Wallet} from './Identity';

export interface SignablePart {
  types: Record<string, any[]>;
  value: Record<string, any>;
}

export default abstract class Signable {
  salt: string;
  signature: string;

  domain = {
    name: "leafhopper",
    version: "0.1",
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
  }

  abstract getSignablePart(): SignablePart;

  async sign(wallet: Wallet) {
    this.salt = '0x' + crypto.randomBytes(16).toString('hex');
    const signable = this.getSignablePart();
    try {
      this.signature = await wallet.signMessage(
        ethers.utils._TypedDataEncoder.encode(
          this.domain,
          signable.types,
          signable.value
        )
      );
    } catch (err) {
      console.error(err);
    };
  }

  verifySignature(expectedAddress: string): boolean {
    const signable = this.getSignablePart();
    const address = ethers.utils.verifyMessage(
      ethers.utils._TypedDataEncoder.encode(
        this.domain,
        signable.types,
        signable.value
      ),
      this.signature
    );
    return expectedAddress === address;
  }
}