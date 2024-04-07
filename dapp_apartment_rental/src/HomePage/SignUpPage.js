import React, {useState} from 'react';
import {Button, Form, FormGroup, Input, Label} from 'reactstrap';
import {useNavigate} from 'react-router-dom';
import {useContract} from '../ContractContext/ContractContext';

const SignUpPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {contract,userAddress} = useContract();

    const handleSignUp = async () => {
        if (!userAddress) {
            alert('Ethereum address not found. Please connect your wallet.');
            return;
        }

        // Basic validation
        if (!username || !password) {
            alert('Please fill in all fields.');
            return;
        }
        if (contract) {
            alert(userAddress)
            const isUserHasSignUp = (await contract.methods.getUserStatus().call({from :userAddress})).isValid;
            const isUserHasLogin = (await contract.methods.getUserStatus().call({from :userAddress})).loggedIn;
            if (!isUserHasSignUp) {
                await contract.methods.userSignUp(username, password).send({ from: userAddress });
                alert("User sign up state is " + isUserHasSignUp + "\n" + "login in state is " + isUserHasLogin);
                localStorage.setItem(userAddress, JSON.stringify({username, password}));
                // todo edit the contract so that we know if the user has sign up successfully
                navigate('/dashboard');
            }
            else {
                alert("You have signed up with your address. Go to login page")
                localStorage.setItem(userAddress, JSON.stringify({username, password}));
                navigate('/login');
            }
        }
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
