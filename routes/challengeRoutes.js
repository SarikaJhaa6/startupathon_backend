const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the upload directory
// const UPLOADS_FOLDER = "C:/Users/sarik/Documents/startupathon/startupathon_frontend/public/challenges";
const UPLOADS_FOLDER = "startupathon/startupathon_frontend/public/challenges";
// Ensure the folder exists (create if not)
if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
}

// Multer configuration for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_FOLDER);
  },
  filename: (req, file, cb) => {
    const filePath = path.join(UPLOADS_FOLDER, file.originalname);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return cb(new Error('File already exists. Please rename or use a different file.'));
    }

    cb(null, file.originalname); // Save with original name if not exists
  }
});

// File filter (only allow PNG, JPG, and JPEG)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error('Only .png, .jpg, and .jpeg formats are allowed!'), false);
  }
};

// Initialize multer upload
const upload = multer({ storage, fileFilter });

// Challenge Schema
const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  funding: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  status: { type: String, required: true },
  image: { type: String }, // Store the file name
  updated_at: { type: Date, default: Date.now }
});

const Challenge = mongoose.model('Challenge', challengeSchema);

// Get all challenges (Admin Dashboard) - Latest Updated First
router.get('/get-challenges', async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ updated_at: -1 });

    // Append full image URL for each challenge
    const challengesWithImages = challenges.map(challenge => ({
      ...challenge._doc,
      image: challenge.image ? `/challenges/${challenge.image}` : null
    }));

    res.json(challengesWithImages);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Fix: Ensure router is used correctly
router.get('/visible', async (req, res) => {
  try {
    const challenges = await Challenge.find({ status: 'display' }).sort({ updated_at: -1 });

    const challengesWithImages = challenges.map(challenge => ({
      ...challenge._doc,
      image: challenge.image ? `/challenges/${challenge.image}` : null
    }));

    res.json(challengesWithImages);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// Add a new challenge with image upload
router.post('/add-challenge', upload.single('image'), async (req, res) => {
  const { title, funding, description, deadline, status } = req.body;
  const image = req.file ? req.file.filename : null; // Store only filename

  if (!title || !funding || !description || !deadline || !status) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  try {
    const newChallenge = new Challenge({
      title,
      funding,
      description,
      deadline,
      status,
      image
    });

    await newChallenge.save();
    res.json({ success: true, id: newChallenge._id, image });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update challenge status
router.put('/status/:id', async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, error: 'Status is required.' });
  }

  try {
    await Challenge.updateOne({ _id: req.params.id }, { $set: { status, updated_at: Date.now() } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update a challenge (Title, Description, Status, Image)
router.put('/:id', upload.single('image'), async (req, res) => {
  const { title, description, status } = req.body;
  let updateFields = { title, description, status, updated_at: Date.now() };

  if (req.file) {
    const newImage = req.file.filename;
    updateFields.image = newImage;
  }

  try {
    await Challenge.updateOne({ _id: req.params.id }, { $set: updateFields });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a challenge (also deletes associated image file)
router.delete('/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }

    // Delete associated image file if exists
    if (challenge.image) {
      const imagePath = path.join(UPLOADS_FOLDER, challenge.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete file
      }
    }

    await Challenge.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router.use('/challenges', express.static(UPLOADS_FOLDER)); // Serve images from the 'public/challenges' folder

module.exports = router;
