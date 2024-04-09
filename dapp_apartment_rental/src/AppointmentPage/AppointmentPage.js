import React, {useState} from 'react';
import {Button, Form, FormGroup, Input, Label} from 'reactstrap';
import {useNavigate} from 'react-router-dom';
import {useContract} from "../ContractContext/ContractContext";


const AppointmentsPage = () => {
    let navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const {userAddress, createContractInstance, getWeb3, contractAddress} = useContract();
    const contract = createContractInstance(getWeb3(), contractAddress);

    const makeAppointment = async () => {

        if (!roomId) {
            alert('Please fill in Room id.');
            return;
        }

        if (contract) {
            let roomAppointStatus = await contract.methods.checkAppointmentStatus(roomId).call({from: userAddress});
            if (roomAppointStatus) {
                alert("There is an existing appointment for this room!");
                return;
            }

            const roomStatus = await contract.methods.getRoomInfo(roomId).call({from: userAddress});
            if (!roomStatus.isAvailable) {
                alert("This room is not available!");
                return;
            }

            if (userAddress.toLowerCase() === roomStatus.owner.toLowerCase()) {
                alert("Room owner cannot make an appointment himself/herself");
                return;
            }

            await contract.methods.makeAppointment(roomId).send({from: userAddress});
            localStorage.setItem(userAddress, JSON.stringify(roomId));

            roomAppointStatus = await contract.methods.checkAppointmentStatus(roomId).call({from: userAddress});
            if (roomAppointStatus) {
                alert("Appointment successful!");
            }
        }
    };

    const deleteAppointment = async () => {
        if (!roomId) {
            alert('Please fill in Room id.');
            return;
        }

        if (contract) {
            let roomAppointStatus = await contract.methods.checkAppointmentStatus(roomId).call({from: userAddress});
            if (!roomAppointStatus) {
                alert("There is no appointment for this room!");
                return;
            }

            const appointmentDetails = await contract.methods.getAppointmentDetails(roomId).call({from: userAddress});
            if ((userAddress.toLowerCase() !== appointmentDetails.renteeAddr.toLowerCase()) && (userAddress.toLowerCase() !== appointmentDetails.renterAddr.toLowerCase())) {
                alert("Only room owner and rentee could cancel the appointment!");
                return;
            }

            await contract.methods.deleteAppointment(roomId).send({from: userAddress});
            localStorage.removeItem(userAddress);

            roomAppointStatus = await contract.methods.checkAppointmentStatus(roomId).call({from: userAddress});
            if (!roomAppointStatus) {
                alert("Appointment has been canceled!");
            }
        }


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
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                />
            </FormGroup>
            <Button color="primary" onClick={makeAppointment}>Make Appointment</Button>{' '}
            <Button color="secondary" onClick={() => deleteAppointment()}>Delete Appointment</Button>{' '}
            <Button onClick={() => navigate(-1)}>Back</Button>
        </Form>
    );
};

export default AppointmentsPage;
