import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true,
    trim: true, minlength: 3, maxlength: 30,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only have letters, numbers and underscores']
  },
  email: {
    type: String, unique: true, sparse: true,
    lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email']
  },
  password:  { type: String, required: true, minlength: 6, select: false },
  bio:       { type: String, default: '', maxlength: 200 },
  avatar:    { type: String, default: '' },
  role:      { type: String, enum: ['user', 'admin'], default: 'user' },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  loginAttempts: { type: Number, default: 0 },
  lockUntil:     { type: Date }
}, { timestamps: true });

// Auto-hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password + brute force protection
userSchema.methods.comparePassword = async function (candidate) {
  if (this.lockUntil && this.lockUntil > Date.now()) {
    throw new Error('Account temporarily locked. Try again later.');
  }
  const match = await bcrypt.compare(candidate, this.password);
  if (!match) {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
      this.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      this.loginAttempts = 0;
    }
    await this.save();
    return false;
  }
  // reset on success
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
  return true;
};

userSchema.methods.safeData = function () {
  return { id: this._id, username: this.username, email: this.email, bio: this.bio, avatar: this.avatar, role: this.role };
};

export default mongoose.model('User', userSchema);
