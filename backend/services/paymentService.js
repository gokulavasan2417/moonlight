import crypto from 'crypto';
import Razorpay from 'razorpay';

let razorpayInstance = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log(' Razorpay Gateway configured with live/test credentials.');
  } catch (err) {
    console.warn(' Failed to initialize Razorpay SDK:', err.message);
  }
} else {
  console.log(' Razorpay credentials not provided. Sandbox Mock Payment Engine enabled.');
}

export const createRazorpayOrder = async ({ amount, currency = 'INR', receipt, notes }) => {
  // Amount in smallest currency unit (paise for INR)
  const amountInPaise = Math.round(amount * 100);

  if (razorpayInstance) {
    try {
      const order = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency,
        receipt,
        notes: notes || {}
      });
      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        isMock: false
      };
    } catch (err) {
      console.error('Razorpay order creation failed, falling back to sandbox mode:', err.message);
    }
  }

  // Sandbox simulated order for local testing & development
  const mockOrderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  return {
    orderId: mockOrderId,
    amount: amountInPaise,
    currency,
    isMock: true,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_moonlight_key'
  };
};

export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  if (razorpayInstance && process.env.RAZORPAY_KEY_SECRET) {
    const text = `${orderId}|${paymentId}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return generated_signature === signature;
  }

  // Sandbox mock verification: Accept mock orders or valid mock signatures
  if (orderId && orderId.startsWith('order_mock_')) {
    return true;
  }
  return Boolean(orderId && paymentId);
};
