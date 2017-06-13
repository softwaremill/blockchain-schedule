// Specifically request an abstraction for Didle
var Didle = artifacts.require("Didle");


// the size of a character in a hex string in bytes
const HEX_CHAR_SIZE = 4

// the size to hash an integer if not explicity provided
const DEFAULT_SIZE = 256;


contract('Didle', function(accounts) {

    var sender = accounts[0];
    
    it("should initialize a new voting", function() {
    var signer = accounts[1];
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
    var signer = accounts[2];
      
    return Didle.deployed().then((instance) => {
      return didle.create(signer, "First voting", false, ['a', 'b']);
    }).then(() => {
        return didle.create(signer, "Second voting, for the same signer account", false, ['a', 'b']);
    }).catch((error)  => {
      return assert.equal(true, true);
    });
  });

  // -------------- sha3 utils, because web3.sha3(address) returns different result than sha3() in solidity
  function encodeWithPadding(size, value) {
   return typeof value === 'string'
     // non-hex string
     ? web3.toHex(value)
     // numbers, big numbers, and hex strings
     : encodeNum(size)(value)
  }
    
  const encodeNum = size => value => {
    return leftPad(web3.toHex(value < 0 ? value >>> 0 : value).slice(2), size / HEX_CHAR_SIZE, value < 0 ? 'F' : '0')
  }

  function sha3Address(address) {
     var paddedArgs = encodeWithPadding(DEFAULT_SIZE, address);
     return web3.sha3(paddedArgs, { encoding: 'hex' });
  }
  // -------------------sha3 utils  

  function signAddress(signer, address) {
        // sign sender address with signer's private key        
        var hash = sha3Address(address); //we hash the original message to keep it as 32 bytes, regardless to the input size.
        var signedMsg = web3.eth.sign(signer, hash);
        vTab = new Buffer(signedMsg.slice(130, 132), "hex"); // we care for the numeric value. The Ethereum function expects uint8 and not hex.
        var ver = vTab[0].valueOf();
      if (ver <= 1)
          ver += 27;
      
        return {
          h: hash,          
          r: "0x" + signedMsg.slice(2, 66), //Treated as hex,
          s: "0x" + signedMsg.slice(66, 130), //treated as hex
          v: ver
      }
  }
    
  it("should add a vote", function() {
    var signer = accounts[3];
    var didle;
    var createResult;
    var proposalIndex = 0; // 'a'
      
    return Didle.deployed().then((instance) => {
      didle = instance;
      return didle.create(signer, "A huge fat party", false, ['a', 'b']);
    }).then(r => {
        var sig = signAddress(signer, sender);
        return didle.vote("Bob", proposalIndex, sig.h, sig.r, sig.s, sig.v);
    }).then(r => {
       return didle.voteCount.call(signer, proposalIndex);
    }).then(c => {
       assert.equal(c, 1);
    });
  });

});
