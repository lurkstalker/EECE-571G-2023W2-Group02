const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("RoomRental contract", function () {

    let etherAmountStr = "1000000000000000000";
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

    it("Rentee should be able to add a room", async function () {
        await roomRental.connect(rentee).userSignUp("alex", "12345");
        await roomRental.connect(rentee).userLogin("12345");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        expect(await roomRental.connect(rentee).getRoomLocation(1)).to.equal("Downtown");
        expect(await roomRental.connect(rentee).getRoomIntro(1)).to.equal("Nice view");
        const roomRentalPrice = await roomRental.connect(rentee).getRoomPrice(1);
        assert.equal(roomRentalPrice, BigInt(etherAmountStr));

    });

    it("Rentee should be able to delete a room", async function () {
        await roomRental.connect(rentee).userSignUp("alex", "12345");
        await roomRental.connect(rentee).userLogin("12345");
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

    it("Rentee should not be able to delete a room if operator is not the room owner", async function () {
        await roomRental.connect(rentee).userSignUp("alex", "12345");
        await roomRental.connect(rentee).userLogin("12345");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        await roomRental.connect(renter1).userSignUp("tim", "6789");
        await roomRental.connect(renter1).userLogin("6789");
        await expect(roomRental.connect(renter1).deleteRoom(1)).to.be.revertedWith("Only the room owner can delete the room.");
    });

    it("Renter can make an appointment if the room is available", async function () {
        await roomRental.connect(rentee).userSignUp("alex", "12345");
        await roomRental.connect(rentee).userLogin("12345");
        await roomRental.connect(renter1).userSignUp("tim", "6789");
        await roomRental.connect(renter1).userLogin("6789");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        await roomRental.connect(renter1).makeAppointment(1);
        expect(await roomRental.connect(renter1).checkAppointmentStatus(1)).to.equal(true);
    });

    it("Renter can not make an appointment if the room is already booked", async function () {
        await roomRental.connect(rentee).userSignUp("alex", "12345");
        await roomRental.connect(rentee).userLogin("12345");
        await roomRental.connect(renter1).userSignUp("tim", "6789");
        await roomRental.connect(renter1).userLogin("6789");
        await roomRental.connect(renter2).userSignUp("brandon", "13579");
        await roomRental.connect(renter2).userLogin("13579");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        await roomRental.connect(renter1).makeAppointment(1);
        await expect(roomRental.connect(renter2).makeAppointment(1)).to.be.revertedWith("Appointment already exists for this room");
    });

    it("Should not allow making an appointment if the room does not exist", async function () {
        await roomRental.connect(renter1).userSignUp("tim", "6789");
        await roomRental.connect(renter1).userLogin("6789");
        await expect(roomRental.connect(renter1).makeAppointment(1)).to.be.revertedWith("Room does not exist");
    });

    it("Rentee and renter can view the status of an appointment", async function () {
        await roomRental.connect(rentee).userSignUp("alex", "12345");
        await roomRental.connect(rentee).userLogin("12345");
        await roomRental.connect(renter1).userSignUp("tim", "6789");
        await roomRental.connect(renter1).userLogin("6789");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        await roomRental.connect(renter1).makeAppointment(1);

        const appointmentDetailsForRentee = await roomRental.connect(rentee).getAppointmentDetails(1);
        expect(appointmentDetailsForRentee.isValid).to.equal(true);

        const appointmentDetailsForRenter = await roomRental.connect(renter1).getAppointmentDetails(1);
        expect(appointmentDetailsForRenter.isValid).to.equal(true);
    });

    it("Others who are not Rentee or renter can not view the status of an appointment", async function () {
        await roomRental.connect(rentee).userSignUp("alex", "12345");
        await roomRental.connect(rentee).userLogin("12345");
        await roomRental.connect(renter1).userSignUp("tim", "6789");
        await roomRental.connect(renter1).userLogin("6789");
        await roomRental.connect(renter2).userSignUp("brandon", "13579");
        await roomRental.connect(renter2).userLogin("13579");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        await roomRental.connect(renter1).makeAppointment(1);

        const appointmentDetailsForRentee = await roomRental.connect(rentee).getAppointmentDetails(1);
        expect(appointmentDetailsForRentee.isValid).to.equal(true);

        const appointmentDetailsForRenter = await roomRental.connect(renter1).getAppointmentDetails(1);
        expect(appointmentDetailsForRenter.isValid).to.equal(true);

        expect(roomRental.connect(renter2).getAppointmentDetails(1)).to.be.revertedWith("Caller must be renter or rentee of the appointment");
    });

    it("Should not allow making an appointment if one already exists for the room", async function () {
        await roomRental.connect(rentee).userSignUp("alex", "12345");
        await roomRental.connect(rentee).userLogin("12345");
        await roomRental.connect(renter1).userSignUp("tim", "6789");
        await roomRental.connect(renter1).userLogin("6789");
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        await roomRental.connect(renter1).makeAppointment(1);

        // Try to make another appointment for the same room
        await expect(roomRental.connect(renter1).makeAppointment(1)).to.be.revertedWith("Appointment already exists for this room");
    });
    
});
