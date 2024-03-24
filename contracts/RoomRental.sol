//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract RoomRental {
    struct RoomInfo {
        uint256 roomId;
        string location;
        string intro;
        bool isAvailable;
        uint256 monthPrice;
        address owner;
    }

    struct User {
        address payable userAddress;
        string userName;
        bytes32 passwordHash;
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
        bool isValid;
    }

    uint256 constant monthlyRentPrice = 1e17;
    uint256 private nextAvaiRoomId = 0;
    uint256 private totalRoomCount = 0;

    mapping(address => uint256) balances; // address balance
    mapping(uint256 => RoomInfo) public roomInfos; // room information
    mapping(address => User) users; // user information
    mapping(address => RentalInfo) rental_renter; // each address can only rent one room at one time
    mapping(uint256 => RentalInfo) rental_room; // room id -> rental info
    mapping(uint256 => Appointment) public appointments; // Appointment ID -> Appointment info system could know all the appointments

    constructor() {}

    modifier onlyNonOwner(address payable owner) {
        require(msg.sender != owner, "Only non-owner can call this function.");
        _;
    }

    modifier checkLogin() {
        require(
            users[msg.sender].loggedIn == true,
            "You need to log in first!"
        );
        _;
    }

    modifier onlyRoomOwner(uint256 roomId) {
        require(
            roomInfos[roomId].owner == msg.sender,
            "Only the room owner can delete the room."
        );
        _;
    }

    modifier onlyValidRoomId(uint256 roomId) {
        // Check that the room exists and is available
        require(roomId > 0 && roomId <= nextAvaiRoomId, "Room does not exist");
        _;
    }

    // -- account
    function userSignUp(string memory userName, string memory password) public {
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

    function userLogin(string memory password) public {
        User memory user = users[msg.sender];
        require(user.loggedIn == false, "You have logged in");
        require(
            user.passwordHash == keccak256(abi.encodePacked(password)),
            "Incorrect password"
        );
        users[msg.sender].loggedIn = true;
    }

    function userLogout() public checkLogin {
        users[msg.sender].loggedIn = false;
    }

    // rentee

    function addRoom(
        string memory roomLocation,
        string memory roomIntro,
        uint256 roomMonthPrice
    ) public checkLogin {
        require(bytes(roomLocation).length > 0, "Please input valid location");
        require(bytes(roomIntro).length > 0, "Please input valid info");
        nextAvaiRoomId++;
        totalRoomCount++;
        roomInfos[nextAvaiRoomId] = RoomInfo({
            roomId: nextAvaiRoomId,
            location: roomLocation,
            intro: roomIntro,
            isAvailable: true,
            monthPrice: roomMonthPrice,
            owner: msg.sender
        });
    }

    function deleteRoom(
        uint256 roomId
    ) public checkLogin onlyRoomOwner(roomId) {
        require(
            roomInfos[roomId].isAvailable,
            "Room must not be currently rented."
        );
        require(
            !appointments[roomId].isValid,
            "There must be no active appointments for the room."
        );
        delete roomInfos[roomId]; // Delete the room information
        // Update nextAvaiRoomId if the deleted room was the last in the mapping
        if (roomId == nextAvaiRoomId) {
            nextAvaiRoomId--;
        }
        totalRoomCount--;
    }

    // Function to make an appointment
    function makeAppointment(
        uint256 roomId
    ) public checkLogin onlyValidRoomId(roomId) {
        require(
            !appointments[roomId].isValid,
            "Appointment already exists for this room"
        );
        RoomInfo memory room = roomInfos[roomId];
        require(room.isAvailable, "Room is not available");
        require(
            msg.sender != room.owner,
            "Room owner cannot make an appointment himself/herself"
        );
        appointments[roomId] = Appointment({
            roomId: roomId,
            renteeAddr: room.owner,
            renterAddr: msg.sender,
            isValid: true
        });
    }

    // Function to delete an appointment
    function deleteAppointment(
        uint256 roomId
    ) public checkLogin onlyValidRoomId(roomId) {
        require(
            appointments[roomId].isValid,
            "No Appointment existed for this room"
        );
        delete appointments[roomId]; // Delete the appointments information
    }

    // Getter function for appointment details
    function getAppointmentDetails(
        uint256 appointmentId
    ) public view checkLogin returns (Appointment memory) {
        Appointment memory appt = appointments[appointmentId];
        // Ensure that the function caller is either the renter or
        // the rentee of the appointment
        require(
            msg.sender == appt.renteeAddr || msg.sender == appt.renterAddr,
            "Caller must be renter or rentee of the appointment"
        );
        return appt;
    }

    // renter
    function viewRoom(uint256 roomId) public view returns (RoomInfo memory) {
        require(roomInfos[roomId].roomId != 0, "Room does not exist!");
        return roomInfos[roomId];
    }

    function rentRoom(
        uint256 roomId,
        uint256 duration
    ) public payable checkLogin {
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
            msg.value == duration * curRoomInfo.monthPrice,
            "Plase pay the correct rent!"
        );

        rentalInfo.roomId = roomId;
        rentalInfo.renterAddress = msg.sender;
        rentalInfo.isValid = true;
        rentalInfo.hasConfirmed = false;
        rentalInfo.isEnd = false;
        rentalInfo.rentDuration = duration;

        // With trustiness, we will mark the room to be unavailable
        roomInfos[roomId].isAvailable = false;

        rental_renter[msg.sender] = rentalInfo;
        rental_room[roomId] = rentalInfo;
    }

    function moveIn() public checkLogin {
        RentalInfo memory rentalInfo = rental_renter[msg.sender];
        RoomInfo memory roomInfo = roomInfos[rentalInfo.roomId];

        require(rentalInfo.isValid, "You do not have a rental yet");
        require(!rentalInfo.hasConfirmed, "The rent has been confirmed");

        rentalInfo.hasConfirmed = true;
        balances[roomInfo.owner] +=
            rentalInfo.rentDuration *
            roomInfo.monthPrice;

        rental_renter[msg.sender] = rentalInfo;
        rental_room[rentalInfo.roomId] = rentalInfo;
    }

    function moveOut() public checkLogin {
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

    function withdrawDeposit() public {
        // withdraw Deposit for rentee balance
        payable(msg.sender).transfer(balances[msg.sender]);
        balances[msg.sender] = 0;
    }

    function refundRoom() public checkLogin {
        RentalInfo memory rentalInfo = rental_renter[msg.sender];
        RoomInfo memory roomInfo = roomInfos[rentalInfo.roomId];
        require(rentalInfo.isValid == true, "You do not have a rental yet");
        require(
            rentalInfo.hasConfirmed == false,
            "The rent has been confirmed"
        );

        payable(msg.sender).transfer(
            rentalInfo.rentDuration * roomInfo.monthPrice
        );
        rentalInfo.isValid = false;
        rental_renter[msg.sender] = rentalInfo;
        rental_room[rentalInfo.roomId] = rentalInfo;

        roomInfo.isAvailable = true;
        roomInfos[rentalInfo.roomId] = roomInfo;
    }

    // getter for user info
    function getLoginStatus() public view returns(bool) {
        return users[msg.sender].loggedIn;
    }

    function getSignUpStatus() public view returns(bool) {
        return users[msg.sender].isValid;
    }


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
        return roomInfos[roomId].monthPrice;
    }

    function isRoomAvailable(uint256 roomId) public view returns (bool) {
        return roomInfos[roomId].isAvailable;
    }

    function getTotalRoomCount() public view returns (uint256) {
        return totalRoomCount;
    }

    // Getter for Appointment information
    // only check isValid, not sure what to do with isConfirmed
    function checkAppointmentStatus(
        uint256 roomId
    ) public view checkLogin returns (bool) {
        require(roomId > 0 && roomId <= nextAvaiRoomId, "Room does not exist");
        Appointment memory appointment = appointments[roomId];
        require(
            msg.sender == appointment.renteeAddr ||
                msg.sender == appointment.renterAddr,
            "User must be renter or rentee of the appointment"
        );
        return appointment.isValid;
    }

    function isRentalRoomConfirmed(uint256 roomId) public view returns (bool) {
        return rental_room[roomId].hasConfirmed;
    }

    function isRentalRoomEnded(uint256 roomId) public view returns (bool) {
        return rental_room[roomId].isEnd;
    }

    function isRentalRoomValid(uint256 roomId) public view returns (bool) {
        return rental_room[roomId].isValid;
    }


    function getUserBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
}
