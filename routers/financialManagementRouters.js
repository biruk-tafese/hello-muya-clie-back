const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financialManagementControllers");
const authorize = require("../middlewares/adminAuthorization");

router.post("/addIncome", authorize("admin"), financeController.addIncome);
router.post("/addExpense", authorize("admin"), financeController.addExpense);
router.get(
  "/totalExpense",
  authorize("admin"),
  financeController.getTotalExpense
);
router.get(
  "/totalRevenue",
  authorize("admin"),
  financeController.getTotalRevenue
);
router.get("/netProfit", authorize("admin"), financeController.getNetProfit);
router.get(
  "/revenueByService",
  authorize("admin"),
  financeController.getRevenueByServiceType
);
router.get(
  "/revenueByMonth",
  authorize("admin"),
  financeController.getRevenueByMonth
);
router.get(
  "/expenseByCategory",
  authorize("admin"),
  financeController.getExpenseByCategory
);
router.get(
  "/expenseByMonth",
  authorize("admin"),
  financeController.getExpenseByMonth
);
router.get(
  "/monthlyRevenueReport",
  authorize("admin"),
  financeController.getMonthlyRevenueReport
);
router.get(
  "/monthlyExpenseReport",
  authorize("admin"),
  financeController.getMonthlyExpenseReport
);
router.get(
  "/profitLossStatement",
  authorize("admin"),
  financeController.getProfitLossStatement
);
router.get(
  "/transactions",
  authorize("admin"),
  financeController.getAllTransactions
);
router.post(
  "/customReport",
  authorize("admin"),
  financeController.customReport
);
router.get(
  "/transaction/:id",
  authorize("admin"),
  financeController.getSingleTransaction
);
router.get(
  "/",
  authorize("service-provider"),
  financeController.fetchPaymentMethods
);

// Add a new payment method
router.post(
  "/add",
  authorize("service-provider"),
  financeController.addPaymentMethod
);

// Edit a payment method
router.put(
  "/edit/:id",
  authorize("service-provider"),
  financeController.editPaymentMethod
);

// Delete a payment method
router.delete(
  "/delete/:id",
  authorize("service-provider"),
  financeController.deletePaymentMethod
);

module.exports = router;
