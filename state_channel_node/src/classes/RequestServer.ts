import https from 'https';
import RoutingInformation from '../classes/RoutingInformation';

export default class RequestServer {
  rootCA: string;

  constructor(rootCA: string) {
    this.rootCA = rootCA;
  }
  
  /**
   * Modified from: https://stackoverflow.com/a/56122489
   * Do a request with options provided.
   *
   * @param {Object} options
   * @param {string} data
   * @return {Promise} a promise of request
   */
  doRequest(options: RoutingInformation, data: string): Promise<string> {
    console.log(`${options.method} request to ${options.hostname}:${options.port}${options.path}`);
    return new Promise((resolve, reject) => {
      const req = https.request({...options, ca: this.rootCA}, (res) => {
        res.setEncoding('utf8');
        let responseBody = '';
  
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
  
        res.on('end', () => {
          if (res.statusCode !== 200)
            return reject(new Error(`Error when trying to reach next participant: ${res.statusCode} ${res.statusMessage}`));
  
          try {
            resolve(JSON.parse(responseBody));
          } catch (error) {
            throw new Error(error);
          }
        });
      });
  
      req.on('error', (err) => {
        reject(err);
      });
  
      req.write(data)
      req.end();
    });
  }
}