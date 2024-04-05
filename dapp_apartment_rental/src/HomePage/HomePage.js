import React from 'react';
import { Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    let navigate = useNavigate();
    return (
        <div className="home-page">
            <h1>Welcome to EtheRent</h1>
            <p>Find your dream room</p>
            <Button color="primary" onClick={() => navigate('/login')}>Login</Button>{' '}
            <Button color="secondary" onClick={() => navigate('/signup')}>Sign Up</Button>
            <p>Secure, safe and transparent way to find and rent your home</p>
        </div>
    );
};

export default HomePage;
