const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Calculate materials cost
app.post('/api/calculate', async (req, res) => {
  try {
    const { materialIds, area } = req.body;

    // Get materials from DB service
    const { data: materials } = await axios.get(
      'http://localhost:5000/api/materials',
    );

    const selectedMaterials = materials.filter((m) =>
      materialIds.includes(m.id),
    );
    const totalCost = selectedMaterials.reduce((sum, material) => {
      return sum + material.price * area;
    }, 0);

    res.json({ totalCost });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Material Service running on port ${PORT}`);
});
