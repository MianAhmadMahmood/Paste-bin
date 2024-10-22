import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import QRCode from 'qrcode';
import dayjs from 'dayjs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connection to MongoDB
mongoose
  .connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Could not connect to MongoDB', error));

// Model Schema for storing pasted text
const pasteSchema = new mongoose.Schema({
  authorName: String,
  title: String,
  content: String,
  shortUrl: String,
  qrCode: String,
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const Paste = mongoose.model('Paste', pasteSchema);

// API to handle pasting of text
app.post('/api/paste', async (req, res) => {
  try {
    const { authorName, title, content, expiry } = req.body;
    if (!content || !authorName || !title) return res.status(400).json({ message: 'All fields are required' });

    const shortUrl = nanoid(6);
    const fullUrl = `http://localhost:4000/view/${shortUrl}`;
    const qrCodeUrl = await QRCode.toDataURL(fullUrl);

    let expiresAt = null;
    if (expiry !== 'forever') {
      expiresAt = dayjs().add(
        expiry === '1year' ? 1 : expiry === '6months' ? 6 : expiry === '3months' ? 3 : 1,
        expiry === '1year' ? 'year' : 'month'
      ).toDate();
    }

    const paste = new Paste({ authorName, title, content, shortUrl, qrCode: qrCodeUrl, expiresAt });
    await paste.save();

    return res.status(200).json({ message: 'Paste created', shortUrl: fullUrl, qrCode: qrCodeUrl });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error', error });
  }
});

// API to view the paste by short URL
app.get('/view/:shortUrl', async (req, res) => {
  try {
    const { shortUrl } = req.params;
    const paste = await Paste.findOne({ shortUrl });

    if (!paste) return res.status(404).json({ message: 'Paste not found' });

    if (paste.expiresAt && new Date() > new Date(paste.expiresAt)) {
      return res.status(410).json({ message: 'Paste has expired' });
    }

    return res.status(200).json(paste);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error });
  }
});

// Start the server
app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
