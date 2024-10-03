const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    default: 0,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Income", "Expense"],
    default: "Income",
  },
  category: {
    type: String,
    enum: ["Marketing", "Operational Cost", "Maintenance cost"],
    default: "Operational Cost",
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
  },
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceProvider",
  },
});

const Transaction = mongoose.model("Payment", paymentSchema);

module.exports = Transaction;
