const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/profile
// @desc    Get logged in user's profile (just email for now)
router.get('/', auth, async (req, res) => {
  try {
    // req.user.id is from the auth middleware
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profile
// @desc    Update user profile (e.g., just email)
router.put('/', auth, async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // You can add more fields to update here
    if (email) user.email = email; 

    await user.save();
    res.json(user.email);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;