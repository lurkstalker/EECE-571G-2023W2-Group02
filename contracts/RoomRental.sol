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
        bytes32 passwordHash;
        address payable userAddress;
        bool loggedIn;
        bool isValid;
    }

    struct RentalInfo {
        uint256 roomId;
        address renterAddress;
        uint256 rentDuration;
        bool isValid;
        bool hasConfirmed;
        bool isEnd;
    }

    struct Appointment {
        uint256 roomId;
        address renteeAddr; // could be omitted since we could use roomId get the room owner address
        address renterAddr;
        uint256 appointmentTime;
        bool isValid;
        bool isConfirmed;
    }

    uint256 private totalAppointments = 0;
    mapping(address => uint256) balances; // address balance
    mapping(uint256 => RoomInfo) public roomInfos; // room information
    mapping(address => User) users; // user information
    mapping(address => RentalInfo) rental_renter; // each address can only rent one room at one time
    mapping(uint256 => RentalInfo) rental_room; // room id -> rental info
    mapping(uint256 => Appointment) public appointments; // Appointment ID -> Appointment info system could know all the appointments

    constructor() {}

    // -- account
    function SignUp(string memory userName, string memory password) public {
        require(!users[msg.sender].isValid, "Account already exists");
        require(bytes(userName).length > 0, "Please enter a name");
        require(bytes(password).length > 0, "Please enter a password");
        users[msg.sender] = User({
            userName: userName,
            passwordHash: keccak256(abi.encodePacked(password)),
            userAddress: payable(msg.sender),
            isValid: true,
            loggedIn: false
        });
    }

    function Login(string memory password) public {
        User memory user = users[msg.sender];
        require(user.loggedIn == false, "You have logged in");
        require(
            user.passwordHash == keccak256(abi.encodePacked(password)),
            "Incorrect password"
        );
        users[msg.sender].loggedIn = true;
    }

    function Logout() public {
        users[msg.sender].loggedIn = false;
    }

    // rentee

    function addRoom(
        string memory roomLocation,
        string memory roomIntro,
        uint256 price
    ) public {
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

    modifier onlyNonOwner(address payable owner) {
        require(msg.sender != owner, "Only non-owner can call this function.");
        _;
    }

    // Function to make an appointment
    function makeAppointment(uint256 _roomId, uint256 _appointmentTime) public {
        // Check that the room exists and is available
        require(_roomId > 0 && _roomId <= totalRoomNum, "Room does not exist");
        RoomInfo storage room = roomInfos[_roomId];
        require(room.isAvailable, "Room is not available");

        // Check that the caller is a registered user and not the owner of the room
        User storage user = users[msg.sender];
        require(
            user.isValid && user.loggedIn,
            "Must be a logged in user to make an appointment"
        );
        // To-do this might be a modifer
        require(
            msg.sender != room.owner,
            "Owner cannot make an appointment for their own room"
        );

        // Increment totalAppointments and create a new appointment
        totalAppointments += 1;
        // Check if there is already an appointment for this room
        require(
            !appointments[_roomId].isValid,
            "Appointment already exists for this room"
        );
        appointments[_roomId] = Appointment({
            roomId: _roomId,
            renteeAddr: room.owner,
            renterAddr: msg.sender,
            appointmentTime: _appointmentTime,
            isValid: true,
            isConfirmed: false // Initially, appointments are not confirmed
        });

        // Optionally, emit an event here for the new appointment
    }

    // Function for the rentee (room owner) to confirm an appointment
    function confirmAppointment(uint256 _appointmentId) public {
        // Ensure the appointment exists and is for one of the caller's rooms
        Appointment storage appointment = appointments[_appointmentId];
        require(appointment.roomId > 0, "Appointment does not exist");
        require(
            roomInfos[appointment.roomId].owner == msg.sender,
            "Caller is not the owner of the room"
        );

        // Confirm the appointment
        appointment.isConfirmed = true;

        // Todo - Optionally, emit an event here for the appointment confirmation
    }

    // Getter function for appointment details
    function getAppointmentDetails(
        uint256 _appointmentId
    ) public view returns (Appointment memory) {
        Appointment storage appointment = appointments[_appointmentId];

        // Ensure that the function caller is either the renter or the rentee of the appointment
        require(
            msg.sender == appointment.renteeAddr ||
                msg.sender == appointment.renteeAddr,
            "Caller must be renter or rentee of the appointment"
        );

        return appointment;
    }

    function withdrawDeposit() public {
        // withdraw Deposit for rentee balance
        payable(msg.sender).transfer(balances[msg.sender]);
        balances[msg.sender] = 0;
    }

    // renter
    function viewRoom(uint256 roomId) public view returns (RoomInfo memory) {
        require(roomInfos[roomId].roomId != 0, "Room does not exist!");
        return roomInfos[roomId];
    }

    function rentRoom(uint256 roomId, uint256 duration) public payable {
        RoomInfo memory curRoomInfo = roomInfos[roomId];
        RentalInfo memory rentalInfo = rental_renter[msg.sender];
        require(
            curRoomInfo.isAvailable == true,
            "Please input a valid room id"
        );
        require(
            rentalInfo.isEnd == true || rentalInfo.isValid == false,
            "You already have a rental"
        );
        require(
            msg.value == duration * curRoomInfo.price,
            "Plase pay the rent!"
        );

        rentalInfo.roomId = roomId;
        rentalInfo.renterAddress = msg.sender;
        rentalInfo.isValid = true;
        rentalInfo.hasConfirmed = false;
        rentalInfo.isEnd = false;

        roomInfos[roomId].isAvailable = false;

        rental_renter[msg.sender] = rentalInfo;
        rental_room[roomId] = rentalInfo;
    }

    function refundRoom() public {
        RentalInfo memory rentalInfo = rental_renter[msg.sender];
        RoomInfo memory roomInfo = roomInfos[rentalInfo.roomId];
        require(rentalInfo.isValid == true, "You do not have a rental yet");
        require(
            rentalInfo.hasConfirmed == false,
            "The rent has been confirmed"
        );

        payable(msg.sender).transfer(rentalInfo.rentDuration * roomInfo.price);
        rentalInfo.isValid = false;
        rental_renter[msg.sender] = rentalInfo;
        rental_room[rentalInfo.roomId] = rentalInfo;

        roomInfo.isAvailable = true;
        roomInfos[rentalInfo.roomId] = roomInfo;
    }

    function moveIn() public {
        RentalInfo memory rentalInfo = rental_renter[msg.sender];
        RoomInfo memory roomInfo = roomInfos[rentalInfo.roomId];

        require(rentalInfo.isValid == true, "You do not have a rental yet");
        require(
            rentalInfo.hasConfirmed == false,
            "The rent has been confirmed"
        );

        rentalInfo.hasConfirmed = true;
        balances[roomInfo.owner] += rentalInfo.rentDuration * roomInfo.price;

        rental_renter[msg.sender] = rentalInfo;
        rental_room[rentalInfo.roomId] = rentalInfo;
    }

    function moveOut() public {
        RentalInfo memory rentalInfo = rental_renter[msg.sender];
        RoomInfo memory roomInfo = roomInfos[rentalInfo.roomId];

        require(rentalInfo.isValid == true, "You do not have a rental yet");
        require(rentalInfo.hasConfirmed == true, "You have not moved in yet");

        rentalInfo.isEnd = true;

        rental_renter[msg.sender] = rentalInfo;
        rental_room[rentalInfo.roomId] = rentalInfo;

        roomInfo.isAvailable = true;
        roomInfos[rentalInfo.roomId] = roomInfo;
    }

    // getter for test

    // Getter for Room information
    function getRoomLocation(
        uint256 roomId
    ) public view returns (string memory) {
        return roomInfos[roomId].location;
    }

    function getRoomIntro(uint256 roomId) public view returns (string memory) {
        return roomInfos[roomId].intro;
    }

    function getRoomPrice(uint256 roomId) public view returns (uint256) {
        return roomInfos[roomId].price;
    }

    // Getter for Appointment information
    function isAppointmentAvaliable(
        uint256 roomId
    ) public view returns (uint256) {
        return roomInfos[roomId].price;
    }
}
