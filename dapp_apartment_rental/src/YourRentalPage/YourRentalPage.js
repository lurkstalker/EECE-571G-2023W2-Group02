import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardTitle, CardText } from 'reactstrap';
import { useContract } from '../ContractContext/ContractContext';

const YourRentalPage = () => {
    const { contract, userAddress } = useContract();
    const [rentalInfo, setRentalInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRentalInfo = async () => {
            setLoading(true);
            try {
                const info = await contract.methods.getRenterRentalInfo().call({ from: userAddress });
                if (info.isValid) {
                    setRentalInfo(info);
                }
            } catch (error) {
                console.error("Error fetching rental info:", error);
            }
            setLoading(false);
        };

        if (contract && userAddress) {
            fetchRentalInfo();
        }
    }, [contract, userAddress]);

    const handleAction = async (action) => {
        if (!contract || !userAddress) return;

        setLoading(true);
        try {
            if (action === 'moveIn') {
                await contract.methods.moveIn().send({ from: userAddress });
                alert('Moved in successfully!');
            } else if (action === 'moveOut') {
                await contract.methods.moveOut().send({ from: userAddress });
                alert('Moved out successfully!');
            } else if (action === 'refund') {
                await contract.methods.refundRoom().send({ from: userAddress });
                alert('Refunded successfully!');
            }
            // Refresh rental info after action
            const updatedInfo = await contract.methods.getRenterRentalInfo().call({ from: userAddress });
            setRentalInfo(updatedInfo.isValid ? updatedInfo : null);
        } catch (error) {
            alert(`Error during ${action}: ${error.message}`);
        }
        setLoading(false);
    };

    if (loading) return <p>Loading...</p>;

    if (!rentalInfo) return <p>You don't have any active rentals.</p>;

    return (
        <Card style={{ width: '30rem', margin: 'auto', marginTop: '2rem' }}>
            <CardBody>
                <CardTitle tag="h5">Your Rental Info</CardTitle>
                <CardText>Room ID: {rentalInfo.roomId}</CardText>
                <CardText>Duration: {rentalInfo.rentDuration} month(s)</CardText>
                <CardText>Status: {rentalInfo.hasConfirmed ? 'Moved In' : 'Not Moved In'}</CardText>
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
            </CardBody>
        </Card>
    );
};

export default YourRentalPage;
