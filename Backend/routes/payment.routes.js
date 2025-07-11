import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { addMoneyValidation } from "../middlewares/validation.middleware";
import { createOrder, getPaymentHistory, getTransactionHistory, verifyPayment } from "../controllers/payment.controller";

const payment = Router();

// @route   POST /api/v1/payment/create-order
// @desc    Create Razorpay order for adding money
// @access  Private
payment.route("/create-order").post(verifyJWT, addMoneyValidation, createOrder)

// @route   POST /api/v1/payment/verify
// @desc    Verify Razorpay payment and update balance
// @access  Private
payment.route("/verify").post(verifyJWT, verifyPayment)

// @route   GET /api/v1/payment/history
// @desc    Get payment history
// @access  Private
payment.route("/history").get(verifyJWT, getPaymentHistory)

// @route   GET /api/v1/payment/transactions
// @desc    Get transaction history
// @access  Private
payment.route("/transactions").get(verifyJWT, getTransactionHistory)

export default payment;