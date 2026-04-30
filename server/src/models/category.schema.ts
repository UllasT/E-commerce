import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  image_url: { type: String },
  description: { type: String }

}, { timestamps: true });

export default mongoose.model('Category', categorySchema);