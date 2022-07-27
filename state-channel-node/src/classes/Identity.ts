import Participant from "./Participant";

type Bytes = ArrayLike<number>;

export interface Wallet {
  signMessage(message: Bytes): Promise<string>;
}

export default class Identity {
  me: Participant;
  wallet: Wallet

  constructor(me: Participant, wallet: Wallet) {
    this.me = me;
    this.wallet = wallet;
  }
}