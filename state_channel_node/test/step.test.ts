process.env.NODE_ENV = 'test';

import chai from 'chai';
import Participant from '../src/classes/Participant';
import Step from '../src/classes/Step';
import {ethers} from 'ethers';
const {expect} = chai;

describe('Dry test functions', () => {

  it('test signing and verifying', async () => {
    const wallet = ethers.Wallet.createRandom();

    const step = new Step({
      from: Participant.BulkBuyer,
      caseID: 0,
      taskID: 0,
      newTokenState: []
    })
    await step.sign(wallet, step.from);
    expect(step.verifySignature(wallet.address, step.signature[step.from]), "verify signature...").to.be.true

    step.taskID = 1;
    expect(step.verifySignature(wallet.address, step.signature[step.from]), "verify signature...").to.be.false;

    const eve = ethers.Wallet.createRandom();
    await step.sign(eve, step.from);
    expect(step.verifySignature(wallet.address, step.signature[step.from]), "verify signature...").to.be.false;
  });

});