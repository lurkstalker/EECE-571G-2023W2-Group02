import React, { useState } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import RoomRentalABI from '../RoomRentalABI.json';
var CONFIG = require('../config.json');

const contractAddress = CONFIG.sm_address; // Replace with your contract address

const Auth = () => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'userName') setUserName(value);
        if (name === 'password') setPassword(value);
    };

    const connectWallet = async () => {
        const provider = await detectEthereumProvider();
        if (provider) {
            await provider.request({ method: 'eth_requestAccounts' });
            const web3Instance = new Web3(provider);
            setWeb3(web3Instance);
            const roomRentalContract = new web3Instance.eth.Contract(RoomRentalABI, contractAddress);
            setContract(roomRentalContract);
        } else {
            console.error('Please install MetaMask!');
        }
    };

    const signUp = async () => {
        if (!contract) return;
        try {
            const accounts = await web3.eth.getAccounts();
            await contract.methods.userSignUp(userName, password).send({ from: accounts[0] });
            alert('Sign up successful!');
        } catch (error) {
            console.error('Error signing up:', error);
            alert('Sign up failed!');
        }
    };

    const login = async () => {
        if (!contract) return;
        try {
            const accounts = await web3.eth.getAccounts();
            await contract.methods.userLogin(password).send({ from: accounts[0] });
            alert('Login successful!');
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Login failed!');
        }
    };

    return (
        <div>
            <button onClick={connectWallet}>Connect Wallet</button>
            <div>
                <input name="userName" value={userName} onChange={handleInputChange} placeholder="User Name" />
                <input name="password" type="password" value={password} onChange={handleInputChange} placeholder="Password" />
                <button onClick={signUp}>Sign Up</button>
                <button onClick={login}>Login</button>
            </div>
        </div>
    );
};

export default Auth;
