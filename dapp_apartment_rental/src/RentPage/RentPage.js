import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useContract } from '../ContractContext/ContractContext'; // Assuming you have a context for the contract

const RentPage = () => {
    let navigate = useNavigate();
    const { contract } = useContract(); // Get the contract instance from context
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        // Function to load available rooms from the smart contract
        const loadAvailableRooms = async () => {
            if (contract) {
                try {
                    const availableRooms = await contract.methods.getAllAvailableRooms().call();
                    setRooms(availableRooms);
                } catch (error) {
                    console.error("Error fetching available rooms:", error);
                }
            }
        };

        loadAvailableRooms();
    }, [contract]); // Dependency array ensures this effect runs when the contract instance is available

    return (
        <div className="rent-page">
            <h1>EtheRent</h1>
            <h2>Rent a Room</h2>
            {
                rooms.map((room, index) => (
                    <div key={index}>
                        <h3>Room {room.roomId}</h3>
                        <p>Location: {room.location}</p>
                        <p>Intro: {room.intro}</p>
                        <p>Price: {room.monthPrice} Wei per month</p>
                    </div>
                ))
            }
            <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
    );
};

export default RentPage;
