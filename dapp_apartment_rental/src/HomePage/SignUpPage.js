import React from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
    let navigate = useNavigate();
    return (
        <Form className="signup-form">
            <h2>Sign Up</h2>
            <FormGroup>
                <Label for="username">Username</Label>
                <Input type="text" name="username" id="username" placeholder="Username" />
            </FormGroup>
            <FormGroup>
                <Label for="password">Password</Label>
                <Input type="password" name="password" id="password" placeholder="Password" />
            </FormGroup>
            <Button color="primary" onClick={() => navigate('/')}>Sign Up</Button>
        </Form>
    );
};

export default SignupPage;
