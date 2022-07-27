import crypto from 'crypto';
import {ethers} from 'ethers';
import {Wallet} from './Identity';

export interface SignablePart {
  types: string[];
  value: any[];
}

export default abstract class Signable {
  salt: string = "";
  signature: string = "";

  abstract getSignablePart(withSignature?: boolean): SignablePart;

  async sign(wallet: Wallet) {
    this.salt = '0x' + crypto.randomBytes(16).toString('hex');
    const signable = this.getSignablePart();
    const encoder = new ethers.utils.AbiCoder();
    try {
      this.signature = await wallet.signMessage(
        ethers.utils.arrayify(
          ethers.utils.keccak256(
            encoder.encode(signable.types, signable.value)
          )
        )
      );
    } catch (err) {
      console.error(err);
    };
  }

  verifySignature(expectedAddress: string): boolean {
    const signable = this.getSignablePart();
    const encoder = new ethers.utils.AbiCoder;
    let address;
    console.log(signable.value);
    try {
      address = ethers.utils.verifyMessage(
        ethers.utils.arrayify(
          ethers.utils.keccak256(
            encoder.encode(signable.types, signable.value)
          )
        ),
        this.signature
      )
    } catch (err) {
      console.error(err);
    };
    return expectedAddress === address;
  }
}