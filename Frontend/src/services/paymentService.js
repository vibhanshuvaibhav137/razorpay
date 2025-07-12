import api from './api'

export const paymentService = {
  createOrder: (amount) => 
    api.post('/payment/create-order', { amount }),

  verifyPayment: (paymentData) => 
    api.post('/payment/verify', paymentData),

  getPaymentHistory: (page = 1, limit = 10) => 
    api.get(`/payment/history?page=${page}&limit=${limit}`),

  getTransactionHistory: (page = 1, limit = 10) => 
    api.get(`/payment/transactions?page=${page}&limit=${limit}`)
}