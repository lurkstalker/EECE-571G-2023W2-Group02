import React, {useEffect, useState} from 'react';
import {Card, CardBody, CardText, CardTitle} from 'reactstrap';
import {useContract} from '../ContractContext/ContractContext';

const YourAppointmentPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);

    let [contract] = useState(null);
    const {userAddress, createContractInstance, getWeb3, contractAddress} = useContract();

    if (!contract) {
        contract = createContractInstance(getWeb3(), contractAddress);
    }

    useEffect(() => {
        const fetchAppointment = async () => {
            setLoading(true);
            let userAppointments = [];
            try {
                const curMaxRoomId = await contract.methods.getCurMaxRoomId().call();

                for (let roomId = 1; roomId <= curMaxRoomId; roomId++) {
                    const appt = await contract.methods.getAppointmentDetails(roomId).call({from: userAddress});
                    if (appt.isValid && (appt.renteeAddr.toLowerCase() === userAddress.toLowerCase() || appt.renterAddr.toLowerCase() === userAddress.toLowerCase())) {
                        const roomInfo = await contract.methods.getRoomInfo(roomId).call();
                        userAppointments.push({
                            roomId: roomId,
                            renteeAddr: appt.renteeAddr,
                            renterAddr: appt.renterAddr,
                            location: roomInfo.location,
                            intro: roomInfo.intro,
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching appointments:', error);
            }
            setAppointments(userAppointments);
            setLoading(false);
        };

        if (contract && userAddress) {
            fetchAppointment().then(r => {
            });
        }
    }, [userAddress]);

    if (loading) return <p>Loading your appointment...</p>;
    if (appointments.length === 0) {
        return <p>No appointments found.</p>;
    }

    return (
        <div>
            <h1>Your Appointments</h1>
            {appointments.map((appt, index) => (
                <Card key={index} style={{marginBottom: '1rem'}}>
                    <CardBody>
                        <CardTitle tag="h5">Room {appt.roomId}</CardTitle>
                        <CardText>Location: {appt.location}</CardText>
                        <CardText>Intro: {appt.intro}</CardText>
                        {/*<CardText>Rentee Address: {appt.renteeAddr}</CardText>*/}
                        {/*<CardText>Renter Address: {appt.renterAddr}</CardText>*/}
                    </CardBody>
                </Card>
            ))}
        </div>
    );
};

export default YourAppointmentPage;
