const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("RoomRental contract", function () {

    let etherAmountStr = "1000000000000000000";
    let etherAmountTenMonthRent = "10000000000000000000";
    let roomRental;
    let owner;
    let rentee;
    let renter1;
    let renter2;

    beforeEach(async function () {
        [owner, rentee, renter1, renter2] = await ethers.getSigners();
        roomRentalSystem = await ethers.getContractFactory("RoomRental");
        roomRental = await roomRentalSystem.deploy();
    });

    // Helper function to sign up and log in a user
    async function signUpAndLogin(user, username, password) {
        await roomRental.connect(user).userSignUp(username, password);
        await roomRental.connect(user).userLogin(password);
    }

    it("SignUp Test#01 User can only sign up if he hasn't done it before", async function () {
        expect(await roomRental.connect(rentee).getSignUpStatus()).to.equal(false);
        await roomRental.connect(rentee).userSignUp("alex", "12345");
        expect(await roomRental.connect(rentee).getSignUpStatus()).to.equal(true);
        expect(roomRental.connect(rentee).userSignUp("tim", "344565")).to.be.revertedWith("Account already exists");
    });

    it("LogIn Test#01 User can only log in with correct password", async function () {
        await roomRental.connect(rentee).userSignUp("alex", "12345");
        expect(roomRental.connect(rentee).userLogin("2345")).to.be.revertedWith("Incorrect password");
        expect(await roomRental.connect(rentee).getLoginStatus()).to.equal(false);
        await roomRental.connect(rentee).userLogin("12345");
        expect(await roomRental.connect(rentee).getLoginStatus()).to.equal(true);
    });

    it("LogOut Test#01 User is able to log out", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        expect(await roomRental.connect(rentee).getLoginStatus()).to.equal(true);
        await roomRental.connect(rentee).userLogout();
        expect(await roomRental.connect(rentee).getLoginStatus()).to.equal(false);
    });

    it("AddRoom Test#01 Rentee should be able to add a room with valid room info", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        expect(await roomRental.connect(rentee).getTotalRoomCount()).to.equal(0);
        expect(await roomRental.connect(rentee).getCurMaxRoomId()).to.equal(0);
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        expect(await roomRental.connect(rentee).getTotalRoomCount()).to.equal(1);
        expect(await roomRental.connect(rentee).getCurMaxRoomId()).to.equal(1);
        expect(await roomRental.connect(rentee).getRoomLocation(1)).to.equal("Downtown");
        expect(await roomRental.connect(rentee).getRoomIntro(1)).to.equal("Nice view");
        const roomRentalPrice = await roomRental.connect(rentee).getRoomPrice(1);
        assert.equal(roomRentalPrice, BigInt(etherAmountStr));
    });

    it("AddRoom Test#02 Rentee should not be able to add a room if the room location is empty", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        expect(roomRental.connect(rentee).addRoom("", "Nice view", ethers.parseEther("1"))).to.be.revertedWith("Please input valid location");
    });

    it("AddRoom Test#03 Rentee should not be able to add a room if the room intro is empty", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        expect(roomRental.connect(rentee).addRoom("Downtown", "", ethers.parseEther("1"))).to.be.revertedWith("Please input valid info");
    });

    it("DeleteRoom Test#01 Rentee should be able to delete a room", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        expect(await roomRental.connect(rentee).getRoomLocation(1)).to.equal("Downtown");
        expect(await roomRental.connect(rentee).getRoomIntro(1)).to.equal("Nice view");
        const roomRentalPrice = await roomRental.connect(rentee).getRoomPrice(1);
        assert.equal(roomRentalPrice, BigInt(etherAmountStr));
        expect(await roomRental.connect(rentee).getTotalRoomCount()).to.equal(1);
        expect(await roomRental.connect(rentee).isRoomAvailable(1)).to.equal(true);
        await roomRental.connect(rentee).deleteRoom(1);
        expect(await roomRental.connect(rentee).getTotalRoomCount()).to.equal(0);
        expect(await roomRental.connect(rentee).isRoomAvailable(1)).to.equal(false);

    });

    it("DeleteRoom Test#02 User should not be able to delete a room if he/she is not the room owner", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        await signUpAndLogin(renter1, "tim", "6789");
        await expect(roomRental.connect(renter1).deleteRoom(1)).to.be.revertedWith("Only the room owner can delete the room.");
    });

    it("DeleteRoom Test#03 Rentee should not be able to delete a room if the room is not available", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        await signUpAndLogin(renter1, "tim", "6789");
        // Let renter1 rent the room 01
        expect(await roomRental.connect(rentee).isRoomAvailable(1)).to.equal(true);
        await roomRental.connect(renter1).rentRoom(1, 10, { value: etherAmountTenMonthRent });
        expect(await roomRental.connect(rentee).isRoomAvailable(1)).to.equal(false);
        await expect(roomRental.connect(rentee).deleteRoom(1)).to.be.revertedWith("Room must not be currently rented.");
    });

    it("DeleteRoom Test#04 Rentee should not be able to delete a room if the room is appointmented ", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        await signUpAndLogin(renter1, "tim", "6789");
        // Let renter1 appointment the room 01
        await roomRental.connect(renter1).makeAppointment(1);
        await expect(roomRental.connect(rentee).deleteRoom(1)).to.be.revertedWith("There must be no active appointments for the room.");
    });

    it("Appointment Test#01 Renter can make an appointment if the room is available", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        await roomRental.connect(renter1).makeAppointment(1);
        expect(await roomRental.connect(renter1).checkAppointmentStatus(1)).to.equal(true);
    });

    it("Appointment Test#02 Should not allow making an appointment if the room does not exist", async function () {
        await signUpAndLogin(renter1, "tim", "6789");
        await expect(roomRental.connect(renter1).makeAppointment(1)).to.be.revertedWith("Room does not exist");
    });

    it("Appointment Test#03 Renter can not make an appointment if the room is already booked", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await signUpAndLogin(renter2, "brandon", "13579");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        await roomRental.connect(renter1).makeAppointment(1);
        await expect(roomRental.connect(renter2).makeAppointment(1)).to.be.revertedWith("Appointment already exists for this room");
    });

    it("Appointment Test#04 Should not allow making an appointment if the room is already rented out", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await signUpAndLogin(renter2, "brandon", "13579");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        await roomRental.connect(renter1).rentRoom(1, 10, { value: etherAmountTenMonthRent });
        await expect(roomRental.connect(renter2).makeAppointment(1)).to.be.revertedWith("Room is not available");
    });

    it("Appointment Test#05 Landlord cannot make an appointment for his own property", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        expect(roomRental.connect(renter1).makeAppointment(1)).to.be.revertedWith("Room owner cannot make an appointment himself/herself");
    });

    it("Appointment Test#06 Rentee and renter can view the status of an appointment", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        await roomRental.connect(renter1).makeAppointment(1);
        const appointmentDetailsForRentee = await roomRental.connect(rentee).getAppointmentDetails(1);
        expect(appointmentDetailsForRentee.isValid).to.equal(true);
        const appointmentDetailsForRenter = await roomRental.connect(renter1).getAppointmentDetails(1);
        expect(appointmentDetailsForRenter.isValid).to.equal(true);
    });

    it("Appointment Test#07 Others who are not Rentee or renter can not view the status of an appointment", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await signUpAndLogin(renter2, "brandon", "13579");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        await roomRental.connect(renter1).makeAppointment(1);
        const appointmentDetailsForRentee = await roomRental.connect(rentee).getAppointmentDetails(1);
        expect(appointmentDetailsForRentee.isValid).to.equal(true);
        const appointmentDetailsForRenter = await roomRental.connect(renter1).getAppointmentDetails(1);
        expect(appointmentDetailsForRenter.isValid).to.equal(true);
        expect(roomRental.connect(renter2).getAppointmentDetails(1)).to.be.revertedWith("Caller must be renter or rentee of the appointment");
    });



    it("Valid renter could rent the house with enough balance if the house is valid", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        expect(await roomRental.connect(rentee).isRoomAvailable(1)).to.equal(true);
        await roomRental.connect(renter1).rentRoom(1, 10, { value: etherAmountTenMonthRent });
        expect(await roomRental.connect(rentee).isRoomAvailable(1)).to.equal(false);
    });

    it("Valid renter could not rent the house without enough balance if the house is valid", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        expect(await roomRental.connect(rentee).isRoomAvailable(1)).to.equal(true);
        await (expect(roomRental.connect(renter1).rentRoom(1, 11, { value: etherAmountTenMonthRent }))).to.be.revertedWith("Plase pay the correct rent!");
    });

    it("Valid renter could not rent the house with extra balance if the house is valid", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        expect(await roomRental.connect(rentee).isRoomAvailable(1)).to.equal(true);
        await (expect(roomRental.connect(renter1).rentRoom(1, 9, { value: etherAmountTenMonthRent }))).to.be.revertedWith("Plase pay the correct rent!");
    });

    it("Valid renter could move into the house if the rental is valid", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        expect(await roomRental.connect(rentee).isRoomAvailable(1)).to.equal(true);
        expect(await roomRental.connect(rentee).isRentalRoomConfirmed(1)).to.equal(false);
        await roomRental.connect(renter1).rentRoom(1, 10, { value: etherAmountTenMonthRent });
        expect(await roomRental.connect(rentee).isRoomAvailable(1)).to.equal(false);
        expect(await roomRental.connect(rentee).isRentalRoomConfirmed(1)).to.equal(false);
        await roomRental.connect(renter1).moveIn();
        expect(await roomRental.connect(renter1).isRentalRoomConfirmed(1)).to.equal(true);
    });

    it("Valid rentee could withdrawl deposit the money once renter payed the rental fee", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        expect(await roomRental.connect(rentee).isRoomAvailable(1)).to.equal(true);
        expect(await roomRental.connect(rentee).isRentalRoomConfirmed(1)).to.equal(false);

        // Get the rentee balance before renter rent room
        const renteeBalanceBeforeRentIn = await roomRental.connect(rentee).getUserBalance();
        assert.equal(renteeBalanceBeforeRentIn, BigInt(0));

        await roomRental.connect(renter1).rentRoom(1, 10, { value: etherAmountTenMonthRent });
        expect(await roomRental.connect(rentee).isRoomAvailable(1)).to.equal(false);

        // Get the rentee balance before renter move in
        const renteeBalanceBeforeMoveIn = await roomRental.connect(rentee).getUserBalance();
        assert.equal(renteeBalanceBeforeMoveIn, BigInt(0));

        await roomRental.connect(renter1).moveIn();
        expect(await roomRental.connect(renter1).isRentalRoomConfirmed(1)).to.equal(true);

        // Get the rentee balance after renter move in
        const renteeBalanceAfterMoveIn = await roomRental.connect(rentee).getUserBalance();
        assert.equal(renteeBalanceAfterMoveIn, BigInt(etherAmountTenMonthRent));

        // Get the rentee balance after rentee withdrwal the deposit
        await roomRental.connect(rentee).withdrawDeposit();
        const renteeBalanceAfterWithDrawalDepo = await roomRental.connect(rentee).getUserBalance();
        assert.equal(renteeBalanceAfterWithDrawalDepo, BigInt(0));
    });

});
