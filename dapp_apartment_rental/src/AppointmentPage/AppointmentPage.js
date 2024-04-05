import React, { useState } from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

const AppointmentsPage = () => {
    let navigate = useNavigate();
    const [appointmentDetails, setAppointmentDetails] = useState({
        roomId: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAppointmentDetails({
            ...appointmentDetails,
            [name]: value
        });
    };

    const makeAppointment = () => {
        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        const newAppointment = {
            ...appointmentDetails,
            id: appointments.length + 1
        };
        appointments.push(newAppointment);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        // Clear form or provide some success message
    };

    const deleteAppointment = (appointmentId) => {
        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        appointments = appointments.filter(appointment => appointment.id !== appointmentId);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        // Clear form or provide some success message
    };

    return (
        <Form className="appointments-page">
            <h1>EtheRent</h1>
            <h2>Appointments</h2>
            <FormGroup>
                <Label for="roomId">Room ID</Label>
                <Input
                    type="text"
                    name="roomId"
                    id="roomId"
                    placeholder="Room ID"
                    value={appointmentDetails.roomId}
                    onChange={handleInputChange}
                />
            </FormGroup>
            <Button color="primary" onClick={makeAppointment}>Make Appointment</Button>{' '}
            <Button color="secondary" onClick={() => deleteAppointment(appointmentDetails.roomId)}>Delete Appointment</Button>{' '}
            <Button onClick={() => navigate(-1)}>Back</Button>
        </Form>
    );
};

export default AppointmentsPage;
