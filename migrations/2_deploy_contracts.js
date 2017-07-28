var DistributedSchedule = artifacts.require("./DistributedSchedule.sol");

module.exports = function(deployer) {
  deployer.deploy(DistributedSchedule);
};
