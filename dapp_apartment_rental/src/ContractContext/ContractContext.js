import React, { createContext, useState, useContext } from 'react';

const ContractContext = createContext();

export const useContract = () => useContext(ContractContext);

export const ContractProvider = ({ children }) => {
    const [contract, setContract] = useState(null);

    const value = {
        contract,
        setContract
    };

    return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>;
};
