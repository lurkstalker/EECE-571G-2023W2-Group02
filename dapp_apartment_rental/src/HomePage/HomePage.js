import React from 'react';
import {Button} from 'reactstrap';
import {useContract} from '../ContractContext/ContractContext';
import {useNavigate} from 'react-router-dom';

// Import the contract ABI

// Your deployed contract address
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const HomePage = () => {
    const {updateContractAddress, updateUserAddress} = useContract();
    const navigate = useNavigate();

    const connectWalletHandler = async () => {
        if (window.ethereum) {
            try {
                const newAccounts = await window.ethereum.request({method: 'eth_requestAccounts'});
                updateContractAddress(contractAddress)
                if (newAccounts.length > 0) {
                    // Assuming the first account is used for the authentication
                    localStorage.setItem('userAddress', newAccounts[0]);
                    updateUserAddress(newAccounts[0]);
                    navigate('/auth');
                }
            } catch (error) {
                console.error("User denied account access");
            }
        } else {
            alert('Please install MetaMask to use this feature.');
        }
    };

    return (
        <div className="home-page">
            <h1>EtheRent</h1>
            <p>Find your dream room</p>
            <Button color="primary" onClick={connectWalletHandler}>Connect to Web3</Button>
        </div>
    );
};

export default HomePage;
