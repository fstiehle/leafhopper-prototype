process.env.NODE_ENV = 'test';

import chai from 'chai';
import Participant from '../src/classes/Participant';
import Step from '../src/classes/Step';
import crypto from 'crypto';
const {expect} = chai;

describe('Dry test signature functions', () => {

  it('test signing and verifying', (done) => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      // The standard secure default length for RSA keys is 2048 bits
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: 'test environment ' + Participant.BulkBuyer
      }
    });

    const step = new Step({
      from: Participant.BulkBuyer,
      caseID: 0,
      taskID: 0
    })
    step.sign(privateKey)
    expect(step.verifySignature(publicKey), "verify signature...").to.be.true

    done();
  });

});