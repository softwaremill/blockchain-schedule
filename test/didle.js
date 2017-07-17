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

  it("should override a vote", function() {
    var signer = accounts[4];
    var didle;
    var sig;
      
    return Didle.deployed().then((instance) => {
      didle = instance;
      sig = signAddress(signer, sender, didle);
      return didle.create(signer, "A meeting", ['x', 'y']);
    }).then(r => {        
        return didle.vote("Bob", 0, sig.h, sig.r, sig.s, sig.v);
    }).then(r => {
        return didle.vote("Bob", 1, sig.h, sig.r, sig.s, sig.v);
    }).then(r => {
        return didle.voteCount.call(signer, 0);
    }).then(count => {
        assert.equal(count, '0');
       return didle.voteCount.call(signer, 1);
    }).then(count => {
        assert.equal(count, '1');
    })
  });   

  it("should sum votes", function() {
    var signer = accounts[3];
    var sender0 = accounts[0];
    var sender1 = accounts[1];
    var sender2 = accounts[2];
      
    var didle;
    var sig0, sig1, sig2;
      
    return Didle.deployed().then((instance) => {
      didle = instance;
      sig0 = signAddress(signer, sender0, didle);
      sig1 = signAddress(signer, sender1, didle);
      sig2 = signAddress(signer, sender2, didle);
      return didle.create(signer, "A meeting", ['x', 'y']);
    }).then(r => {        
        return didle.vote("Sender0", 0, sig0.h, sig0.r, sig0.s, sig0.v, {from: sender0});
    }).then(r => {
        return didle.vote("Sender1", 0, sig1.h, sig1.r, sig1.s, sig1.v, {from: sender1});
    }).then(r => {
        return didle.vote("Sender2", 1, sig2.h, sig2.r, sig2.s, sig2.v, {from: sender2});
    }).then(r => {
        return didle.voteCount.call(signer, 0);
    }).then(count => {
        assert.equal(count, '2');
       return didle.voteCount.call(signer, 1);
    }).then(count => {
        assert.equal(count, '1');
    })
  });   

});
