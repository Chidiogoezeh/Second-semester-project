import Blog from '../models/Blog.js';
import User from '../models/User.js';
import { calculateReadingTime } from '../utils/readingTime.js';

// 1. Create Blog (Requirement 7, 8, 13, 16)
export const createBlog = async (req, res, next) => {
    try {
        const { title, description, tags, body } = req.body;
        const reading_time = calculateReadingTime(body);
        
        const blog = await Blog.create({
            title, description, tags, body,
            author: req.user.id,
            reading_time,
            state: 'draft' // Requirement 8
        });
        res.status(201).json(blog);
    } catch (err) { next(err); }
};

// 2. Get Public Blogs (Requirement 5, 14)
export const getBlogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, author, title, tags, orderBy } = req.query;
        const query = { state: 'published' };

        // Search logic (Requirement 14.2)
        if (title) query.title = new RegExp(title, 'i');
        if (tags) query.tags = { $in: tags.split(',') };
        if (author) {
            const authorObj = await User.findOne({ 
                $or: [{ first_name: new RegExp(author, 'i') }, { last_name: new RegExp(author, 'i') }] 
            });
            if (authorObj) query.author = authorObj._id;
        }

        // Ordering logic (Requirement 14.3)
        const sort = {};
        if (orderBy) {
            sort[orderBy] = -1;
        } else {
            sort.timestamp = -1;
        }

        const blogs = await Blog.find(query)
            .populate('author', 'first_name last_name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sort);

        res.json({ status: 'success', count: blogs.length, page: Number(page), data: blogs });
    } catch (err) { next(err); }
};

// 3. Get Single Blog (Requirement 6, 15)
export const getSingleBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'first_name last_name email');
        
        if (!blog || blog.state !== 'published') {
            return res.status(404).json({ message: 'Blog not found or is still a draft' });
        }

        // Increment read count (Requirement 15)
        blog.read_count += 1;
        await blog.save();

        res.json(blog);
    } catch (err) { next(err); }
};

// 4. Update/Publish/Edit (Requirement 9, 10)
export const updateBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        // Ownership check (Note Requirement)
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized: You do not own this blog' });
        }

        if (req.body.body) req.body.reading_time = calculateReadingTime(req.body.body);
        
        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedBlog);
    } catch (err) { next(err); }
};

// 5. Delete (Requirement 11)
export const deleteBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog || blog.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized or not found' });
        }
        await blog.deleteOne();
        res.json({ message: 'Blog deleted successfully' });
    } catch (err) { next(err); }
};

// 6. Get My Blogs (Requirement 12)
export const getMyBlogs = async (req, res, next) => {
    try {
        const { state, page = 1, limit = 10 } = req.query;
        const query = { author: req.user.id };
        if (state) query.state = state;

        const blogs = await Blog.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit);
        res.json({ page: Number(page), data: blogs });
    } catch (err) { next(err); }
};