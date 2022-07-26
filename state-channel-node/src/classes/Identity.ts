import Participant from "./Participant";

export interface Wallet {
  signMessage(message: string): Promise<string>;
}

export default class Identity {
  me: Participant;
  wallet: Wallet

  constructor(me: Participant, wallet: Wallet) {
    this.me = me;
    this.wallet = wallet;
  }
}
