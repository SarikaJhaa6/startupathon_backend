const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Define the Founder schema and model directly in the route file
const founderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  position: { type: String, required: true },
  linkedin: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true, enum: ['active', 'inactive'] },
  updated_at: { type: Date, default: Date.now }
});

const Founder = mongoose.model('Founder', founderSchema);

// Get all founders
router.get('/get-founders', async (req, res) => {
  try {
    const founders = await Founder.find();
    res.json(founders);
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

// Add a new founder
router.post('/add-founder', async (req, res) => {
  const { name, company, position, linkedin, description, status } = req.body;

  // Ensure all required fields are provided
  if (!name || !company || !position || !description || !status) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  try {
    const newFounder = new Founder({
      name,
      company,
      position,
      linkedin,
      description,
      status
    });

    await newFounder.save();
    res.json({ success: true, id: newFounder._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

// Update a founder's status
router.put('/status/:id', async (req, res) => {
  const { status } = req.body;

  // Ensure status is provided
  if (!status) {
    return res.status(400).json({ success: false, error: 'Status is required.' });
  }

  try {
    await Founder.updateOne({ _id: req.params.id }, { $set: { status, updated_at: Date.now() } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

// Update a founder
router.put('/:id', async (req, res) => {
  const { name, company, position, linkedin, description, status } = req.body;

  try {
    await Founder.updateOne(
      { _id: req.params.id },
      { $set: { name, company, position, linkedin, description, status, updated_at: Date.now() } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

// Delete a founder
router.delete('/:id', async (req, res) => {
  try {
    await Founder.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

module.exports = router;
