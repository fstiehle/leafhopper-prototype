import Participant from "./Participant";
import { ethers } from 'ethers';

export type Wallet = ethers.Signer;

export default class Identity {
  me: Participant;
  wallet: Wallet

  constructor(me: Participant, wallet: Wallet) {
    this.me = me;
    this.wallet = wallet;
  }
}