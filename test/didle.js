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
    console.log(signer);
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
        var vTab = new Buffer(signedMsg.slice(130, 132), "hex"); // we care for the numeric value. The Ethereum function expects uint8 and not hex.
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
    var proposalIndex = 0; // 'a'
      
    return Didle.deployed().then((instance) => {
      didle = instance;
      return didle.create(signer, "A huge fat party", false, ['a', 'b']);
    }).then(r => {
        var sig = signAddress(signer, sender);
        return didle.vote("Bob", proposalIndex, sig.h, sig.r, sig.s, sig.v);
    }).then(r => {
        console.log(">>>>>>>>>>>");

        return didle.voteCount.call(signer, proposalIndex);
    }).then(c => {
       assert.equal(c, 1);
    });
  });

  it("emit an event when adding a vote", function() {
    var signer = accounts[7];
    var didle;
    var proposalIndex = 0; // 'a'
      
    return Didle.deployed().then((instance) => {
      didle = instance;
      return didle.create(signer, "Secret meeting", false, ['x', 'y']);
    }).then(r => {
        var sig = signAddress(signer, sender);
        return didle.voteE("Bob", proposalIndex, sig.h, sig.r, sig.s, sig.v);
    }).then(r => {
       var voteEvents = didle.VoteSingle({signer: signer});
        voteEvents.watch(function(err, result) {
            if (err) {
                console.log(err);
                assert.equal(1, 0);
                return;
            }
            var event = result.args;
            assert.equal(event.voter, sender);
            assert.equal(event.signer, signer);
            assert.equal(event.voterName, "Bob");
            assert.equal(event.proposal, 0);
            return;
        })
    });
  });

  it("should add a vote and then update it", function() {
    var signer = accounts[4];
    var didle;
    var proposalIndex1 = 0; // 'a'
    var proposalIndex2 = 1; // 'a'

    var voteCountProposalIndex0 = 0;      
    var voteCountProposalIndex1 = 0;
    var sig = signAddress(signer, sender);
          
    return Didle.deployed().then((instance) => {
      didle = instance;
      return didle.create(signer, "Meeting at the opera", false, ['a', 'b']);
    }).then(() => {
        return didle.vote("Bob", proposalIndex1, sig.h, sig.r, sig.s, sig.v);
    }).then(() => {
        return didle.vote("Bob", proposalIndex2, sig.h, sig.r, sig.s, sig.v);
    }).then(() => {
       return didle.voteCount.call(signer, proposalIndex1);
    }).then(c => {
       voteCountProposalIndex0 = c;
       return didle.voteCount.call(signer, proposalIndex2);
    }).then(c => {
       voteCountProposalIndex1 = c;
       assert.equal(voteCountProposalIndex0, 0);
       assert.equal(voteCountProposalIndex1, 1);
    });
  });

 it("should cast a multivote", function() {
    var signer = accounts[5];
    var didle;
    var yesIndex1 = 0;
    var yesIndex2 = 2;
    var noIndex = 1;

    var voteCountIndex0 = 0;
    var voteCountIndex1 = 0;
    var voteCountIndex2 = 0;
     
    var sig = signAddress(signer, sender);
          
    return Didle.deployed().then((instance) => {
      didle = instance;
      return didle.create(signer, "Meeting at the opera", true, ['a', 'b', 'c']);
    }).then(() => {
        return didle.voteMulti("Bob", [yesIndex1, yesIndex2], [noIndex], sig.h, sig.r, sig.s, sig.v);
    }).then(() => {
       return didle.voteCount.call(signer, 0);
    }).then(c => {
       voteCountIndex0 = c;
       return didle.voteCount.call(signer, 1);
    }).then(c => {
       voteCountIndex1 = c;
       return didle.voteCount.call(signer, 2);
    }).then(c => {
       voteCountIndex2 = c;
       assert.equal(voteCountIndex0, 1);
       assert.equal(voteCountIndex1, -1);
       assert.equal(voteCountIndex2, 1);
    });
  });

  it("should overwrite a multivote", function() {
    var signer = accounts[6];
    var didle;
    var yesIndex1 = 0;
    var yesIndex2 = 2;
    var noIndex = 1;

    var voteCountIndex0 = 0;
    var voteCountIndex1 = 0;
    var voteCountIndex2 = 0;
     
    var sig = signAddress(signer, sender);
          
    return Didle.deployed().then((instance) => {
      didle = instance;
      return didle.create(signer, "Meeting at the opera2", true, ['a', 'b', 'c']);
    }).then(() => {
        return didle.voteMulti("Bob", [yesIndex1, yesIndex2], [noIndex], sig.h, sig.r, sig.s, sig.v);
    }).then(() => {
        return didle.voteMulti("Bob", [0, 1], [2], sig.h, sig.r, sig.s, sig.v);
    }).then(() => {
       return didle.voteCount.call(signer, 0);
    }).then(c => {
       voteCountIndex0 = c;
       return didle.voteCount.call(signer, 1);
    }).then(c => {
       voteCountIndex1 = c;
       return didle.voteCount.call(signer, 2);
    }).then(c => {
       voteCountIndex2 = c;
       assert.equal(voteCountIndex0, 1);
       assert.equal(voteCountIndex1, 1);
       assert.equal(voteCountIndex2, -1);
    });
  });

   
    

});
