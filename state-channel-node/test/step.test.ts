process.env.NODE_ENV = 'test';

import chai from 'chai';
import Participant from '../src/classes/Participant';
import Step from '../src/classes/Step';
import {ethers} from 'ethers';
const {expect} = chai;

describe('Dry test signature functions', () => {

  it('test signing and verifying', async () => {
    const wallet = ethers.Wallet.createRandom();

    const step = new Step({
      from: Participant.BulkBuyer,
      caseID: 0,
      taskID: 0
    })
    await step.sign(wallet);
    expect(step.verifySignature(wallet.address), "verify signature...").to.be.true

    step.taskID = 1;
    expect(step.verifySignature(wallet.address), "verify signature...").to.be.false;

    const eve = ethers.Wallet.createRandom();
    await step.sign(eve);
    expect(step.verifySignature(wallet.address), "verify signature...").to.be.false;
  });

});