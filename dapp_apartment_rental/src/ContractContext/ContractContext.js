import React, {createContext, useContext, useState} from 'react';
import myContractABI from '../RoomRentalABI.json';
import Web3 from 'web3';

const ContractContext = createContext(undefined);

export const useContract = () => useContext(ContractContext);

export const ContractProvider = ({children}) => {
    const [userAddress, setUserAddress] = useState(localStorage.getItem('userAddress'));
    const [contractAddress, setContractAddress] = useState(localStorage.getItem('contractAddress'));

    // Function to create a new contract instance with the given address
    const createContractInstance = (web3Instance, address) => {
        return new web3Instance.eth.Contract(myContractABI, address);
    };

    // Create a memoized function to get a web3 instance
    const getWeb3 = () => {
        return new Web3(Web3.givenProvider);
    };

    // You can now use getWeb3 and createContractInstance when you need to interact with the contract
    // For example, in a useEffect hook in your components or in a useCallback hook

    const updateContractAddress = (address) => {
        localStorage.setItem('contractAddress', address);
        setContractAddress(address);
    };

    const updateUserAddress = (newAddress) => {
        localStorage.setItem('userAddress', newAddress);
        setUserAddress(newAddress);
    };

    const value = {
        contractAddress,
        updateContractAddress,
        userAddress,
        updateUserAddress,
        getWeb3,
        createContractInstance
    };

    return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>;
};
