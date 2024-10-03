const mongoose = require('mongoose');

const expenseSchema = new Schema({

    amount: {
        type: Number,
        required: true
    },
    month: {
        type: String,
        enum: ['January', 'February', 'March'] //!!! enumerate bedemb
    },
    category: {
        type: String,
        enum: ['Marketing', 'Operations'] //!!! enumerate
    }
});

const expense = mongoose.model('expense', expenseSchema);

module.exports = expense;