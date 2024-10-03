const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema ({
    status: {
        type: String,
        enum: ['Pending', 'Cancelled', 'Completed', 'New'],
        default: 'Pending'
      },
      client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
      },
      serviceProvider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'serviceProvider',
        required: true
      },
      serviceType: {
        type: String,
        required: true
        /// this needs to be enumerated tho
      },
      description: {
        type: String
      }, 
      multimedia: {
        Type: String
      },
      time: {
        type: String,
        default: 'immediately'
      },
      date: {
        type: String
      },

});

const order = mongoose.model('orderSchema', orderSchema);

module.exports = order