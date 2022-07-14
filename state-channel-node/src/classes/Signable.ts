import crypto from 'crypto';

export default abstract class Signable {
  salt: string;
  signature: string;

  abstract getSignablePart(): object;
  
  sign(privateKey: string, passphrase: string) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.signature = crypto
      .createSign('sha256')
      .update(JSON.stringify(this.getSignablePart()))
      .end()
      .sign({
        key: privateKey, 
        passphrase})
      .toString('hex');
    return this;
  }
  
  verifySignature(publicKey: string): boolean {
    return crypto.createVerify('sha256')
      .update(JSON.stringify(this.getSignablePart()))
      .end()
      .verify(publicKey, this.signature, 'hex');
  }

}

