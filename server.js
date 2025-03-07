require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

// Routes
const adminRoutes = require('./routes/adminRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const completersRoutes = require('./routes/completers');
const foundersRoutes = require('./routes/founders');
const subscribersRoutes = require('./routes/subscribers');
app.use('/api/admin', adminRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/completers', completersRoutes);
app.use('/api/founders', foundersRoutes);
app.use('/api/subscribers', subscribersRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
