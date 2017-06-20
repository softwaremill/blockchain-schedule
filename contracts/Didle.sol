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

    // --------------------------- move to string utils ---------------------------------
   function strConcat(string _a, string _b, string _c, string _d, string _e) internal returns (string) {
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        bytes memory _bc = bytes(_c);
        bytes memory _bd = bytes(_d);
        bytes memory _be = bytes(_e);
        string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
        bytes memory babcde = bytes(abcde);
        uint k = 0;
        for (uint i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
        for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
        for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
        for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
        for (i = 0; i < _be.length; i++) babcde[k++] = _be[i];
        return string(babcde);
    }

    function strConcat(string _a, string _b, string _c, string _d) internal returns (string) {
        return strConcat(_a, _b, _c, _d, "");
    }

    function strConcat(string _a, string _b, string _c) internal returns (string) {
        return strConcat(_a, _b, _c, "", "");
    }

    function strConcat(string _a, string _b) internal returns (string) {
        return strConcat(_a, _b, "", "", "");
    }

    function toStr(bool b) constant returns (string) {
        var result = "false";
        if (b) result = "true";
        return result;
    }

    function winningProposalName(Voting voting) internal constant returns (byte[128]) {
        uint winnerIndex = 0;
        int128 winnerVoteCount = 1;
        string memory winnerName = "";
        for (uint i = 0; i < voting.proposals.length; i++) {
            var proposalName = voting.proposals[i].name;
            var voteCount = voting.proposals[i].voteCount;
            if (voteCount > winnerVoteCount) {
                winnerVoteCount = voteCount;
                winnerIndex = i;
            }           
        }
        return voting.proposals[winnerIndex].name;
    }
    
    function getState(address signer) constant returns (string) {
        var voting = votings[signer];
        var proposalsStr = strConcat("[","\"", bytesToStr(voting.proposals[0].name),"\"");
        /* for (uint p = 1; p < voting.proposals.length; p++) {             */
        /*     proposalsStr = strConcat(proposalsStr, ",\"", voting.proposals[p].name, "\""); */
        /* } */
        proposalsStr = strConcat(proposalsStr, "]");
                
        string memory response =
            strConcat(
            strConcat("{\"name\":\"", voting.name, "\",\"multi\":", toStr(voting.isMultiChoice)),
                      ",\"proposals\":", proposalsStr);
        
        /* for (uint i = 0; i < voting.voteCount; i++) { */
        /*     var voterAddress = voting.votersIndex[i]; */
        /*     var voter = voting.voters[voterAddress]; */
        /*     response = strConcat(response, voter.name); */
        /* } */
        return response;
    }
    
    function voteCount(address signer, uint8 proposalIndex) constant returns (int128) {
        return votings[signer].proposals[proposalIndex].voteCount;
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

    event VoteSingle(address voter, address indexed signer, string name, uint8 proposal);

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
