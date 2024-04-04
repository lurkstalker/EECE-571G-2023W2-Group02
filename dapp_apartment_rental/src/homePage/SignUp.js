import React, { useState } from 'react';
import Web3 from 'web3';

const SignUp = ({ contract }) => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async () => {
        try {
            // Ensure web3 and contract are initialized
            if (!contract) return;

            // Call the userSignUp function from your smart contract
            await contract.methods.userSignUp(userName, Web3.utils.sha3(password)).send({ from: window.ethereum.selectedAddress });
            alert('Sign up successful!');
        } catch (error) {
            console.error('Sign up error:', error);
            alert('Sign up failed!');
        }
    };

    return (
        <div>
            <h2>Sign Up</h2>
            <input type="text" placeholder="Username" value={userName} onChange={(e) => setUserName(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleSignUp}>Sign Up</button>
        </div>
    );
};

export default SignUp;
