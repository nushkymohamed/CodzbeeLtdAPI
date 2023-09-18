const express = require('express');
const mongoose = require('mongoose');
const Post = require('./models/Post');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
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
mongoose.connect(
  'mongodb+srv://root:root@post.e2lnofm.mongodb.net/?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

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

// Get a Post by ID
app.get('/api/posts/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/posts/:postId', async (req, res) => {
  const { postId } = req.params;

  try {
    // Validate if postId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    // Attempt to find and delete the post by ID
    const deletedPost = await Post.findByIdAndRemove(postId);

    // Check if the post was found and deleted
    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Respond with a success message
    return res
      .status(200)
      .json({ message: 'Post deleted successfully', deletedPost });
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({ error: 'Error deleting post' });
  }
});

// Update a Post by ID
app.put('/api/posts/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const { title, description, imageUrl } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        title,
        description,
        imageUrl,
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
