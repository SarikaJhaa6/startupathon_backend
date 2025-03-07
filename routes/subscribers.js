const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Define the Subscriber schema
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  updated_at: { type: Date, default: Date.now }
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// Get all subscribers
router.get('/get-subscribers', async (req, res) => {
  try {
    const subscribers = await Subscriber.find();
    res.json({ success: true, subscribers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add a new subscriber
router.post('/add-subscriber', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  try {
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();
    res.json({ success: true, id: newSubscriber._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update a subscriber's email
router.put('/:id', async (req, res) => {
  const { email } = req.body;

  try {
    const updatedSubscriber = await Subscriber.findByIdAndUpdate(
      req.params.id,
      { email, updated_at: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedSubscriber) {
      return res.status(404).json({ success: false, error: 'Subscriber not found.' });
    }

    res.json({ success: true, subscriber: updatedSubscriber });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a subscriber
router.delete('/:id', async (req, res) => {
  try {
    const deletedSubscriber = await Subscriber.findByIdAndDelete(req.params.id);

    if (!deletedSubscriber) {
      return res.status(404).json({ success: false, error: 'Subscriber not found.' });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
