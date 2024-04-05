import React from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    let navigate = useNavigate();
    return (
        <Form className="login-form">
            <h2>Login</h2>
            <FormGroup>
                <Label for="username">Username</Label>
                <Input type="text" name="username" id="username" placeholder="Username" />
            </FormGroup>
            <FormGroup>
                <Label for="password">Password</Label>
                <Input type="password" name="password" id="password" placeholder="Password" />
            </FormGroup>
            <Button color="primary" onClick={() => navigate('/')}>Login</Button>
        </Form>
    );
};

export default LoginPage;
