// Specifically request an abstraction for Didle
var Didle = artifacts.require("Didle");
const eutil = require('ethereumjs-util')


contract('Didle', function(accounts) {

    var sender = accounts[0];
    
  it("should initialize a new voting", function() {
    var signer = accounts[1];
    var didle;
      
    return Didle.deployed().then((instance) => {
      didle = instance;
      return didle.create(signer, "SoftwareMill Birr June 2017", ['aa', 'bb']);
    }).then(() => {
        return didle.voteSummary.call(signer);
    }).then((voting) => {
          assert.equal(voting[0], "SoftwareMill Birr June 2017");
          assert.equal(web3.toUtf8(voting[1][0]), ['aa']);
          assert.equal(web3.toUtf8(voting[1][1]), ['bb']);
        });
  });

  it("should not initialize a new voting when a voting exists for given signer", function() {
    var signer = accounts[2];

    return Didle.deployed().then((instance) => {
      return didle.create(signer, "First voting", ['a', 'b']);
    }).then(() => {
        return didle.create(signer, "Second voting, for the same signer account", ['a', 'b']);
    }).catch((error)  => {
      return assert.equal(true, true);
    });
  });
  
  function signAddress(signer, address, didle) {
      var msg = new Buffer(address);
      var sig = web3.eth.sign(signer, '0x' + msg.toString('hex'));
      var res0 = eutil.fromRpcSig(sig);        
      const prefixStr = "\x19Ethereum Signed Message:\n";
      const prefix = new Buffer(prefixStr);
      const bufferToHash = Buffer.concat([prefix, new Buffer(String(msg.length)), msg]);
      const prefixedMsgHash = eutil.sha3(bufferToHash);
      
      return {
        h: eutil.bufferToHex(prefixedMsgHash),
        r: eutil.bufferToHex(res0.r),
        s: eutil.bufferToHex(res0.s),
        v: res0.v
      }
  }

  it("should emit an event when adding a vote", function() {
    var signer = accounts[7];
    var didle;
    var proposalIndex = 0; // 'x'
      
    return Didle.deployed().then((instance) => {
      didle = instance;
      return didle.create(signer, "A meeting", ['x', 'y']);
    }).then(r => {
        var sig = signAddress(signer, sender, didle);
        return didle.vote("Bob", 0, sig.h, sig.r, sig.s, sig.v);
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
    
});
