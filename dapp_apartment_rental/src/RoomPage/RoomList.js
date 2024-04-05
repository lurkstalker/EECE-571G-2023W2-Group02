import React, { useState } from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

const ListPage = () => {
    let navigate = useNavigate();
    const [roomDetails, setRoomDetails] = useState({
        location: '',
        intro: '',
        price: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRoomDetails({
            ...roomDetails,
            [name]: value
        });
    };

    const addRoom = () => {
        const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
        const newRoom = {
            id: rooms.length + 1,
            ...roomDetails
        };
        rooms.push(newRoom);
        localStorage.setItem('rooms', JSON.stringify(rooms));
        navigate('/rent');
    };

    const deleteRoom = (roomId) => {
        let rooms = JSON.parse(localStorage.getItem('rooms')) || [];
        rooms = rooms.filter(room => room.id !== roomId);
        localStorage.setItem('rooms', JSON.stringify(rooms));
        navigate('/rent');
    };

    return (
        <Form className="list-page">
            <h1>EtheRent</h1>
            <h2>List a Room</h2>
            <FormGroup>
                <Label for="location">Location</Label>
                <Input
                    type="text"
                    name="location"
                    id="location"
                    placeholder="Location"
                    value={roomDetails.location}
                    onChange={handleInputChange}
                />
            </FormGroup>
            <FormGroup>
                <Label for="intro">Intro</Label>
                <Input
                    type="text"
                    name="intro"
                    id="intro"
                    placeholder="Intro"
                    value={roomDetails.intro}
                    onChange={handleInputChange}
                />
            </FormGroup>
            <FormGroup>
                <Label for="price">Price</Label>
                <Input
                    type="text"
                    name="price"
                    id="price"
                    placeholder="Price"
                    value={roomDetails.price}
                    onChange={handleInputChange}
                />
            </FormGroup>
            <Button color="success" onClick={addRoom}>Add Room</Button>{' '}
            <Button color="danger" onClick={() => deleteRoom(roomDetails.id)}>Delete Room</Button>{' '}
            <Button onClick={() => navigate(-1)}>Back</Button>
        </Form>
    );
};

export default ListPage;

