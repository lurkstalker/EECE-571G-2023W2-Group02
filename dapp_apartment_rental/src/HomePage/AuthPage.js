import React from 'react';
import {Button, Col, Container, Row} from 'reactstrap';
import {useLocation, useNavigate} from 'react-router-dom';

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve the state passed from the HomePage
    const {addressHash} = location.state || {};
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
