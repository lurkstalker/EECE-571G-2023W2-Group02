//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract RoomRental {
    uint256 constant price = 1e17;
    uint256 private totalRoomNum = 0;

    struct RoomInfo {
        bool isAvailable;
        string location;
        string intro;
        uint256 roomId;
        uint256 price; // monthly payment
        address owner;
    }

    struct User {
        string userName;
        string password;
        address payable userAddress;
        bool loggedIn;
        bool isValid;
    }

    struct RentalInfo {
        uint256 roomId;
        address renterAddress;

        bool isValid;
        bool hasConfirmed;
        bool isEnd;
    }

    mapping(address => uint256) balances; // address balance
    mapping(uint256 => RoomInfo) public roomInfos; // room information
    mapping(address => User) users; // user information
    mapping(address => RentalInfo) rental_renter; // each address can only rent one room at one time
    mapping(uint256 => RentalInfo) rental_room; // room id -> rental info 

    constructor() {

    }
    // -- account
    function SignUp(string memory userName, string memory password) public {
        require(!users[msg.sender].isValid , "Account already exists");
        require(bytes(userName).length > 0, "Please enter a name");
        require(bytes(password).length > 0, "Please enter a password");
        users[msg.sender].userName = userName;
        users[msg.sender].password = password; // todo encrypt pwd
        users[msg.sender].userAddress = payable(msg.sender);
        users[msg.sender].isValid = true;
    }

    function Login(string memory password) public {
        User memory u = users[msg.sender];
        require(u.loggedIn == false, "You have logged in");
        require(keccak256(abi.encodePacked(u.password)) ==
            keccak256(abi.encodePacked(password)), "Incorrect password");
        users[msg.sender].loggedIn = true;
    }

    function Logout() public {
        users[msg.sender].loggedIn = false;
    }

    // rentee

    function addRoom(string memory roomLocation, string memory roomIntro, uint256 price) public {
        require(bytes(roomLocation).length > 0, "Please input valid location");
        require(bytes(roomIntro).length > 0, "Please input valid info");
        totalRoomNum += 1;
        RoomInfo memory rmInfo;

        rmInfo.location = roomLocation;
        rmInfo.intro = roomIntro;
        rmInfo.isAvailable = true;
        rmInfo.price = price;
        rmInfo.owner = msg.sender;
        rmInfo.roomId = totalRoomNum;

        roomInfos[totalRoomNum] = rmInfo;
    }

    function topUp() public {

    }

    // renter
    function viewRoom() public view {

    }

    function rentRoom() public payable {

    }

    function refundRoom() public {

    }

    function moveIn() public {

    }

    function moveOut() public {

    }

    // getter for test
}