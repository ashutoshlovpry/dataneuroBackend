const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 4000;
const cors = require('cors'); // Import the cors middleware
const users = require('./schema/user');
const ApiCallCount = require('./schema/count');

app.use(cors());

const apiCallCounterMiddleware = async (req, res, next) => {
    try {
      const operation = req.method === 'POST' && req.path === '/api/create-user' ? 'create' :
                        (req.method === 'PUT' && req.path.startsWith('/api/update-user')) ? 'update' :
                        null;
      if (operation) {
        // Find or create a document for the operation in the ApiCallCount collection
        const apiCallCount = await ApiCallCount.findOneAndUpdate(
          { operation },
          { $inc: { count: 1 } },
          { upsert: true, new: true }
        );
        console.log(`Total ${operation.charAt(0).toUpperCase() + operation.slice(1)} API Calls: ${apiCallCount.count}`);
      }
      next();
    } catch (error) {
      console.error('Error handling API calls:', error);
      next(error);
    }
  };
app.use(apiCallCounterMiddleware);
mongoose.connect('mongodb://localhost:27017/DataNeuron', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Middleware to parse JSON requests
app.use(bodyParser.json());
// POST request handler to insert data
app.post('/api/create-user', async (req, res) => {
  try {
    // Create a new document using the request body
    const newData = new users(req.body);
    // Save the document to the collection
    const result = await newData.save();
    // Send a response with the inserted data
    res.status(201).json({ message: 'Data inserted successfully', data: result });
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/users',async(req,res)=>{
    try {
        const result = await users.find({});
            res.status(201).json(result );
      } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
})
app.put('/api/update-user/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email } = req.body;
      // Find the document by ID and update it
      const updatedData = await users.findByIdAndUpdate(id, { name, email }, { new: true });
      if (!updatedData) {
        return res.status(404).json({ message: 'Data not found' });
      }
      res.json({ message: 'Data updated successfully', data: updatedData });
    } catch (error) {
      console.error('Error updating data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
 

app.get('/api/get-all-counts', async (req, res) => {
    try {
      // Fetch all documents from the ApiCallCount collection
      const allCounts = await ApiCallCount.find();
      res.json({ counts: allCounts });
    } catch (error) {
      console.error('Error fetching counts:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
