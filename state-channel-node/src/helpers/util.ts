import http from 'http';
import RoutingInformation from '../classes/RoutingInformation';

/**
 * Modified from: https://stackoverflow.com/a/56122489
 * Do a request with options provided.
 *
 * @param {Object} options
 * @param {string} data
 * @return {Promise} a promise of request
 */
const doRequest = (options: RoutingInformation, data: string): Promise<string> => {
  console.log(`${options.method} request to ${options.hostname}:${options.port}${options.path}`);
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      res.setEncoding('utf8');
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200)
          return reject(new Error(`Error when trying to reach next participant: ${res.statusCode} ${res.statusMessage}`));

        try {
          console.log("Parse JSON response...")
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

export {
  doRequest
}