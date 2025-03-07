const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Define the Completer schema and model directly in the route file
const completerSchema = new mongoose.Schema({
  completerName: { type: String, required: true },
  businessName: { type: String, required: true },
  role: { type: String, required: true },
  initialFunding: { type: Number, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true, enum: ['active', 'inactive'] },
  updated_at: { type: Date, default: Date.now }
});

const Completer = mongoose.model('Completer', completerSchema);

// Get all completers
router.get('/get-completers', async (req, res) => {
  try {
    const completers = await Completer.find();
    res.json(completers);
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

// Add a new completer
router.post('/add-completer', async (req, res) => {
  const { completerName, businessName, role, initialFunding, description, status } = req.body;

  if (!completerName || !businessName || !role || !initialFunding || !description || !status) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  try {
    const newCompleter = new Completer({
      completerName,
      businessName,
      role,
      initialFunding,
      description,
      status
    });

    await newCompleter.save();
    res.json({ success: true, id: newCompleter._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

// Update a completer's status
router.put('/status/:id', async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, error: 'Status is required.' });
  }

  try {
    await Completer.updateOne({ _id: req.params.id }, { $set: { status, updated_at: Date.now() } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

// Update a completer
router.put('/:id', async (req, res) => {
  const { completerName, businessName, role, initialFunding, description, status } = req.body;

  try {
    await Completer.updateOne(
      { _id: req.params.id },
      { $set: { completerName, businessName, role, initialFunding, description, status, updated_at: Date.now() } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

// Delete a completer
router.delete('/:id', async (req, res) => {
  try {
    await Completer.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

module.exports = router;
