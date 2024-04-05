import React, {useState} from 'react';
import {Button, Form, FormGroup, Input, Label} from 'reactstrap';
import {useLocation, useNavigate} from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Retrieve the state passed from the AuthPage
    const {addressHash} = location.state || {};

    const handleLogin = () => {
        if (!addressHash) {
            alert('Ethereum address not found. Please connect your wallet.');
            return;
        }

        // Use the addressHash for retrieving user data from localStorage
        const userData = localStorage.getItem(addressHash);

        if (userData) {
            const parsedData = JSON.parse(userData);
            if (parsedData.username === username && parsedData.password === password) {
                navigate('/dashboard', {state: {addressHash}});
            } else {
                alert('Invalid username or password.');
            }
        } else {
            alert('No account found with this address.');
        }
    };

    return (
        <Form className="login-form">
            <h2>Log In</h2>
            <FormGroup>
                <Label for="username">Username</Label>
                <Input
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </FormGroup>
            <FormGroup>
                <Label for="password">Password</Label>
                <Input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </FormGroup>
            <Button color="primary" onClick={handleLogin}>Log In</Button>
        </Form>
    );
};

export default LoginPage;
