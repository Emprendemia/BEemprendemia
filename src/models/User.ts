import mongoose, { Schema, Document, Types } from 'mongoose';

interface RecentCourse {
  course: Types.ObjectId | null;
  progress: number;
  lastTimestamp: string;
}

export interface UserDocument extends Document {
  fullname: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'user' | 'owner';
  recentCourses: RecentCourse[];
}

const userSchema = new Schema<UserDocument>({
  fullname: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'teacher', 'user', 'owner'], default: 'user' },
  recentCourses: [
    {
      course: { type: Schema.Types.ObjectId, ref: 'Course' },
      progress: { type: Number, default: 0 },
      lastTimestamp: { type: String, default: '00:00:00' }
    }
  ]
}, { timestamps: true });

export const User = mongoose.model<UserDocument>('User', userSchema);
