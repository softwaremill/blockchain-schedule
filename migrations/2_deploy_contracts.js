var DecentralizedSchedule = artifacts.require("./DecentralizedSchedule.sol");

module.exports = function(deployer) {
  deployer.deploy(DecentralizedSchedule);
};
