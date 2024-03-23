const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("RoomRental contract", function () {

    let etherAmountStr = "1000000000000000000";
    let roomRental;
    let owner;
    let rentee;
    let renter;

    beforeEach(async function () {
        [owner, rentee, renter] = await ethers.getSigners();
        roomRentalSystem = await ethers.getContractFactory("RoomRental");
        roomRental = await roomRentalSystem.deploy();
    });

    it("Rentee should be able to add a room", async function () {
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        expect(await roomRental.connect(rentee).getRoomLocation(1)).to.equal("Downtown");
        expect(await roomRental.connect(rentee).getRoomIntro(1)).to.equal("Nice view");
        const roomRentalPrice = await roomRental.connect(rentee).getRoomPrice(1);
        assert.equal(roomRentalPrice, BigInt(etherAmountStr));

    });

    it("Renter can make an appointment if the room is available", async function () {
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        const appointmentTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now in seconds
        await roomRental.connect(renter).makeAppointment(1, appointmentTime);
        expect(await roomRental.connect(renter).isAppointmentAvaliable(1)).to.equal(true);;
    });

    it("Should not allow making an appointment if the room does not exist", async function () {
        const appointmentTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now in seconds
        await expect(roomRental.connect(renter).makeAppointment(1, appointmentTime)).to.be.revertedWith("Room does not exist");
    });

    it("Rentee and renter can view the status of an appointment", async function () {
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        const appointmentTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now in seconds
        await roomRental.connect(renter).makeAppointment(1, appointmentTime);

        const appointmentDetailsForRentee = await roomRental.connect(rentee).getAppointmentDetails(1);
        expect(appointmentDetailsForRentee.isValid).to.equal(true);

        const appointmentDetailsForRenter = await roomRental.connect(renter).getAppointmentDetails(1);
        expect(appointmentDetailsForRenter.isValid).to.equal(true);
    });

    it("Should not allow making an appointment if one already exists for the room", async function () {
        await roomRental.connect(rentee).addRoom("Downtown", "Nice view", ethers.parseEther("1"));
        const appointmentTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now in seconds
        await roomRental.connect(renter).makeAppointment(1, appointmentTime);

        // Try to make another appointment for the same room
        await expect(roomRental.connect(renter).makeAppointment(1, appointmentTime + 3600)).to.be.revertedWith("Appointment already exists for this room");
    });
});
