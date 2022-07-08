process.env.NODE_ENV = 'test';

import express, { Express, Request, Response } from 'express';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { app, configureServer } from '../src/app';

chai.use(chaiHttp);
describe('/GET begin and /POST step', () => {
  let manufacturer: Express;
  let bulkbuyer: Express;

  before(() => {
    manufacturer = configureServer(express());
    manufacturer.listen(9002, () => console.log(`Manufacturer Running on 9002 ⚡`));
    bulkbuyer = configureServer(express());
    bulkbuyer.listen(9001, () => console.log(`Bulk Buyer Running on 9001 ⚡`));
  })

  it('not sure what will happen', (done) => {
    const requestForManufacturer = chai.request(manufacturer).keepOpen()
    
    chai.request(bulkbuyer)
      .get('/begin/0')
      .end((err, res) => {
        console.log(res.status);
        requestForManufacturer.close();
      done();
    });
  });

});