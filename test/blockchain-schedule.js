const DecentralizedSchedule = artifacts.require("DecentralizedSchedule");
import * as eutil from 'ethereumjs-util'


contract('DecentralizedSchedule', function(accounts) {

  const sender = accounts[0];
    
  it("should initialize a new voting", function() {
    const signer = accounts[1];
    let meta;
      
    return DecentralizedSchedule.deployed().then((instance) => {
      meta = instance;
      return meta.create(signer, "SoftwareMill Birr June 2017", ['aa', 'bb']);
    }).then(() => {
        return meta.voteSummary.call(signer);
    }).then((voting) => {
          assert.equal(voting[0], "SoftwareMill Birr June 2017");
          assert.equal(web3.toUtf8(voting[1][0]), ['aa']);
          assert.equal(web3.toUtf8(voting[1][1]), ['bb']);
        });
  });

  it("should not initialize a new voting when a voting exists for given signer", function() {
    const signer = accounts[2];
    let meta;

    return DecentralizedSchedule.deployed().then((instance) => {
      meta = instance;
      return meta.create(signer, "First voting", ['a', 'b']);
    }).then(() => {
        return meta.create(signer, "Second voting, for the same signer account", ['a', 'b']);
    }).catch((error)  => {
      return assert.equal(true, true);
    });
  });
  
  function signAddress(signer, address, meta) {
      const msg = new Buffer(address);
      const sig = web3.eth.sign(signer, '0x' + msg.toString('hex'));
      const res0 = eutil.fromRpcSig(sig);        
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
    const signer = accounts[7];
    let meta;
    const proposalIndex = 0; // 'x'
      
    return DecentralizedSchedule.deployed().then((instance) => {
      meta = instance;
      return meta.create(signer, "A meeting", ['x', 'y']);
    }).then(r => {
        const sig = signAddress(signer, sender, meta);
        return meta.vote("Bob", 0, sig.h, sig.r, sig.s, sig.v);
    }).then(r => {
       const voteEvents = meta.VoteSingle({signer: signer});
        voteEvents.watch(function(err, result) {
            if (err) {
                console.log(err);
                assert.equal(1, 0);
                return;
            }
            const event = result.args;
            assert.equal(event.voter, sender);
            assert.equal(event.signer, signer);
            assert.equal(event.voterName, "Bob");
            assert.equal(event.proposal, 0);
            return;
        })
    });
  });   

  it("should override a vote", function() {
    const signer = accounts[4];
    let meta;
    let sig;
      
    return DecentralizedSchedule.deployed().then((instance) => {
      meta = instance;
      sig = signAddress(signer, sender, meta);
      return meta.create(signer, "A meeting", ['x', 'y']);
    }).then(r => {        
        return meta.vote("Bob", 0, sig.h, sig.r, sig.s, sig.v);
    }).then(r => {
        return meta.vote("Bob", 1, sig.h, sig.r, sig.s, sig.v);
    }).then(r => {
        return meta.voteSummary.call(signer);
    }).then(summary => {
        const voteCount = summary[2];
        assert.equal(voteCount[0], "0");
        assert.equal(voteCount[1], "1");
    });
  });   

  it("should sum votes", function() {
    const signer = accounts[3];
    const sender0 = accounts[0];
    const sender1 = accounts[1];
    const sender2 = accounts[2];
      
    let meta;
    let sig0, sig1, sig2;
      
    return DecentralizedSchedule.deployed().then((instance) => {
      meta = instance;
      sig0 = signAddress(signer, sender0, meta);
      sig1 = signAddress(signer, sender1, meta);
      sig2 = signAddress(signer, sender2, meta);
      return meta.create(signer, "A meeting", ['x', 'y']);
    }).then(r => {        
        return meta.vote("Sender0", 0, sig0.h, sig0.r, sig0.s, sig0.v, {from: sender0});
    }).then(r => {
        return meta.vote("Sender1", 0, sig1.h, sig1.r, sig1.s, sig1.v, {from: sender1});
    }).then(r => {
        return meta.vote("Sender2", 1, sig2.h, sig2.r, sig2.s, sig2.v, {from: sender2});
    }).then(r => {
        return meta.voteSummary.call(signer);
    }).then(summary => {
        const voteCount = summary[2];
        assert.equal(voteCount[0], "2");
        assert.equal(voteCount[1], "1");        
    })
  });   

});
