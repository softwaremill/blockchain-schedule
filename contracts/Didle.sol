pragma solidity ^0.4.11;

contract Didle {

    struct Voter {
        string name;
        uint8[] yesIndexes;
        uint8[] noIndexes;
    }

      // This is a type for a single proposal.
    struct Proposal {
        bytes32 name;   // short name (up to 32 bytes)
        int128 voteCount; // number of accumulated votes
    }

    struct Voting {
        string name;
        bool isMultiChoice;
        Proposal[] proposals;
        mapping(address => Voter) voters;
    }

    // Key here is the unique address generated for each voting, called "signer"
    mapping(address => Voting) votings;

    function voteCount(address signer, uint8 proposalIndex) constant returns (int128) {
        return votings[signer].proposals[proposalIndex].voteCount;
    }
    
    function isEmpty(string str) constant returns (bool) {
        bytes memory tempEmptyStringTest = bytes(str);
        return (tempEmptyStringTest.length == 0);
    }
    
    function create(address signer, string name, bool isMultiChoice, bytes32[] proposalNames) {
        var voting = votings[signer];
        require(isEmpty(voting.name));
               
        /* // TODO validations of proposalNames         */
        for (uint i = 0; i < proposalNames.length; i++) {
            voting.proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
        voting.name = name;
        voting.isMultiChoice = isMultiChoice;
        votings[signer] = voting;
    }

    function vote(string name, uint8 proposal, bytes32 senderHash, bytes32 r, bytes32 s, uint8 v) {
        require(sha3(msg.sender) == senderHash);
        var signer = ecrecover(senderHash, v, r, s);
        var voting = votings[signer];
        require(!isEmpty(voting.name));
        require(!voting.isMultiChoice);

        var voter = voting.voters[msg.sender];
        if (isEmpty(voter.name)) { // first vote
            voter.name = name;
            voter.yesIndexes.push(proposal);
            voting.proposals[proposal].voteCount += 1;
        }
        else { // vote update
            var prevProposal = voter.yesIndexes[0];
            voting.proposals[prevProposal].voteCount -= 1;
            voter.yesIndexes[0] = proposal;
            voting.proposals[proposal].voteCount += 1;            
        }        
    }

    function voteMultiWrite(address signer, uint8[] yesProposals, uint8[] noProposals) internal {
       var voting = votings[signer];
       var voter = voting.voters[msg.sender];
       for (uint i = 0; i < yesProposals.length; i++) {
         // TODO reject duplicates
         voter.yesIndexes.push(yesProposals[i]);
         voting.proposals[yesProposals[i]].voteCount += 1;
       }
            
       for (uint j = 0; j < noProposals.length; j++) {
         // TODO reject duplicates
         voter.noIndexes.push(noProposals[j]);
         voting.proposals[noProposals[j]].voteCount -= 1;
       }        
    }

    function cancelSenderVotes(address signer) internal {
       var voting = votings[signer];
       var voter = voting.voters[msg.sender];
        for (uint i = 0; i < voter.yesIndexes.length; i++) {
              var yesIndex = voter.yesIndexes[i];
              voting.proposals[yesIndex].voteCount -= 1;
           }
           for (uint j = 0; j < voter.noIndexes.length; j++) {
              var noIndex = voter.noIndexes[j];
              voting.proposals[noIndex].voteCount += 1;
           }
        
    }

    function voteMulti(string name, uint8[] yesProposals, uint8[] noProposals, bytes32 senderHash, bytes32 r, bytes32 s, uint8 v) {
       require(sha3(msg.sender) == senderHash);
       var signer = ecrecover(senderHash, v, r, s);
       var voting = votings[signer];
       require(!isEmpty(voting.name));
       require(voting.isMultiChoice);
       // TODO reject duplicates

       var voter = voting.voters[msg.sender];
       if (isEmpty(voter.name)) {
           voter.name = name;
       }
       else {
           cancelSenderVotes(signer);
       }
       voteMultiWrite(signer, yesProposals, noProposals);
    }

}
