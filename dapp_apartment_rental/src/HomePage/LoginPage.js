import React, {useState} from 'react';
import {Button, Form, FormGroup, Input, Label} from 'reactstrap';
import { useNavigate} from 'react-router-dom';
import {useContract} from "../ContractContext/ContractContext";

const LoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const {contract, userAddress} = useContract();


    const handleLogin = async () => {
        if (!userAddress) {
            alert('Ethereum address not found. Please connect your wallet.');
            return;
        }


        // Basic validation
        if (!password) {
            alert('Please fill in all fields.');
            return;
        }
        if (contract) {
            await contract.methods.userLogin(password).send();
            const userSignUp = await contract.methods.getSignUpStatus().call();
            const userLogin = await contract.methods.getLoginStatus().call();
            alert("User sign up state is " + userSignUp + "\n" + "login in state is " + userLogin);
        }
        localStorage.setItem(userAddress, JSON.stringify({username, password}));
        navigate('/dashboard', {state: {userAddress}});

        // Use the addressHash for retrieving user data from localStorage
        const userData = localStorage.getItem(userAddress);

        if (userData) {
            const parsedData = JSON.parse(userData);
            if (parsedData.username === username && parsedData.password === password) {
                navigate('/dashboard', {state: {userAddress}});
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
