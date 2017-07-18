pragma solidity ^0.4.11;

contract Didle {
   
    // This is a type for a single proposal.
    struct Proposal {
        bytes32 name; 
        int128 voteCount; // number of accumulated votes
    }

    struct UserVote {
        bool voted;
        uint proposalIndex;
    }

    struct Voting {
        string name;
        Proposal[] proposals;
        mapping(address => UserVote) votes;
    }

    // Key here is the unique address generated for each voting, called "signer"
    mapping(address => Voting) public votings;

    function voteSummary(address signer) constant returns (string, bytes32[], int128[]) {
        return (votings[signer].name, proposalNames(signer), voteCounts(signer));
    }
    
    function voteCounts(address signer) constant returns (int128[]) {
        var ps = votings[signer].proposals;
        var arr = new int128[](ps.length);
        for (uint i = 0; i < ps.length; i++) {
            arr[i] = ps[i].voteCount;
        }
        return arr;
    }

    function proposalNames(address signer) constant returns (bytes32[] names) {
        var ps = votings[signer].proposals;
        var arr = new bytes32[](ps.length);
        for (uint i = 0; i < ps.length; i++) {
            arr[i] = ps[i].name;
        }
        return arr;
    }

    function proposalName(address signer, uint8 proposalIndex) constant returns (bytes32 name) {
        return votings[signer].proposals[proposalIndex].name;
    }
    
    function isEmpty(string str) constant returns (bool) {
        bytes memory tempEmptyStringTest = bytes(str);
        return (tempEmptyStringTest.length == 0);
    }
    
    function create(address signer, string name, bytes32[] proposalNames) {
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
        votings[signer] = voting;
    }

    event VoteSingle(address voter, address indexed signer, string voterName, uint8 proposal);

    function addressToString(address x) returns (string) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            byte b = byte(uint8(uint(x) / (2**(8*(19 - i)))));
            byte hi = byte(uint8(b) / 16);
            byte lo = byte(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2*  i + 1] = char(lo);            
        }
        return string(s);
    }

    function char(byte b) returns (byte c) {
        if (b < 10) return byte(uint8(b) + 0x30);
        else return byte(uint8(b) + 0x57);
    }
        
    function addressKeccak(address addr) constant returns(bytes32) {
        // The "42" here stands for string length of an address
        return keccak256("\x19Ethereum Signed Message:\n420x", addressToString(addr));
    }

    function vote(string name, uint8 proposal, bytes32 prefixedSenderHash, bytes32 r, bytes32 s, uint8 v) returns (uint256) {
        require(addressKeccak(msg.sender) == prefixedSenderHash);
        var signer = ecrecover(prefixedSenderHash, v, r, s);
        var voting = votings[signer];
        require(!isEmpty(voting.name));
        require(proposal < voting.proposals.length);

        var prevVote = voting.votes[msg.sender];
        if (prevVote.voted) {
            voting.proposals[prevVote.proposalIndex].voteCount -= 1;
        }
        else {
            voting.votes[msg.sender].voted = true;
        }
        voting.votes[msg.sender].proposalIndex = proposal;
        voting.proposals[proposal].voteCount += 1;

        VoteSingle(msg.sender, signer, name, proposal);
    }
}
