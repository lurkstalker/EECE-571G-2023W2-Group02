import React, {useEffect, useState} from 'react';
import {Button, Col, Container, Row} from 'reactstrap';
import {useNavigate} from 'react-router-dom';
import {useContract} from "../ContractContext/ContractContext";

const AuthPage = () => {
    const navigate = useNavigate();
    // State to store the total room count
    const [totalRoomCount, setTotalRoomCount] = useState(0);
    const {createContractInstance, getWeb3, contractAddress} = useContract();
    const contract = createContractInstance(getWeb3(), contractAddress);

    useEffect(() => {
        const fetchTotalRoomCount = async () => {
            // Retrieve the state passed from the HomePage
            if (contract) {
                const count = await contract.methods.getTotalRoomCount().call();
                setTotalRoomCount(count);
            }
        };
        fetchTotalRoomCount();
    }, [contractAddress]);  // Effect runs when the rentalContract is set

    const goToSignUp = () => {
        navigate('/signup');
    };

    const goToLogin = () => {
        navigate('/login');
    };

    return (
        <Container className="auth-page">
            <Row>
                <Col sm="12" md={{size: 6, offset: 3}}>
                    <h1>Authentication Required</h1>
                    <p>Total Room Count is: {totalRoomCount}</p>  {/* Display the total room count */}
                    <p>Please choose to either sign up or log in to continue.</p>
                    <Button color="primary" block onClick={goToSignUp}>
                        Sign Up
                    </Button>
                    <Button color="secondary" block onClick={goToLogin}>
                        Log In
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default AuthPage;
