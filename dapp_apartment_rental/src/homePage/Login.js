import React, { useState } from 'react';
import Web3 from 'web3';

const Login = ({ contract }) => {
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            // Ensure web3 and contract are initialized
            if (!contract) return;

            // Call the userLogin function from your smart contract
            await contract.methods.userLogin(Web3.utils.sha3(password)).send({ from: window.ethereum.selectedAddress });
            alert('Login successful!');
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed!');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default Login;
