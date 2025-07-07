import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json()); // Add this line to parse JSON bodies

const PTA_BASE_URL = 'https://gis.pta.gov.pk:8888';
const API_TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc1MTQ1MzQ4NSwiZXhwIjoxNzUxNTM5ODg1fQ.XP4LGfPZim0LadUWwPD4pngjwfvHnjN19rnWUoSa3K3G1fqDbOi5YVCDXyiWzHWxH3SXuO6J1G0N-divFxS7ng";; // 🔒 Use .env in real projects

app.get('/api/coverage', async (req, res) => {
  const { lat, lng } = req.query; 
  const token = req.headers.authorization?.split(" ")[1]
  if (!lat || !lng || !token) {
    return res.status(400).json({ error: 'Missing lat or lng' });
  }
 

  try {
    const response = await fetch(`${PTA_BASE_URL}/pta/complaint_coverage/${lat}/${lng}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(3001, () => {
  console.log('✅ Proxy server running on http://localhost:3001');
});
