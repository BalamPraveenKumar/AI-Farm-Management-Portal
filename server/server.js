const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' })); // raised so proxied JSON with base64 strings isn't rejected

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Still serving /uploads in case you need the raw file for anything else,
// but it's no longer what gets sent to ServiceNow/Groq.
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 8 * 1024 * 1024 } // 8MB cap - keep images reasonably small for Groq + ServiceNow
});

const SERVICENOW_BASE = 'https://dev284309.service-now.com';

app.post(
  '/api/2046085/farm_management/disease-report/create',
  upload.single('disease_image'),
  async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Missing Authorization header' });
      }

      const { farm_id, batch_id, symptoms, remarks } = req.body;

      let imageData = '';
      if (req.file) {
        imageData = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        console.log('Full image URL saved:', imageData);
      }

      const payload = {
        farm_id,
        batch_id,
        symptoms,
        remarks: remarks || '',
        disease_image: imageData
      };

      console.log('Forwarding report metadata to ServiceNow (image omitted from log)');

      const response = await axios.post(
        `${SERVICENOW_BASE}/api/2046085/farm_management/disease-report/create`,
        payload,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        }
      );

      res.status(response.status).json(response.data);

    } catch (error) {
      console.error('Error creating disease report on proxy:', error.message);
      res.status(error.response?.status || 500).json(
        error.response?.data || { success: false, message: error.message }
      );
    }
  }
);

// Proxy all other requests to ServiceNow unchanged
app.all('/api/*', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const headers = { 'Accept': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;
    if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'];

    const response = await axios({
      method: req.method,
      url: `${SERVICENOW_BASE}${req.originalUrl}`,
      data: req.body,
      headers: headers,
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    res.status(response.status).json(response.data);

  } catch (error) {
    console.error(`Error proxying ${req.method} ${req.originalUrl}:`, error.message);
    res.status(error.response?.status || 500).json(
      error.response?.data || { success: false, message: error.message }
    );
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});