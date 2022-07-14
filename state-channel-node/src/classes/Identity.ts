import Participant from "./Participant";

export default interface Identity {
  me: Participant;
  publicKey: string;
  privateKey: string;
}
