import express from 'express';
import { 
    createBlog, getBlogs, getSingleBlog, 
    updateBlog, deleteBlog, getMyBlogs 
} from '../controllers/blogController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getBlogs)
    .post(protect, createBlog);

router.get('/my-blogs', protect, getMyBlogs);

router.route('/:id')
    .get(optionalAuth, getSingleBlog)
    .patch(protect, updateBlog)
    .delete(protect, deleteBlog);

export default router;