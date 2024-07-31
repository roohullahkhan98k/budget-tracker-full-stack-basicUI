const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const { connectDB, User, BudgetEntry } = require('./mongo');
const PORT = 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON bodies
const JWT_SECRET = '123'; // Hardcoded JWT secret key

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from Bearer token

  if (token == null) return res.sendStatus(401); // If no token, return Unauthorized

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // If token is invalid, return Forbidden

    req.user = user; // Attach user info to request object
    next(); // Proceed to next middleware or route handler
  });
};

// Routes
app.post('/api/auth/signup', async (req, res) => {
  const { email, name, password, budgetLimit } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, name, password: hashedPassword, budgetLimit });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '2m' });

    res.status(201).json({ token, user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '2m' });

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Example of a protected route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Create a new budget entry
app.post('/api/budget', authenticateToken, async (req, res) => {
  const { name, price, date } = req.body;
  try {
    const newEntry = new BudgetEntry({ userId: req.user.id, name, price, date }); // Use date as string
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error adding budget entry:', error); // Improved logging
    res.status(500).json({ message: error.message });
  }
});

// Get all budget entries for the authenticated user
app.get('/api/budget', authenticateToken, async (req, res) => {
  try {
    const entries = await BudgetEntry.find({ userId: req.user.id });
    res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching budget entries:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update a budget entry
app.put('/api/budget/:id', authenticateToken, async (req, res) => {
  const { name, price, date } = req.body;
  try {
    const updatedEntry = await BudgetEntry.findByIdAndUpdate(
      req.params.id,
      { name, price, date }, // Use date as string
      { new: true }
    );
    res.status(200).json(updatedEntry);
  } catch (error) {
    console.error('Error updating budget entry:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a budget entry
app.delete('/api/budget/:id', authenticateToken, async (req, res) => {
  try {
    await BudgetEntry.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget entry:', error);
    res.status(500).json({ message: error.message });
  }
});

// Check if budget limit is exceeded
app.get('/api/budget/check-limit', authenticateToken, async (req, res) => {
  try {
    const entries = await BudgetEntry.find({ userId: req.user.id });
    const totalSpent = entries.reduce((acc, entry) => acc + entry.price, 0);
    const user = await User.findById(req.user.id);
    const isExceeded = totalSpent > user.budgetLimit;
    res.status(200).json({ isExceeded });
  } catch (error) {
    console.error('Error checking budget limit:', error); 
    res.status(500).json({ message: error.message });
  }
});
// Filter entries based on date
app.get('/api/budget/filter', async (req, res) => {
    try {
      const { date } = req.query;
  
      if (!date) {
        return res.status(400).json({ error: 'Date parameter is required' });
      }
  
      const parsedDate = new Date(date);
  
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
  
      // Set start of the day and end of the day
      const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999)).toISOString();
  
      // Query to get all entries for the specific date
      const entries = await BudgetEntry.find({
        date: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      });
  
      res.json(entries);
    } catch (error) {
      console.error('Error filtering entries:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  //budget cahrt analysis
  app.get('/api/budget/analysis', authenticateToken, async (req, res) => {
    const filter = req.query.filter;
    let startDate;
    const today = new Date();
  
    // Determine start date based on filter
    switch (filter) {
      case 'Last Month':
        startDate = new Date(today.setMonth(today.getMonth() - 1));
        break;
      case 'Last 6 Months':
        startDate = new Date(today.setMonth(today.getMonth() - 6));
        break;
      case 'Last 12 Months':
        startDate = new Date(today.setMonth(today.getMonth() - 12));
        break;
      default:
        startDate = new Date(today.setMonth(today.getMonth() - 1));
    }
  
    try {
      // Fetch budget entries for the logged-in user within the specified date range
      const budgetEntries = await BudgetEntry.find({
        userId: req.user.id,
        date: { $gte: startDate }
      }).sort({ date: 1 }); // Sort entries by date
  
      // Fetch the user's budget limit
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Calculate total spent and check if budget limit is exceeded
      const totalSpent = budgetEntries.reduce((acc, entry) => acc + entry.price, 0);
      const isLimitExceeded = totalSpent > user.budgetLimit;
  
      res.json({ budgetEntries, isLimitExceeded });
    } catch (error) {
      console.error('Error fetching budget data:', error);
      res.status(500).json({ error: 'Error fetching budget data' });
    }
  });
  
// Connect to MongoDB and Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
