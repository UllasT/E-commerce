import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },

  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  product_name: { type: String },
  product_image: { type: String },

  price: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 }

}, { timestamps: true });

export default mongoose.model('OrderItem', orderItemSchema);