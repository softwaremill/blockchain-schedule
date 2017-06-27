pragma solidity ^0.4.11;

contract Didle {
   
    struct Voter {
        string name;
        uint8[] yesIndexes;
        uint8[] noIndexes;
    }

      // This is a type for a single proposal.
    struct Proposal {
        byte[128] name; 
        int128 voteCount; // number of accumulated votes
    }

    struct Voting {
        string name;
        bool isMultiChoice;
        Proposal[] proposals;
        mapping(address => Voter) voters;
        mapping(uint => address) votersIndex;
        uint voteCount;
    }

    // Key here is the unique address generated for each voting, called "signer"
    mapping(address => Voting) public votings;
    
    function voteCount(address signer, uint8 proposalIndex) constant returns (int128) {
        return votings[signer].proposals[proposalIndex].voteCount;
    }

    function proposalNames(address signer) constant returns (byte[128][] names) {
        var ps = votings[signer].proposals;
        var arr = new byte[128][](ps.length);
        for (uint i = 0; i < ps.length; i++) {
            arr[i] = ps[i].name;
        }
        return arr;
    }

    function proposalName(address signer, uint8 proposalIndex) constant returns (byte[128] name) {
        return votings[signer].proposals[proposalIndex].name;
    }
    
    function isEmpty(string str) constant returns (bool) {
        bytes memory tempEmptyStringTest = bytes(str);
        return (tempEmptyStringTest.length == 0);
    }

    function bytesToStr(byte[128] byteArray) constant internal returns (string) {
        string memory str1 = new string(byteArray.length);
        bytes memory b = bytes(str1);
        for (uint i = 0; i < byteArray.length; i++) {
            b[i++] = byteArray[i];
        }
        return string(b);          
    }
    
    function create(address signer, string name, bool isMultiChoice, byte[128][] proposalNames) {
        var voting = votings[signer];
        require(isEmpty(voting.name));
               
        /* // TODO validations of proposalNames, escape etc. */
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

    event VoteSingle(address voter, address indexed signer, string voterName, uint8 proposal);

    function voteE(string name, uint8 proposal, bytes32 senderHash, bytes32 r, bytes32 s, uint8 v) returns (int256) {
        require(sha3(msg.sender) == senderHash);
        var signer = ecrecover(senderHash, v, r, s);
        var voting = votings[signer];
        require(!isEmpty(voting.name));
        require(!voting.isMultiChoice);
        require(proposal < voting.proposals.length);
        VoteSingle(msg.sender, signer, name, proposal);
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
            voting.votersIndex[voting.voteCount] = msg.sender;
            voting.voteCount += 1;
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
           voting.votersIndex[voting.voteCount] = msg.sender;
           voting.voteCount += 1;
       }
       else {
           cancelSenderVotes(signer);
       }
       voteMultiWrite(signer, yesProposals, noProposals);
    }

}
