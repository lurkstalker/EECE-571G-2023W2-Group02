import React, {createContext, useContext, useState} from 'react';

const ContractContext = createContext(undefined);

export const useContract = () => useContext(ContractContext);

export const ContractProvider = ({children}) => {
    const [contract, setContract] = useState(null);
    const [userAddress, setUserAddress] = useState(null);

    const value = {
        contract,
        setContract,
        userAddress,
        setUserAddress
    };

    return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>;
};
