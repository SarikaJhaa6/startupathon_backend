const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Define the Admin schema and model
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
});

const Admin = mongoose.model('Admin', adminSchema);

// Admin Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const admin = await Admin.findOne({ username, password });
    console.log('Found admin:', admin); // Log to see if the admin is found

    if (admin) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
