import crypto from 'crypto';
import {ethers} from 'ethers';
import {Wallet} from './Identity';
import Participant from './Participant';

export interface SignablePart {
  types: string[];
  // eslint-disable-next-line
  value: any[];
}

/* Provide crypographic signature functionality */
export default abstract class Signable {
  salt = "";
  signature = new Array<string>();

  abstract getSignablePart(withSignature?: boolean): SignablePart;

  async sign(wallet: Wallet, signee: Participant) {
    this.salt = this.salt ? this.salt : '0x' + crypto.randomBytes(16).toString('hex');
    const signable = this.getSignablePart();
    const encoder = new ethers.utils.AbiCoder();
    try {
      this.signature[signee] = await wallet.signMessage(
        ethers.utils.arrayify(
          ethers.utils.keccak256(
            encoder.encode(signable.types, signable.value)
          )
        )
      );
    } catch (err) {
      console.error('sign error', err);
    }
  }

  verifySignature(expectedAddress: string, signature: string): boolean {
    const signable = this.getSignablePart();
    const encoder = new ethers.utils.AbiCoder;
    let address;
    try {
      address = ethers.utils.verifyMessage(
        ethers.utils.arrayify(
          ethers.utils.keccak256(
            encoder.encode(signable.types, signable.value)
          )
        ),
        signature
      )
    } catch (err) {
      console.error('verify sign error', err);
    }
    return expectedAddress === address;
  }
}