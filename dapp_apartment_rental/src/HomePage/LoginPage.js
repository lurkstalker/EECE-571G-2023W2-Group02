import React, {useState} from 'react';
import {Button, Form, FormGroup, Input, Label} from 'reactstrap';
import {useNavigate} from 'react-router-dom';
import {useContract} from "../ContractContext/ContractContext";

const LoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    let [contract, setContract] = useState(null);
    const {userAddress, createContractInstance, getWeb3, contractAddress} = useContract();

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

        if (!contract) {
            contract = createContractInstance(getWeb3(), contractAddress);
        }

        if (contract) {
            const userStatus = await contract.methods.getUserStatus().call({from: userAddress})
            const isUserHasSignUp = userStatus.isValid;
            const isUserHasLogin = userStatus.loggedIn;
            const serverUserName = userStatus.userName;
            alert("User sign up state is " + isUserHasSignUp + "\n" + "login in state is " + isUserHasLogin);
            if (!isUserHasSignUp) {
                alert("You need to sign up firstly");
            } else {
                if (!isUserHasLogin) {
                    if (serverUserName === username) {
                        await contract.methods.userLogin(password).send({from: userAddress});
                    } else {
                        alert("Wrong username");
                    }
                    // todo edit the contract so that we know if the user has login successfully
                }
                alert('Login in Successfully!');
                localStorage.setItem(userAddress, JSON.stringify({serverUserName, password}));
                navigate('/dashboard')
            }
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
