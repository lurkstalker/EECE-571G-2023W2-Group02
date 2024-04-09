import React, { useState } from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useContract } from '../ContractContext/ContractContext';

const ListRoomPage = () => {
    const [location, setLocation] = useState('');
    const [intro, setIntro] = useState('');
    const [price, setPrice] = useState('');
    const [roomIdToDelete, setRoomIdToDelete] = useState('');
    const {userAddress, createContractInstance, getWeb3, contractAddress} = useContract();
    const contract = createContractInstance(getWeb3(), contractAddress);

    const handleAddRoom = async () => {
        if (!contract) {
            console.error('Contract not loaded');
            return;
        }

        try {
            await contract.methods.addRoom(location, intro, price).send({ from: userAddress });
            // Clear the input fields after successful addition
            setLocation('');
            setIntro('');
            setPrice('');
            alert('Room added successfully!');
        } catch (error) {
            alert('Failed to add room. Error: ' + error.message);
        }
    };

    const handleDeleteRoom = async () => {
        if (!contract) {
            console.error('Contract not loaded');
            return;
        }

        try {
            await contract.methods.deleteRoom(roomIdToDelete).send({ from: userAddress });
            setRoomIdToDelete('');
            alert('Room deleted successfully!');
        } catch (error) {
            alert('Failed to delete room. Error: ' + error.message);
        }
    };

    return (
        <div className="list-room-page">
            <h2>Room</h2>
            <Form>
                <FormGroup>
                    <Label for="location">Location</Label>
                    <Input type="text" name="location" id="location" value={location} onChange={e => setLocation(e.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Label for="intro">Intro</Label>
                    <Input type="text" name="intro" id="intro" value={intro} onChange={e => setIntro(e.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Label for="price">Price (per month)</Label>
                    <Input type="number" name="price" id="price" value={price} onChange={e => setPrice(e.target.value)} />
                </FormGroup>
                <Button onClick={handleAddRoom}>Add Room</Button>
            </Form>
            <hr />
            <Form>
                <FormGroup>
                    <Label for="roomIdToDelete">Room ID to Delete</Label>
                    <Input type="number" name="roomIdToDelete" id="roomIdToDelete" value={roomIdToDelete} onChange={e => setRoomIdToDelete(e.target.value)} />
                </FormGroup>
                <Button onClick={handleDeleteRoom}>Delete Room</Button>
            </Form>
        </div>
    );
};

export default ListRoomPage;
