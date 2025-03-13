require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// const corsOptions = {
//   origin: [
//     "http://localhost:3000", // Local development
//     "https://startupathon-frontend.vercel.app", // Production URL
//     "https://startupathon-frontend-git-main-sarikas-projects-b64b6669.vercel.app" // Add your new frontend URL here
//   ],
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   allowedHeaders: "Content-Type,Authorization",
//   credentials: true,
//   preflightContinue: false,
//   optionsSuccessStatus: 204,
// };
const corsOptions = {
  origin: '*', // Allow all origins for debugging
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); 
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

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});