require("dotenv").config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const workerRoutes = require('./routes/workers');
const usersRouter = require('./routes/users');
const placesRouter = require('./routes/places');
const paymentRoutes = require('./routes/payment'); 
const tipsRoutes = require('./routes/tips')
const dotenv = require("dotenv");
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URL, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/users', usersRouter);
app.use('/api', placesRouter);
app.use('/api/payment', paymentRoutes);
app.use('/api/tips', tipsRoutes )



// Serve the index.html file 
// app.get('/', (req, res) => { res.sendFile(path.join('C:', 'Users', 'ACER', 'tipTest', 'index.html')); });
//  // Serve static files from the 'tipTest' director

// app.use(express.static(path.join('C:', 'Users', 'ACER', 'tipTest')));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});