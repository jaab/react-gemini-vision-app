const PORT = 8080;
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();
const fs = require('fs');
const multer = require('multer');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage }).single('file');
let filePath;

app.post('/upload', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json(err);
        }
        filePath = req.file.path;
        res.status(200).json({ filePath });
    });
});

app.post('/gemini', async (req, res) => {
    try {
        function fileToGenerativePart(path, mimeType) {
            return {
                inlineData: {
                    data: Buffer.from(fs.readFileSync(path)).toString('base64'),
                    mimeType: mimeType
                }
            };
        }

        const model = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        const prompt = req.body.message;
        const result = await model.generateContent([prompt, fileToGenerativePart(filePath, 'image/jpeg')]);
        const response = await result.response;
        const text = await response.text();
        res.send(text);

        console.log(prompt);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

app.listen(PORT, () => console.log("Listening on Port " + PORT));
