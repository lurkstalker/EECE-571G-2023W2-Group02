import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

const RentPage = () => {
    let navigate = useNavigate();
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        // Load rooms from localStorage
        setRooms(JSON.parse(localStorage.getItem('rooms')) || []);
    }, []);

    return (
        <div className="rent-page">
            <h1>EtheRent</h1>
            <h2>Rent a Room</h2>
            {
                rooms.map(room => (
                    <div key={room.id}>
                        <h3>{room.name}</h3>
                        <p>{room.location}</p>
                        <p>{room.intro}</p>
                        <p>{room.price}</p>
                    </div>
                ))
            }
            <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
    );
};

export default RentPage;
