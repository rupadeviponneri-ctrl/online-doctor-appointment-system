const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Appointment = require('./models/Appointment.js');

const app = express();
const PORT = process.env.PORT || 5000;

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/online-doctor-appointment';

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.send('Online Doctor Appointment API is running');
});

// Save new appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const {
      patientName,
      phone,
      doctor,
      appointmentDate,
      appointmentTime
    } = req.body;

    if (
      !patientName?.trim() ||
      !phone ||
      !doctor?.trim() ||
      !appointmentDate ||
      !appointmentTime
    ) {
      return res.status(400).json({
        message: 'Please fill all appointment fields'
      });
    }

    const appointment = new Appointment({
      patientName,
      phone,
      doctor,
      appointmentDate,
      appointmentTime
    });

    const savedAppointment = await appointment.save();

    return res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: savedAppointment
    });
  } catch (err) {
    return res.status(400).json({
      message: 'Failed to book appointment',
      error: err.message
    });
  }
});

// Get all saved appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ createdAt: -1 });

    return res.status(200).json(appointments);
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to fetch appointments',
      error: err.message
    });
  }
});

// Start server after MongoDB connects
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
}

startServer();
// Cancel an appointment
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(
      req.params.id
    );

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      message: 'Appointment cancelled successfully'
    });
  } catch (err) {
    res.status(400).json({
      message: 'Failed to cancel appointment',
      error: err.message
    });
  }
});