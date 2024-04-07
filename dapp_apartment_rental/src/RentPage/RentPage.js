import React, {useEffect, useState} from 'react';
import {Button, Card, CardBody, CardText, CardTitle, FormGroup, Input, Label} from 'reactstrap';
import {useNavigate} from 'react-router-dom';
import {useContract} from '../ContractContext/ContractContext';

const RentPage = () => {
    let navigate = useNavigate();
    const {contract, userAddress} = useContract();
    const [rooms, setRooms] = useState([]);
    const [rentDurations, setRentDurations] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadAvailableRooms = async () => {
            if (contract) {
                setLoading(true);
                try {
                    const availableRooms = await contract.methods.getAllAvailableRooms().call();
                    setRooms(availableRooms.filter(room => room.isAvailable)); // Show only available rooms
                    let initialDurations = {};
                    availableRooms.forEach(room => {
                        initialDurations[room.roomId] = 1; // Default duration of 1 month
                    });
                    setRentDurations(initialDurations);
                } catch (error) {
                    console.error("Error fetching available rooms:", error);
                }
                setLoading(false);
            }
        };

        loadAvailableRooms();
    }, [contract]);

    const handleRentRoom = async (roomId, monthPrice) => {
        if (!contract || !userAddress) {
            alert('Please connect to your wallet first.');
            return;
        }

        const duration = rentDurations[roomId];
        setLoading(true);

        try {

            // const isRentalRoomValid = await contract.methods.isRentalRoomValid(roomId).call();
            // const isEnded = await contract.methods.isRentalRoomEnded(roomId).call();
            // if (!isRentalRoomValid || isEnded) {
            await contract.methods.rentRoom(roomId, duration)
                .send({from: userAddress, value: monthPrice * duration});
            alert('Room rented successfully!');
            // } else {
            //     alert('You cannot rent this room at the moment.');
            // }
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
                                <Button color="success" onClick={() => handleRentRoom(room.roomId, room.monthPrice)}
                                        disabled={loading}>
                                    Rent
                                </Button>
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
