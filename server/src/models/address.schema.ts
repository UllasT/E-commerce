import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  full_name: { type: String, default: '' },
  phone: { type: String, default: '' },

  address_line1: { type: String },
  address_line2: { type: String },

  city: { type: String, default: '' },
  state: { type: String, default: '' },
  postal_code: { type: String, default: '' },
  country: { type: String, default: 'India' },

  is_default: { type: Boolean, default: false }

}, { timestamps: true });

export default mongoose.model('Address', addressSchema);