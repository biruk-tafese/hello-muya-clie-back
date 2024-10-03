const Transaction = require("../models/transactions/transactionModel");
const ServiceProvider = require("../models/service-providers/serviceProviderModel");

exports.addIncome = async (req, res) => {
  try {
    const {
      amount,
      paymentMethod,
      category,
      description,
      date,
      client,
      serviceProvider,
    } = req.body;
    const income = new Transaction({
      amount,
      paymentMethod,
      type: "Income",
      category,
      description,
      date,
      client,
      serviceProvider,
    });
    await income.save();
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addExpense = async (req, res) => {
  try {
    const { amount, paymentMethod, category, description, date } = req.body;
    const expense = new Transaction({
      amount,
      paymentMethod,
      type: "Expense",
      category,
      description,
      date,
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTotalExpense = async (req, res) => {
  try {
    const totalExpense = await Transaction.aggregate([
      { $match: { type: "Expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    res.status(200).json({ totalExpense: totalExpense[0].total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTotalRevenue = async (req, res) => {
  try {
    const totalRevenue = await Transaction.aggregate([
      { $match: { type: "Income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    res.status(200).json({ totalRevenue: totalRevenue[0].total });
    /// make the revenue a percentage f the total income
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNetProfit = async (req, res) => {
  try {
    const income = await Transaction.aggregate([
      { $match: { type: "Income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const expense = await Transaction.aggregate([
      { $match: { type: "Expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const netProfit = (income[0]?.total || 0) - (expense[0]?.total || 0);
    res.status(200).json({ netProfit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRevenueByServiceType = async (req, res) => {
  try {
    // Get distinct service types from ServiceProvider collection
    const serviceTypes = await ServiceProvider.distinct("serviceType");

    // Get distinct months from Transaction collection
    const months = await Transaction.aggregate([
      { $match: { type: "Income" } },
      {
        $group: {
          _id: { month: { $month: "$date" } },
        },
      },
      {
        $project: {
          month: "$_id.month",
          _id: 0,
        },
      },
    ]);

    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);

    // Create combinations of all service types and all months
    const combinations = allMonths.flatMap((month) =>
      serviceTypes.map((serviceType) => ({ month, serviceType }))
    );

    // Create a pipeline to group by month and service type
    const revenueByServiceType = await Transaction.aggregate([
      {
        $match: { type: "Income" },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            serviceType: "$category",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          month: "$_id.month",
          serviceType: "$_id.serviceType",
          total: 1,
          _id: 0,
        },
      },
      {
        $group: {
          _id: "$month",
          serviceTypes: {
            $push: {
              serviceType: "$serviceType",
              total: "$total",
            },
          },
        },
      },
      {
        $project: {
          month: "$_id",
          serviceTypes: {
            $map: {
              input: serviceTypes,
              as: "serviceType",
              in: {
                serviceType: "$$serviceType",
                total: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$serviceTypes",
                            as: "service",
                            cond: {
                              $eq: ["$$service.serviceType", "$$serviceType"],
                            },
                          },
                        },
                        0,
                      ],
                    },
                    { total: 0 },
                  ],
                },
              },
            },
          },
        },
      },
    ]);

    // Format the data for the frontend
    const formattedData = revenueByServiceType.map((item) => {
      const formattedItem = { month: item.month };
      item.serviceTypes.forEach((serviceType) => {
        formattedItem[serviceType.serviceType] = serviceType.total.total;
      });
      return formattedItem;
    });

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// exports.getRevenueByMonth = async (req, res) => {
//   try {
//     const revenueByMonth = await Transaction.aggregate([
//       { $match: { type: 'Income' } },
//       {
//         $group: {
//           _id: { $month: '$date' },
//           total: { $sum: '$amount' }
//         }
//       },
//       { $sort: { '_id': 1 } }
//     ]);
//     res.status(200).json(revenueByMonth);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.getRevenueByMonth = async (req, res) => {
  try {
    // Aggregate revenue by month
    const revenueByMonth = await Transaction.aggregate([
      { $match: { type: "Income" } },
      {
        $group: {
          _id: { $month: "$date" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Initialize data array for all months
    const data = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(0, i).toLocaleString("default", { month: "short" }),
      revenue: 0,
    }));

    // Merge revenue data
    revenueByMonth.forEach((rev) => {
      data[rev._id - 1].revenue = rev.total;
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExpenseByCategory = async (req, res) => {
  try {
    const expenseByCategory = await Transaction.aggregate([
      { $match: { type: "Expense" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]);
    res.status(200).json(expenseByCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExpenseByMonth = async (req, res) => {
  try {
    const expenseByMonth = await Transaction.aggregate([
      { $match: { type: "Expense" } },
      {
        $group: {
          _id: { $month: "$date" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const data = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(0, i).toLocaleString("default", { month: "short" }),
      expense: 0,
    }));
    expenseByMonth.map((exp) => {
      data[exp._id - 1].expense = exp.total;
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// how will this be consumed on the frontend tho?? an integration nightmare
exports.getMonthlyRevenueReport = async (req, res) => {
  try {
    const revenueReport = await Transaction.aggregate([
      { $match: { type: "Income" } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    res.status(200).json(revenueReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMonthlyExpenseReport = async (req, res) => {
  try {
    const expenseReport = await Transaction.aggregate([
      { $match: { type: "Expense" } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    res.status(200).json(expenseReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfitLossStatement = async (req, res) => {
  try {
    const income = await Transaction.aggregate([
      { $match: { type: "Income" } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          totalIncome: { $sum: "$amount" },
        },
      },
    ]);

    const expense = await Transaction.aggregate([
      { $match: { type: "Expense" } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          totalExpense: { $sum: "$amount" },
        },
      },
    ]);

    const profitLoss = income.map((inc) => {
      const exp = expense.find(
        (exp) =>
          exp._id.year === inc._id.year && exp._id.month === inc._id.month
      ) || { totalExpense: 0 };
      return {
        year: inc._id.year,
        month: inc._id.month,
        totalIncome: inc.totalIncome,
        totalExpense: exp.totalExpense,
        netProfit: inc.totalIncome - exp.totalExpense,
      };
    });

    res.status(200).json(profitLoss);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate(
      "client serviceProvider"
    );
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSingleTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(
      "client serviceProvider"
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.customReport = async (req, res) => {
  try {
    const { startDate, endDate, serviceType, category } = req.body;

    const matchConditions = {};
    if (startDate) {
      matchConditions.date = {
        ...matchConditions.date,
        $gte: new Date(startDate),
      };
    }
    if (endDate) {
      matchConditions.date = {
        ...matchConditions.date,
        $lte: new Date(endDate),
      };
    }
    if (serviceType) {
      matchConditions.serviceType = serviceType;
    }
    if (category) {
      matchConditions.category = category;
    }

    const customReport = await Transaction.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, totalAmount: 1, count: 1 } },
    ]);

    res.status(200).json(customReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//service provider side payment method
// Fetch all payment methods for a user
exports.fetchPaymentMethods = async (req, res) => {
  try {
    const serviceProvider = req.user.id;
    const payments = await Transaction.find({ serviceProvider });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Error fetching payment methods" });
  }
};

// Add a new payment method
exports.addPaymentMethod = async (req, res) => {
  try {
    const { paymentMethod, description } = req.body;
    const userId = req.user.id;

    const newPayment = new Transaction({
      serviceProvider: userId,
      paymentMethod: paymentMethod,
      description: description,
    });

    const savedPayment = await newPayment.save();
    res.json(savedPayment);
  } catch (err) {
    console.error("Error details:", err);
    res.status(500).json({ error: "Error adding payment method" });
  }
};

// Edit an existing payment method
exports.editPaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, description } = req.body;

    const updatedPayment = await Transaction.findOneAndUpdate(
      { _id: id, serviceProvider: req.user.id }, // Ensure user can only edit their own payment methods
      { paymentMethod, description },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ error: "Payment method not found" });
    }

    res.json(updatedPayment);
  } catch (err) {
    res.status(500).json({ error: "Error editing payment method" });
  }
};

// Delete a payment method
exports.deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPayment = await Transaction.findOneAndDelete({
      _id: id,
      serviceProvider: req.user.id,
    });

    if (!deletedPayment) {
      return res.status(404).json({ error: "Payment method not found" });
    }

    res.json({ message: "Payment method deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting payment method" });
  }
};
