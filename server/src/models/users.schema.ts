import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  full_name: { type: String, default: '' },
  phone: { type: String, default: '' },
  avatar_url: { type: String },

  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  refresh_token: { type: String },
  refresh_token_expires_at: { type: Date }

}, { timestamps: true });

export default mongoose.model('User', userSchema);