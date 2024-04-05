import React, {useState} from 'react';
import {Button} from 'reactstrap';
import Web3 from 'web3';
import {useNavigate} from 'react-router-dom';
import {keccak256} from "js-sha3";

const HomePage = () => {
    const [web3, setWeb3] = useState(null);
    const navigate = useNavigate();

    const connectWalletHandler = async () => {
        if (window.ethereum) {
            try {
                // Request account access
                const newAccounts = await window.ethereum.request({method: 'eth_requestAccounts'});

                // Create a Web3 instance
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                // If accounts are successfully fetched, navigate to the sign up / login page
                if (newAccounts.length > 0) {
                    // Assuming the first account is used for the authentication
                    const addressHash = keccak256(newAccounts[0]);
                    navigate('/auth', {state: {addressHash}});
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
