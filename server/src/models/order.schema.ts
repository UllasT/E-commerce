import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  order_number: { type: String, required: true, unique: true },
  status: { type: String, default: 'pending' },

  total_amount: { type: Number, default: 0 },

  shipping_address: { type: Object },

  payment_method: { type: String, default: 'cod' },
  payment_status: { type: String, default: 'pending' }

}, { timestamps: true });

export default mongoose.model('Order', orderSchema);