pragma solidity ^0.4.10;

contract Didle {

    struct Voter {
        string name;
        uint8[] voteIndexes;
    }

      // This is a type for a single proposal.
    struct Proposal {
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }

    struct Voting {
        string name;
        bool isMultiChoice;
        Proposal[] proposals;
        mapping(address => Voter) voters;
    }

    // Key here is the unique address generated for each voting, called "signer"
    mapping(address => Voting) public votings;

    function voteCount(address signer, uint8 proposalIndex) constant returns (uint) {
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

    function vote(address signer, string name, uint8 proposal, bytes32 senderHash, bytes32 r, bytes32 s, uint8 v) {
        var voting = votings[signer];
        require(!isEmpty(voting.name));
        require(ecrecover(senderHash, v, r, s) == signer);
        require(!voting.isMultiChoice);

        var voter = voting.voters[msg.sender];
        if (isEmpty(voter.name)) { // first vote
            voter.name = name;
            voter.voteIndexes.push(proposal);
            voting.proposals[proposal].voteCount += 1; // TODO or -1 for "NO"?
        }
    }

}
