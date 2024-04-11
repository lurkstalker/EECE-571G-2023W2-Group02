import React from 'react';
import { Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useContract } from "../ContractContext/ContractContext";

const Dashboard = () => {
    let navigate = useNavigate();
    const { userAddress } = useContract();
    const authUser = JSON.parse(localStorage.getItem(userAddress));
    const userName = authUser ? authUser.serverUserName : 'Guest';

    return (
        <div className="dashboard">
            <h1>EtheRent</h1>
            <h2>Welcome, {userName}</h2>
            <div>Please choose what you want to do:</div>
            <Button color="primary" onClick={() => navigate('/rent')}>Rent</Button>{' '}
            <Button color="primary" onClick={() => navigate('/list')}>List</Button>{' '}
            <Button color="primary" onClick={() => navigate('/appointments')}>Appointments</Button>{' '}
            <Button color="primary" onClick={() => navigate('/your-rental')}>Your Rental</Button>{' '}
            <Button color="primary" onClick={() => navigate('/your-appointments')}>Your Appointments</Button>
            <Button color="primary" onClick={() => navigate('/auth')}>Log Out</Button>
        </div>
    );
};

export default Dashboard;
