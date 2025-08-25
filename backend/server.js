require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const docRoutes = require('./routes/documents.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;
const onlyofficeRoutes = require('./routes/onlyoffice.routes');

// connect DB
connectDB();

const allowedOrigins = [
  'https://bb-assessment2-joaby0cw6-satheshkumars-projects-4dc0dbec.vercel.app',
  'https://bb-assessment2-git-live-b3ad5f-satheshkumars-projects-4dc0dbec.vercel.app',
  'https://bb-assessment2-rnvqh3t61-satheshkumars-projects-4dc0dbec.vercel.app',
  'https://satheshkumar.duckdns.org',
  'https://bb-assessment2.onrender.com',
  'https://bb-assessment2.vercel.app',
  /\.vercel\.app$/, 
  // add any other admin/stage domains here
];
// middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // keep true (useful if later you add cookies), but won’t hurt
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// static file serving for uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/versions', express.static(path.join(process.cwd(), 'versions')));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', docRoutes);

app.use('/api/onlyoffice', onlyofficeRoutes);

// error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});