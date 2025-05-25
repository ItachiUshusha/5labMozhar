const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

app.get('/api/db/materials/:id', async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/materials/${req.params.id}`,
    );
    res.json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: error.message });
  }
});
// Proxy to Database Service
app.use('/api/db', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:5000/api${req.path.replace('/db', '')}`,
      data: req.body,
    });
    res.json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: error.message });
  }
});

// Proxy to Material Service
app.use('/api/calculate', async (req, res) => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/calculate',
      req.body,
    );
    res.json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: error.message });
  }
});

app.use('/api/db/materials/:id', async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/materials/${req.params.id}`,
    );
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(error.response?.status || 500).json(
      error.response?.data || {
        error: 'Internal server error',
      },
    );
  }
});

// Serve static files (Vue app)
app.use(express.static('../client/dist'));

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
