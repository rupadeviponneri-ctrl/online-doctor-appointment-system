const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
patientName: { type: String, required: true, trim: true },
phone: { type: String, required: true },
doctor: { type: String, required: true, trim: true },
appointmentDate: { type: String, required: true },
appointmentTime: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);