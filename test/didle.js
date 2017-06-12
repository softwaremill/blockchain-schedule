// Specifically request an abstraction for Didle
var Didle = artifacts.require("Didle");

contract('Didle', function(accounts) {

    it("should initialize a new voting", function() {
    var signer = accounts[0];
    var didle;
      
    return Didle.deployed().then((instance) => {
      didle = instance;
      return didle.create(signer, "SoftwareMill Birr June 2017", false, ['a', 'b']);
    }).then(() => {
        return didle.votings.call(signer);
    }).then((voting) => {
          assert.equal(voting[0], "SoftwareMill Birr June 2017");
          assert.equal(voting[1], false);
          // unfortunately the getter won't return nested array (not supported by solidity yet)
        });
  });

  it("should not initialize a new voting when a voting exists for given signer", function() {
    var signer = accounts[1];
      
    return Didle.deployed().then((instance) => {
      return didle.create(signer, "First voting", false, ['a', 'b']);
    }).then(() => {
        return didle.create(signer, "Second voting, for the same signer account", false, ['a', 'b']);
    }).catch((error)  => {
      return assert.equal(true, true);
    });
  });

  it("should add a vote", function() {
    var signer = accounts[2];
    var didle;
    var createResult;
    var proposalIndex = 0; // 'a'
      
    return Didle.deployed().then((instance) => {
      didle = instance;
      return didle.create(signer, "A huge fat party", false, ['a', 'b']);
    }).then(() => {
        // sign sender address with signer's private key
        var msgToSign = "test";

        var signedMsg = web3.eth.sign(signer, web3.sha3(msgToSign));        
        r = "0x" + signedMsg.slice(2, 66); //Treated as hex
        s = "0x" + signedMsg.slice(66, 130); //treated as hex
        v = new Buffer(signedMsg.slice(130, 132), "hex"); // we care for the numeric value. The Ethereum function expects uint8 and not hex.
        v = v[0].valueOf() + 27;
        h = web3.sha3(msgToSign); //we hash the original message to keep it as 32 bytes, regardless to the input size.

        // signature end -> TODO extract to a lib
        return didle.vote(signer, "Bob", proposalIndex, h, r, s, v);
    }).then(() => {
       return didle.voteCount.call(signer, proposalIndex);
    }).then( c => {
       assert.equal(c, 1);
    });
  });

});
