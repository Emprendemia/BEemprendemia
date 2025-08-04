import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullname: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'teacher', 'user'], default: 'user' }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);