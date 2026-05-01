import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },

  price: { type: Number, default: 0 },
  compare_price: { type: Number },

  image_url: { type: String },

  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },

  rating: { type: Number, default: 0 },
  review_count: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },

  featured: { type: Boolean, default: false },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }

}, { timestamps: true });

export default mongoose.model('Product', productSchema);