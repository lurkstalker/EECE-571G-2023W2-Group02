async function main() {
    const RoomRental = await ethers.getContractFactory("RoomRental");
    const roo_rental = await RoomRental.deploy();
    console.log("Contract Deployed to Address:", roo_rental.address);
}
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });