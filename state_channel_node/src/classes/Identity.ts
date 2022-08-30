import Participant from "./Participant";
import { ethers } from 'ethers';

export type Wallet = ethers.Signer;

/* Encapsulating the information a node must have of itself. */
export default class Identity {
  me: Participant;
  wallet: Wallet

  constructor(me: Participant, wallet: Wallet) {
    this.me = me;
    this.wallet = wallet;
  }
}