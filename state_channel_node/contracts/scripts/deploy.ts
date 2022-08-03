import leafhopper from '../../leafhopper.config';
import { ethers } from 'hardhat';

(async () => {

  const factory = await ethers.getContractFactory('SupplyChainRoot');

  const supplyChainRoot = await factory.deploy(
    [
      leafhopper.participants[0].address,
      leafhopper.participants[1].address,
      leafhopper.participants[2].address,
      leafhopper.participants[3].address,
      leafhopper.participants[4].address
    ]
  );

  const receipt = await supplyChainRoot.deployTransaction.wait(1);

  console.log('To network:', await supplyChainRoot.provider.getNetwork());
  console.log('BENCHMARK: Gas used for contract deployment:', receipt.gasUsed);
  /// Gas used for contract deployment: BigNumber { value: "2728689" }
  /// SupplyChainRoot deployed to: 0x2ffE7550b89b9F40Df138E89C2520EB5b00E7657

  console.log(`CONTRACT_BEGIN${supplyChainRoot.address}CONTRACT_END`);

})()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error.message);
  process.exit(1);
});