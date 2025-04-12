import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  availablePoints: { type: Number, default: 0, required: true },
  totalPoints: { type: Number, default: 0, required: true},
  tasksId: { type: [String], ref: "Task" },
  commonDashboardLink: { type: String },
  createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
}, { versionKey: false });

export const initializeUserModel = (connection: any) => {
  return connection.models.User || connection.model('User', userSchema);
};

