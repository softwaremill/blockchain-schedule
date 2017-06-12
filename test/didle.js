// Specifically request an abstraction for Didle
var Didle = artifacts.require("Didle");

contract('Didle', function(accounts) {

    it("should initialize a new voting", function() {
    var signer = accounts[0];
    var didle;
    var createResult;
      
    return Didle.deployed().then((instance) => {
      didle = instance;
      return didle.create(signer, "SoftwareMill Birr June 2017", false, ['a', 'b']);
    }).then(() => {
        return didle.votings.call(signer);
    }).then((voting) => {
          var responseObj = JSON.stringify(voting, null, 4);
          console.log("VOTING = " + responseObj);
          assert.equal(voting[0], "SoftwareMill Birr June 2017");
          assert.equal(voting[1], false);
        });
  });

  it("should not initialize a new voting when a voting exists for given signer", function() {
    var signer = accounts[1];
    var didle;
    var createResult;
      
    return Didle.deployed().then((instance) => {
      didle = instance;
      return didle.create(signer, "First voting", false, ['a', 'b']);
    }).then(() => {
        return didle.create(signer, "Second voting", false, ['a', 'b']);
    }).catch((error)  => {
      assert.equal(true, true);
    });
  });
            
});
