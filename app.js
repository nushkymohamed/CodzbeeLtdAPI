const express = require('express');
const mongoose = require('mongoose');
const Post = require('./models/Post');
const multer = require('multer');
const path = require('path');
const cors = require('cors')
const port = process.env.PORT || 8000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));


// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    },
});

const upload = multer({ storage: storage });

// Connect to MongoDB Atlas (replace with your MongoDB Atlas connection string)
mongoose.connect('mongodb+srv://root:root@post.e2lnofm.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB Atlas');
});

// Middleware to parse JSON requests
app.use(express.json());

// Endpoint for creating a new post
app.post('/api/posts', upload.single('image'), async (req, res) => {
    const { title, description } = req.body;
    const imageUrl = req.file ? req.file.filename : '';

    try {
        const post = new Post({ title, description, imageUrl });
        await post.save();
        res.status(201).json({ message: 'Post created successfully', post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Endpoint for listing all posts
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
