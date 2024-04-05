import React from 'react';
import {Button} from 'reactstrap';
import {useLocation, useNavigate} from 'react-router-dom';

const Dashboard = ({}) => {
    let navigate = useNavigate();
    // Retrieve the current user's data from localStorage
    const location = useLocation();
    // Retrieve the state passed from the AuthPage
    const {addressHash} = location.state || {};
    const authUser = JSON.parse(localStorage.getItem(addressHash));
    const userName = authUser ? authUser.username : 'Guest';

    return (
        <div className="dashboard">
            <h1>EtheRent</h1>
            <h2>Welcome, {userName}</h2>
            <div>Please choose what you want to do:</div>
            <Button color="primary" onClick={() => navigate('/rent')}>Rent</Button>{' '}
            <Button color="primary" onClick={() => navigate('/list')}>List</Button>{' '}
            <Button color="primary" onClick={() => navigate('/appointments')}>Appointments</Button>
        </div>
    );
};

export default Dashboard;
