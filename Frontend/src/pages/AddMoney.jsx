import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { paymentService } from '../services/paymentService'

const AddMoney = () => {
  const { user, setUser } = useAuth()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!amount || amount <= 0) {
      setMessage({ text: 'Please enter a valid amount', type: 'error' })
      return
    }

    setLoading(true)
    setMessage({ text: '', type: '' })

    try {
      // Create order
      const orderResponse = await paymentService.createOrder(parseFloat(amount))
      const { orderId, paymentId } = orderResponse.data.data

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: parseFloat(amount) * 100,
        currency: 'INR',
        name: 'Admin Panel',
        description: 'Add money to wallet',
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: paymentId
            })

            const { newBalance } = verifyResponse.data.data
            
            // Update user balance in context
            setUser(prev => ({ ...prev, balance: newBalance }))
            
            setMessage({ text: 'Money added successfully!', type: 'success' })
            setAmount('')
          } catch (error) {
            setMessage({ 
              text: error.response?.data?.message || 'Payment verification failed', 
              type: 'error' 
            })
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: {
          color: '#2563eb'
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        setMessage({ 
          text: 'Payment failed. Please try again.', 
          type: 'error' 
        })
      })
      
      rzp.open()
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Failed to create order', 
        type: 'error' 
      })
    }
    
    setLoading(false)
  }

  const quickAmounts = [100, 500, 1000, 2000, 5000]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Money</h1>
        <p className="text-gray-600">Add money to your wallet using Razorpay</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-4">
            <div className="text-sm text-gray-500">Current Balance</div>
            <div className="text-2xl font-bold text-gray-900">₹{user?.balance || 0}</div>
          </div>

          {message.text && (
            <div className={`mb-4 p-4 rounded ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-600' 
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                id="amount"
                min="1"
                step="1"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Select
              </label>
              <div className="grid grid-cols-5 gap-2">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    ₹{quickAmount}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !amount}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Add Money'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Payment Information</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Payments are processed securely through Razorpay</li>
          <li>• Minimum amount: ₹1</li>
          <li>• Money will be added instantly to your wallet</li>
          <li>• All major payment methods are supported</li>
        </ul>
      </div>
    </div>
  )
}

export default AddMoney