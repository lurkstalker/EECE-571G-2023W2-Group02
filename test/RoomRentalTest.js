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

    it("SignUp Test#01 User can only sign up if he hasn't done it before", async function () {
        expect(await roomRental.connect(rentee).getSignUpStatus()).to.equal(false);
        await roomRental.connect(rentee).userSignUp("alex", "12345");
        expect(await roomRental.connect(rentee).getSignUpStatus()).to.equal(true);
        await expect(roomRental.connect(rentee).userSignUp("tim", "344565")).to.be.revertedWith("Account already exists");
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
        await addSampleRoom(rentee);
        expect(await roomRental.connect(rentee).getTotalRoomCount()).to.equal(1);
        expect(await roomRental.connect(rentee).getCurMaxRoomId()).to.equal(1);
        expect(await roomRental.connect(rentee).getRoomLocation(1)).to.equal("Downtown");
        expect(await roomRental.connect(rentee).getRoomIntro(1)).to.equal("Nice view");
        const roomRentalPrice = await roomRental.connect(rentee).getRoomPrice(1);
        assert.equal(roomRentalPrice, BigInt(etherAmountStr));
    });

    it("AddRoom Test#02 Rentee should not be able to add a room if the room location is empty", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await expect(roomRental.connect(rentee).addRoom("", "Nice view", ethers.parseEther("1"))).to.be.revertedWith("Please input valid location");
    });

    it("AddRoom Test#03 Rentee should not be able to add a room if the room intro is empty", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await expect(roomRental.connect(rentee).addRoom("Downtown", "", ethers.parseEther("1"))).to.be.revertedWith("Please input valid info");
    });

    it("DeleteRoom Test#01 Rentee should be able to delete a room", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await addSampleRoom(rentee);
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
        await addSampleRoom(rentee);
        await signUpAndLogin(renter1, "tim", "6789");
        await expect(roomRental.connect(renter1).deleteRoom(1)).to.be.revertedWith("Only the room owner can delete the room.");
    });

    it("DeleteRoom Test#03 Rentee should not be able to delete a room if the room is not available", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await addSampleRoom(rentee);
        await signUpAndLogin(renter1, "tim", "6789");
        // Let renter1 rent the room 01
        expect(await roomRental.connect(rentee).isRoomAvailable(1)).to.equal(true);
        await roomRental.connect(renter1).rentRoom(1, 10, { value: etherAmountTenMonthRent });
        expect(await roomRental.connect(rentee).isRoomAvailable(1)).to.equal(false);
        await expect(roomRental.connect(rentee).deleteRoom(1)).to.be.revertedWith("Room must not be currently rented.");
    });

    it("DeleteRoom Test#04 Rentee should not be able to delete a room if the room is appointmented ", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await addSampleRoom(rentee);
        await signUpAndLogin(renter1, "tim", "6789");
        // Let renter1 appointment the room 01
        await roomRental.connect(renter1).makeAppointment(1);
        await expect(roomRental.connect(rentee).deleteRoom(1)).to.be.revertedWith("There must be no active appointments for the room.");
    });

    it("Appointment Test#01 Renter can make an appointment if the room is available", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await addSampleRoom(rentee);
        await roomRental.connect(renter1).makeAppointment(1);
        await expect(await roomRental.connect(renter1).checkAppointmentStatus(1)).to.equal(true);
    });

    it("Appointment Test#02 Should not allow making an appointment if the room does not exist", async function () {
        await signUpAndLogin(renter1, "tim", "6789");
        await expect(roomRental.connect(renter1).makeAppointment(1)).to.be.revertedWith("Room does not exist");
    });

    it("Appointment Test#03 Renter can not make an appointment if the room is already booked", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await signUpAndLogin(renter2, "brandon", "13579");
        await addSampleRoom(rentee);
        await roomRental.connect(renter1).makeAppointment(1);
        await expect(roomRental.connect(renter2).makeAppointment(1)).to.be.revertedWith("Appointment already exists for this room");
    });

    it("Appointment Test#04 Should not allow making an appointment if the room is already rented out", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await signUpAndLogin(renter2, "brandon", "13579");
        await addSampleRoom(rentee);
        await roomRental.connect(renter1).rentRoom(1, 10, { value: etherAmountTenMonthRent });
        await expect(roomRental.connect(renter2).makeAppointment(1)).to.be.revertedWith("Room is not available");
    });

    it("Appointment Test#05 Landlord cannot make an appointment for his own property", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await addSampleRoom(rentee);
        await expect(roomRental.connect(rentee).makeAppointment(1)).to.be.revertedWith("Room owner cannot make an appointment himself/herself");
    });

    it("Appointment Test#06 Rentee and renter can view the status of an appointment", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await addSampleRoom(rentee);
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
        await addSampleRoom(rentee);
        await roomRental.connect(renter1).makeAppointment(1);
        const appointmentDetailsForRentee = await roomRental.connect(rentee).getAppointmentDetails(1);
        expect(appointmentDetailsForRentee.isValid).to.equal(true);
        const appointmentDetailsForRenter = await roomRental.connect(renter1).getAppointmentDetails(1);
        expect(appointmentDetailsForRenter.isValid).to.equal(true);
        await expect(roomRental.connect(renter2).getAppointmentDetails(1)).to.be.revertedWith("Caller must be renter or rentee of the appointment");
    });

    it("RentRoom Test#01 Valid renter could rent the house with enough balance if the house is valid", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await addSampleRoom(rentee);
        await checkSampleRoomTentalAvaiStatus(1, true);
        await roomRental.connect(renter1).rentRoom(1, 10, { value: etherAmountTenMonthRent });
        await checkSampleRoomTentalAvaiStatus(1, false);
    });

    it("RentRoom Test#02 renter could not rent the house if the house is unavailable", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await signUpAndLogin(renter2, "brandon", "13579");
        await addSampleRoom(rentee);
        await checkSampleRoomTentalAvaiStatus(1, true);
        await roomRental.connect(renter1).rentRoom(1, 10, { value: etherAmountTenMonthRent });
        await checkSampleRoomTentalAvaiStatus(1, false);
        await (expect(roomRental.connect(renter2).rentRoom(1, 10, { value: etherAmountTenMonthRent }))).to.be.revertedWith("Please input a available room id");
    });

    it("RentRoom Test#03 renter could not rent the house if the renter has rent the other house", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await addSampleRoom(rentee);
        await addSampleRoom(rentee);
        await checkSampleRoomTentalAvaiStatus(1, true);
        await roomRental.connect(renter1).rentRoom(1, 10, { value: etherAmountTenMonthRent });
        await checkSampleRoomTentalAvaiStatus(1, false);
        await (expect(roomRental.connect(renter1).rentRoom(2, 10, { value: etherAmountTenMonthRent }))).to.be.revertedWith("You already have a rental");
    });

    it("RentRoom Test#04 Valid renter could not rent the house without enough balance if the house is valid", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await addSampleRoom(rentee);
        await checkSampleRoomTentalAvaiStatus(1, true);
        await (expect(roomRental.connect(renter1).rentRoom(1, 11, { value: etherAmountTenMonthRent }))).to.be.revertedWith("Plase pay the correct rent!");
    });

    it("RentRoom Test#05 Valid renter could not rent the house with extra balance if the house is valid", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await addSampleRoom(rentee);
        await checkSampleRoomTentalAvaiStatus(1, true);
        await (expect(roomRental.connect(renter1).rentRoom(1, 9, { value: etherAmountTenMonthRent }))).to.be.revertedWith("Plase pay the correct rent!");
    });

    it("MoveIn Test#01 Valid renter could move into the house if the rental is valid", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await addSampleRoom(rentee);
        await checkSampleRoomTentalAvaiStatus(1, true);
        await roomRental.connect(renter1).rentRoom(1, 10, { value: etherAmountTenMonthRent });
        await checkSampleRoomTentalAvaiStatus(1, false);
        await checkSampleRoomTentalCfmStatus(1, false);
        await roomRental.connect(renter1).moveIn();
        await checkSampleRoomTentalCfmStatus(1, true);
    });

    it("MoveIn Test#02 renter could not move into the house if the rental is invalid", async function () {
        await signUpAndLogin(renter1, "tim", "6789");
        await (expect(roomRental.connect(renter1).moveIn())).to.be.revertedWith("You do not have a rental yet");
    });

    it("MoveIn Test#03 renter could not move into the house if the rental has been confirmed", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await addSampleRoom(rentee);
        await roomRental.connect(renter1).rentRoom(1, 10, { value: etherAmountTenMonthRent });
        await roomRental.connect(renter1).moveIn();
        await (expect(roomRental.connect(renter1).moveIn())).to.be.revertedWith("The rent has been confirmed");
    });

    it("MoveOut Test#01 Valid renter could move out the house if the rental is valid and confirmed", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await addSampleRoom(rentee);
        await checkSampleRoomTentalAvaiStatus(1, true);

        await roomRental.connect(renter1).rentRoom(1, 10, { value: etherAmountTenMonthRent });
        await checkSampleRoomTentalAvaiStatus(1, false);
        await checkSampleRoomTentalCfmStatus(1, false);

        await roomRental.connect(renter1).moveIn();
        await checkSampleRoomTentalCfmStatus(1, true);
        await checkSampleRoomTentalEndStatus(1, false);

        await roomRental.connect(renter1).moveOut();
        await checkSampleRoomTentalEndStatus(1, true);
        await checkSampleRoomTentalAvaiStatus(1, true);
    });

    it("MoveOut Test#02 renter could not move out the house if the rental is invalid", async function () {
        await signUpAndLogin(renter1, "tim", "6789");
        await (expect(roomRental.connect(renter1).moveOut())).to.be.revertedWith("You do not have a rental yet");
    });

    it("MoveOut Test#03 renter could not move out the house if the rental has been confirmed", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await addSampleRoom(rentee);
        await roomRental.connect(renter1).rentRoom(1, 10, { value: etherAmountTenMonthRent });
        await (expect(roomRental.connect(renter1).moveOut())).to.be.revertedWith("You have not moved in yet");
    });

    it("Refund Test#01 renter could not refund after confirm (move in)", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await addSampleRoom(rentee);

        await roomRental.connect(renter1).rentRoom(1, 10, { value: etherAmountTenMonthRent });
        await checkSampleRoomTentalAvaiStatus(1, false);
        await checkSampleRoomTentalCfmStatus(1, false);

        await roomRental.connect(renter1).moveIn();
        await checkSampleRoomTentalCfmStatus(1, true);
        await checkSampleRoomTentalEndStatus(1, false);

        await (expect(roomRental.connect(renter1).refundRoom())).to.be.revertedWith("The rent has been confirmed");
    });

    it("Refund Test#02 renter could not refund after end (move out)", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await addSampleRoom(rentee);

        await roomRental.connect(renter1).rentRoom(1, 10, { value: etherAmountTenMonthRent });
        await checkSampleRoomTentalAvaiStatus(1, false);
        await checkSampleRoomTentalCfmStatus(1, false);

        await roomRental.connect(renter1).moveIn();
        await checkSampleRoomTentalCfmStatus(1, true);
        await checkSampleRoomTentalEndStatus(1, false);

        await roomRental.connect(renter1).moveOut();
        await checkSampleRoomTentalEndStatus(1, true);
        await checkSampleRoomTentalAvaiStatus(1, true);

        await (expect(roomRental.connect(renter1).refundRoom())).to.be.revertedWith("The rent has been confirmed");
    });


    it("WithDraw Deposit Test#01 Valid rentee could withdrawl deposit the money once renter payed the rental fee", async function () {
        await signUpAndLogin(rentee, "alex", "12345");
        await signUpAndLogin(renter1, "tim", "6789");
        await addSampleRoom(rentee);
        await checkSampleRoomTentalAvaiStatus(1, true);
        await checkSampleRoomTentalCfmStatus(1, false);

        // Get the rentee balance before renter rent room
        const renteeBalanceBeforeRentIn = await roomRental.connect(rentee).getUserBalance();
        assert.equal(renteeBalanceBeforeRentIn, BigInt(0));

        await roomRental.connect(renter1).rentRoom(1, 10, { value: etherAmountTenMonthRent });
        await checkSampleRoomTentalAvaiStatus(1, false);

        // Get the rentee balance before renter move in
        const renteeBalanceBeforeMoveIn = await roomRental.connect(rentee).getUserBalance();
        assert.equal(renteeBalanceBeforeMoveIn, BigInt(0));

        await roomRental.connect(renter1).moveIn();
        await checkSampleRoomTentalCfmStatus(1, true);

        // Get the rentee balance after renter move in
        const renteeBalanceAfterMoveIn = await roomRental.connect(rentee).getUserBalance();
        assert.equal(renteeBalanceAfterMoveIn, BigInt(etherAmountTenMonthRent));

        // Get the rentee balance after rentee withdraw the deposit
        await roomRental.connect(rentee).withdrawDeposit();
        const renteeBalanceAfterWithDrawalDepo = await roomRental.connect(rentee).getUserBalance();
        assert.equal(renteeBalanceAfterWithDrawalDepo, BigInt(0));
    });

    // Helper function to sign up and log in a user
    async function signUpAndLogin(user, username, password) {
        await roomRental.connect(user).userSignUp(username, password);
        await roomRental.connect(user).userLogin(password);
    }

    // Helper function to sign up and log in a user
    async function addSampleRoom(user) {
        await roomRental.connect(user).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
    }

    // Helper function to check room rental availability status
    async function checkSampleRoomTentalAvaiStatus(roomId, expectedValue) {
        expect(await roomRental.connect(rentee).isRoomAvailable(roomId)).to.equal(expectedValue);
    }

    // Helper function to check room rental confirmation status
    async function checkSampleRoomTentalCfmStatus(roomId, expectedValue) {
        expect(await roomRental.connect(rentee).isRentalRoomConfirmed(roomId)).to.equal(expectedValue);
    }

    // Helper function to check room rental ending status
    async function checkSampleRoomTentalEndStatus(roomId, expectedValue) {
        expect(await roomRental.connect(rentee).isRentalRoomEnded(roomId)).to.equal(expectedValue);
    }
});
