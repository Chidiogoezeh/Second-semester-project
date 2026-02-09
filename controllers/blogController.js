import Blog from '../models/Blog.js';
import { calculateReadingTime } from '../utils/readingTime.js';

export const createBlog = async (req, res) => {
    try {
        const { title, description, tags, body } = req.body;
        const blog = await Blog.create({
            title, description, tags, body,
            author: req.user.id,
            reading_time: calculateReadingTime(body)
        });
        res.status(201).json(blog);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getBlogs = async (req, res) => {
    const { page = 1, limit = 20, search, author, title, tags, orderBy } = req.query;
    const query = { state: 'published' };

    if (author) query.author = author;
    if (title) query.title = new RegExp(title, 'i');
    if (tags) query.tags = { $in: tags.split(',') };

    const sort = {};
    if (orderBy) sort[orderBy] = -1;

    try {
        const blogs = await Blog.find(query)
            .populate('author', 'first_name last_name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sort);
        res.json({ count: blogs.length, page, blogs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getSingleBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'first_name last_name email');
        if (!blog || (blog.state === 'draft' && (!req.user || req.user.id !== blog.author._id.toString()))) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        blog.read_count += 1;
        await blog.save();
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findOne({ _id: req.params.id, author: req.user.id });
        if (!blog) return res.status(404).json({ message: 'Blog not found or unauthorized' });
        
        Object.assign(blog, req.body);
        if (req.body.body) blog.reading_time = calculateReadingTime(req.body.body);
        
        await blog.save();
        res.json(blog);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findOneAndDelete({ _id: req.params.id, author: req.user.id });
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.json({ message: 'Blog deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getMyBlogs = async (req, res) => {
    const { state, page = 1, limit = 10 } = req.query;
    const query = { author: req.user.id };
    if (state) query.state = state;

    const blogs = await Blog.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit);
    res.json(blogs);
};