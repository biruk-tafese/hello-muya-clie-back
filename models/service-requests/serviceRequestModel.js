
const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pending', 'Cancelled', 'Completed', 'New'],
    default: 'Pending'
  },
  client: {
    type: String,
    required: true
  },
  serviceProvider: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    enum: ['Cleaning', 'Plumbing', 'Electrical', 'Landscaping'], // Add appropriate service types here
    required: true
  },
  description: {
    type: String
  },
  multimedia: {
    type: String
  },
  time: {
    type: String,
    default: 'immediately'
  },
  date: {
    type: String
  }
});

const ServiceRequest = mongoose.model('Order', serviceRequestSchema);

module.exports = ServiceRequest;

