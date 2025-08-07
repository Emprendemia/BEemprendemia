import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  fullname: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'teacher', 'user'], default: 'user' },
  recentCourses: [
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    progress: { type: Number, default: 0 },
    lastTimestamp: { type: String, default: '00:00:00' }
  }
]
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
