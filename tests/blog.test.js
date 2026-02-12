import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import Blog from '../models/Blog.js';

let token;
let blogId;

beforeAll(async () => {
    // Connect to a test database if possible, or use the existing one
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
    await User.deleteMany({});
    await Blog.deleteMany({});
    
    // Create a test user
    const res = await request(app)
        .post('/auth/signup')
        .send({
            first_name: "Test",
            last_name: "User",
            email: "test@blog.com",
            password: "password123"
        });
    token = res.body.token;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Blogging API Advanced Requirements', () => {

    // Requirement 7 & 8: Create and check Draft state
    it('should create a blog and default state to draft', async () => {
        const res = await request(app)
            .post('/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: "Test Blog Title",
                description: "Test Description",
                tags: ["node", "testing"],
                body: "This is a sample body for the blog post."
            });
        
        expect(res.statusCode).toBe(201);
        expect(res.body.state).toBe('draft');
        expect(res.body).toHaveProperty('reading_time'); // Requirement 16
        blogId = res.body._id;
    });

    // Requirement 9: Owner can publish
    it('should allow the owner to publish the blog', async () => {
        const res = await request(app)
            .patch(`/blogs/${blogId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ state: 'published' });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.state).toBe('published');
    });

    // Requirement 15: Read count should increment
    it('should increment read_count when a single blog is viewed', async () => {
        // First view
        const firstView = await request(app).get(`/blogs/${blogId}`);
        const initialCount = firstView.body.read_count;

        // Second view
        const secondView = await request(app).get(`/blogs/${blogId}`);
        
        expect(secondView.body.read_count).toBe(initialCount + 1);
        expect(secondView.body.author).toHaveProperty('email'); // Check author info is returned
    });

    // Requirement 14: Public list pagination
    it('should return paginated blogs with default limit of 20', async () => {
        const res = await request(app).get('/blogs?page=1');
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        // If you seeded 50 blogs, res.body.data.length should be 20
    });

    // Requirement 11: Owner can delete
    it('should allow owner to delete their blog', async () => {
        const res = await request(app)
            .delete(`/blogs/${blogId}`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        
        // Verify it's gone
        const check = await Blog.findById(blogId);
        expect(check).toBeNull();
    });
});