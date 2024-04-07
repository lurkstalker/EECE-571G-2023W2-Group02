import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardText, CardTitle, FormGroup, Input, Label } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useContract } from '../ContractContext/ContractContext';

const RentPage = () => {
    let navigate = useNavigate();
    const { contract, userAddress } = useContract();
    const [rooms, setRooms] = useState([]);
    const [rentDurations, setRentDurations] = useState({});
    const [loading, setLoading] = useState(false);
    const [userRental, setUserRental] = useState(null);

    useEffect(() => {
        const fetchRoomDetails = async () => {
            setLoading(true);
            try {
                const allRooms = await contract.methods.getAllRooms().call();
                const userRentalInfo = await contract.methods.getRenterRentalInfo().call({ from: userAddress });

                setUserRental(userRentalInfo.isValid ? userRentalInfo : null);

                let enrichedRooms = await Promise.all(allRooms.map(async room => {
                    const rentalInfo = await contract.methods.getRoomRentalInfo(room.roomId).call();
                    return {
                        ...room,
                        rentedByUser: userRentalInfo.roomId === room.roomId,
                        isRented: rentalInfo.isValid
                    };
                }));

                // Sort rooms: user's rented rooms first, then available rooms, then unavailable rooms
                enrichedRooms.sort((a, b) => {
                    if (a.rentedByUser) return -1;
                    if (b.rentedByUser) return 1;
                    return a.isAvailable === b.isAvailable ? 0 : a.isAvailable ? -1 : 1;
                });

                setRooms(enrichedRooms);
            } catch (error) {
                console.error("Error fetching room details:", error);
            }
            setLoading(false);
        };

        fetchRoomDetails();
    }, [contract, userAddress]);

    const handleRentRoom = async (roomId, monthPrice) => {
        if (!contract || !userAddress) {
            alert('Please connect to your wallet first.');
            return;
        }

        const duration = rentDurations[roomId];
        setLoading(true);

        try {
            const userRentalInfo = await contract.methods.getRenterRentalInfo().call({ from: userAddress });
            const isRentalRoomValid = userRentalInfo.isValid;
            if (!isRentalRoomValid) {
                await contract.methods.rentRoom(roomId, duration).send({
                    from: userAddress,
                    value: monthPrice * duration
                });
                alert('Room rented successfully!');
            } else {
                alert('You cannot rent this room at the moment since you already has a room rental');
            }
        } catch (error) {
            alert('Error renting room:', error.message);
        }

        setLoading(false);
    };

    //...
    return (
        <div className="rent-page">
            <h1>EtheRent</h1>
            <h2>Rent a Room</h2>
            {loading ? (
                <p>Loading rooms...</p>
            ) : (
                <div className="room-cards">
                    {rooms.map(room => (
                        <Card key={room.roomId} style={{width: '18rem', margin: '1rem'}}>
                            <CardBody>
                                <CardTitle tag="h5">Room {room.roomId}</CardTitle>
                                <CardText>Location: {room.location}</CardText>
                                <CardText>Intro: {room.intro}</CardText>
                                <CardText>Price: {room.monthPrice} Wei per month</CardText>
                                <CardText style={{color: room.rentedByUser ? 'blue' : room.isAvailable ? 'green' : 'red'}}>
                                    {room.rentedByUser ? 'Rented by you' : room.isAvailable ? 'Available' : 'Not available'}
                                </CardText>
                                {room.isAvailable && !room.rentedByUser && (
                                    <FormGroup>
                                        <Label for={`duration-${room.roomId}`}>Duration (months)</Label>
                                        <Input
                                            type="number"
                                            id={`duration-${room.roomId}`}
                                            value={rentDurations[room.roomId]}
                                            onChange={e => setRentDurations({
                                                ...rentDurations,
                                                [room.roomId]: e.target.value
                                            })}
                                            min="1"
                                        />
                                    </FormGroup>
                                )}
                                {room.isAvailable && !room.rentedByUser && (
                                    <Button color="success" onClick={() => handleRentRoom(room.roomId, room.monthPrice)}
                                            disabled={loading}>
                                        Rent
                                    </Button>
                                )}
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
            <Button color="secondary" onClick={() => navigate(-1)}>Back</Button>
        </div>
    );
};

export default RentPage;