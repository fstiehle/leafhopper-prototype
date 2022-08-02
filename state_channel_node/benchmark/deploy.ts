import { execSync } from 'node:child_process';

/***
 * Prepare a benchmark
 * Deploy the smart contract and set up docker compose network attached to the contract address
 */
(async () => {

  console.log("Deploying smart contract ...");
  console.log('npm run deploy, in', process.env.PWD + '/contracts/');
  const bash = execSync('npm run deploy', { cwd: process.env.PWD + '/contracts/', stdio: 'inherit' });
  const regex = new RegExp(/CONTRACT_BEGIN\w*CONTRACT_END/g);
  const res = regex.exec(bash.toString());
  if (res.length === 0) return console.log('Contract deployment failed', bash);
  const rootAddress = regex.exec(bash.toString()).pop()
  .replace("CONTRACT_BEGIN", "")
  .replace("CONTRACT_END", "");

  console.log("Running docker compose ...");
  console.log(`ROOT=${rootAddress} docker compose up`);
  execSync(`ROOT=${rootAddress} docker compose up`, { stdio: 'inherit' });

})()
.then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });