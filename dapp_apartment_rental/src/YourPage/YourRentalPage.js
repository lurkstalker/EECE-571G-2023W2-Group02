import React, {useEffect, useState} from 'react';
import {Button, Card, CardBody, CardText, CardTitle} from 'reactstrap';
import {useContract} from '../ContractContext/ContractContext';

const YourRentalPage = () => {
    const [rentalInfo, setRentalInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [ownerBalance, setOwnerBalance] = useState(0);
    const {userAddress, createContractInstance, getWeb3, contractAddress} = useContract();
    const contract = createContractInstance(getWeb3(), contractAddress);

    useEffect(() => {
        const fetchInfo = async () => {
            setLoading(true);
            try {
                // Fetch rental info if the user has rented a room
                const info = await contract.methods.getRenterRentalInfo().call({from: userAddress});
                setRentalInfo(info.isValid ? info : null);

                // Check if the user owns any room and fetch balance
                const totalRooms = await contract.methods.getCurMaxRoomId().call();
                for (let i = 1; i <= totalRooms; i++) {
                    const room = await contract.methods.getRoomInfo(i).call();
                    // alert("room.owner address is " + room.owner + "\n" + "userAddress is " + userAddress)
                    if (room.owner.toLowerCase() === userAddress.toLowerCase()) {
                        setIsOwner(true);
                        break;
                    }
                }

                // Fetch the owner's balance
                if (isOwner) {
                    const balance = await contract.methods.getUserBalance().call({from: userAddress});
                    setOwnerBalance(balance);
                }
            } catch (error) {
                console.error("Error fetching info:", error);
            }
            setLoading(false);
        };

        if (contract && userAddress) {
            fetchInfo();
        }
    }, []);

    const handleAction = async (action) => {
        if (!contract || !userAddress) return;

        setLoading(true);
        try {
            if (action === 'withdraw') {
                await contract.methods.withdrawDeposit().send({from: userAddress});
                alert('Withdrawal successful!');
                setOwnerBalance(0);
            } else {
                // Handle other actions (moveIn, moveOut, refund)
                if (action === 'moveIn') {
                    await contract.methods.moveIn().send({from: userAddress});
                    alert('Moved in successfully!');
                } else if (action === 'moveOut') {
                    await contract.methods.moveOut().send({from: userAddress});
                    alert('Moved out successfully!');
                } else if (action === 'refund') {
                    await contract.methods.refundRoom().send({from: userAddress});
                    alert('Refunded successfully!');
                }
                // Refresh rental info after action
                const updatedInfo = await contract.methods.getRenterRentalInfo().call({from: userAddress});
                setRentalInfo(updatedInfo.isValid ? updatedInfo : null);
            }
        } catch (error) {
            alert(`Error during ${action}: ${error.message}`);
        }
        setLoading(false);
    };

    if (loading) return <p>Loading...</p>;

    return (
        <Card style={{width: '30rem', margin: 'auto', marginTop: '2rem'}}>
            <CardBody>
                <CardTitle tag="h5">Your Rental Info</CardTitle>
                {rentalInfo && (
                    <>
                        <CardText>Room ID: {rentalInfo.roomId}</CardText>
                        <CardText>Duration: {rentalInfo.rentDuration} month(s)</CardText>
                        <CardText>Status: {rentalInfo.hasConfirmed ? 'Moved In' : 'Not Moved In'}</CardText>
                        {/* Render buttons for moveIn, moveOut, refund similar to previous implementation */}
                        {!rentalInfo.hasConfirmed && (
                            <>
                                <Button color="primary" onClick={() => handleAction('moveIn')} disabled={loading}>
                                    Move In
                                </Button>{' '}
                                <Button color="danger" onClick={() => handleAction('refund')} disabled={loading}>
                                    Refund
                                </Button>
                            </>
                        )}
                        {rentalInfo.hasConfirmed && (
                            <Button color="secondary" onClick={() => handleAction('moveOut')} disabled={loading}>
                                Move Out
                            </Button>
                        )}
                    </>
                )}
                {!rentalInfo && <CardText>You don't have any active rentals.</CardText>}
                {isOwner && (
                    <>
                        <CardText>Owner Balance: {ownerBalance} Wei</CardText>
                        <Button color="warning" onClick={() => handleAction('withdraw')}
                                disabled={loading || ownerBalance === 0}>
                            Withdraw Balance
                        </Button>
                    </>
                )}
            </CardBody>
        </Card>
    );
};

export default YourRentalPage;
