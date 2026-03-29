import jwt  from 'jsonwebtoken';
import xss  from 'xss';
import User from '../models/User.js';

const sign = (user) => jwt.sign(
  { id: user._id, username: user.username, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES }
);

// POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    let { username, password, email } = req.body;
    username = xss(username?.trim());
    email    = email?.trim().toLowerCase();

    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Username and password required.' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be 6+ characters.' });
    if (await User.findOne({ username }))
      return res.status(409).json({ success: false, message: 'Username already taken.' });

    const user  = await User.create({ username, password, email });
    const token = sign(user);
    res.status(201).json({ success: true, token, user: user.safeData() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Signup failed.' });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Username and password required.' });

    const user = await User.findOne({ username }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const ok = await user.comparePassword(password);
    if (!ok)  return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const token = sign(user);
    res.json({ success: true, token, user: user.safeData() });
  } catch (err) {
    res.status(err.message.includes('locked') ? 429 : 500)
       .json({ success: false, message: err.message || 'Login failed.' });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('bookmarks', 'title slug');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: user.safeData() });
  } catch {
    res.status(500).json({ success: false, message: 'Failed.' });
  }
};

// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { bio, email, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { bio: xss(bio || ''), email: email?.toLowerCase(), avatar: xss(avatar || '') },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user: user.safeData() });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
