import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './HomePage/LoginPage';
import Dashboard from "./HomePage/Dashboard";
import SignUpPage from "./HomePage/SignUpPage";
import AuthPage from "./HomePage/AuthPage";
import HomePage from "./HomePage/HomePage";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} /> {/* AuthPage should have options to navigate to SignUpPage or LoginPage */}
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
};


export default App;

