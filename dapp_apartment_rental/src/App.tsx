import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LoginPage from './HomePage/LoginPage';
import Dashboard from "./HomePage/Dashboard";
import SignUpPage from "./HomePage/SignUpPage";
import AuthPage from "./HomePage/AuthPage";
import HomePage from "./HomePage/HomePage";
import {ContractProvider} from "./ContractContext/ContractContext";
import ListRoomPage from "./RoomPage/ListRoomPage";
import RentPage from "./RentPage/RentPage";
import AppointmentPage from "./AppointmentPage/AppointmentPage";
import YourRentalPage from "./YourPage/YourRentalPage";
import YourAppointmentPage from "./YourPage/YourAppointmentPage";

const App = () => {
    return (
        <Router>
            <ContractProvider>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/auth" element={<AuthPage/>}/> {/* AuthPage should have options to navigate to SignUpPage or LoginPage */}
                    <Route path="/signup" element={<SignUpPage/>}/>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/dashboard" element={<Dashboard/>}/>
                    <Route path="/list" element={<ListRoomPage/>}/>
                    <Route path="/rent" element={<RentPage/>}/>
                    <Route path="/appointments" element={<AppointmentPage/>}/>
                    <Route path="/your-rental" element={<YourRentalPage/>}/>
                    <Route path="/your-appointments" element={<YourAppointmentPage/>}/>
                </Routes>
            </ContractProvider>
        </Router>
    );
};


export default App;

