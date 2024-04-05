import React, {useState} from 'react';
import {Button, Form, FormGroup, Input, Label} from 'reactstrap';
import {useLocation, useNavigate} from 'react-router-dom';

const SignUpPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Retrieve the state passed from the AuthPage
    const {addressHash} = location.state || {};

    const handleSignUp = () => {
        if (!addressHash) {
            alert('Ethereum address not found. Please connect your wallet.');
            return;
        }

        // Basic validation
        if (!username || !password) {
            alert('Please fill in all fields.');
            return;
        }

        localStorage.setItem(addressHash, JSON.stringify({username, password}));
        navigate('/dashboard', {state: {addressHash}});
    };

    return (
        <Form className="signup-form">
            <h2>Sign Up</h2>
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
            <Button color="primary" onClick={handleSignUp}>Sign Up</Button>
        </Form>
    );
};

export default SignUpPage;
