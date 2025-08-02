import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: String,
  role: {
    type: String,
    enum: ['admin', 'interviewer', 'candidate'],
    default: 'candidate',
  },
}, {
  timestamps: true,
});

userSchema.index({ email: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;