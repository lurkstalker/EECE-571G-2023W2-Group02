import React, {useEffect, useState} from 'react';
import {Button, Col, Container, Row} from 'reactstrap';
import {useLocation, useNavigate} from 'react-router-dom';
import {useContract} from '../ContractContext/ContractContext';

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve the state passed from the HomePage
    const {addressHash} = location.state || {};
    const {rentalContract} = useContract();
    const [totalRoomCount, setTotalRoomCount] = useState(0);  // State to store the total room count

    useEffect(() => {
        const fetchTotalRoomCount = async () => {
            if (rentalContract) {
                const count = await rentalContract.methods.getTotalRoomCount().call();
                setTotalRoomCount(count);
            }
        };

        fetchTotalRoomCount();
    }, [rentalContract]);  // Effect runs when the rentalContract is set

    const goToSignUp = () => {
        navigate('/signup', {state: {addressHash}});
    };

    const goToLogin = () => {
        navigate('/login', {state: {addressHash}});
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
