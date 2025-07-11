import Razorpay from "razorpay";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Payment } from "../models/payment.model.js";
import { Transaction } from "../models/transaction.model.js";

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order
const createOrder = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const userId = req.user._id;

    const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_${userId}_${Date.now()}`,
        payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
        userId,
        amount,
        razorpayOrderId: order.id,
        status: "pending",
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                paymentId: payment._id,
            },
            "Payment order created successfully"
        )
    );
});

// Verify Payment
const verifyPayment = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        paymentId,
    } = req.body;

    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    if (generatedSignature !== razorpay_signature) {
        throw new ApiError(400, "Invalid Razorpay signature");
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
        throw new ApiError(404, "Payment record not found");
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "success";
    await payment.save();

    const user = await User.findById(payment.userId);
    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore + payment.amount;

    user.balance = balanceAfter;
    await user.save();

    const transaction = await Transaction.create({
        userId: payment.userId,
        paymentId: payment._id,
        type: "credit",
        amount: payment.amount,
        balanceBefore,
        balanceAfter,
        description: `Money added via Razorpay - ${razorpay_payment_id}`,
        status: "completed",
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                newBalance: balanceAfter,
                transaction: {
                    id: transaction._id,
                    amount: transaction.amount,
                    type: transaction.type,
                    description: transaction.description,
                    createdAt: transaction.createdAt,
                },
            },
            "Payment verified and balance updated"
        )
    );
});

// Get Payment History
const getPaymentHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
        Payment.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("userId", "fullName email"),
        Payment.countDocuments({ userId }),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                payments,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit,
                },
            },
            "Payment history fetched successfully"
        )
    );
});

// Get Transaction History
const getTransactionHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
        Transaction.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("paymentId", "razorpayPaymentId amount"),
        Transaction.countDocuments({ userId }),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                transactions,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit,
                },
            },
            "Transaction history fetched successfully"
        )
    );
});

export { createOrder, verifyPayment, getPaymentHistory, getTransactionHistory };
