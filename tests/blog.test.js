import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';

let token;
let blogId;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    await User.deleteMany({});
    
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

describe('Blog API Endpoints', () => {
    it('should create a new blog in draft state', async () => {
        const res = await request(app)
            .post('/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: "My First Blog",
                description: "Test Description",
                tags: ["node", "js"],
                body: "This is a long body to test the reading time calculation."
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body.state).toBe('draft');
        blogId = res.body._id;
    });

    it('should fetch published blogs', async () => {
        const res = await request(app).get('/blogs');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.blogs)).toBe(true);
    });

    it('should fail to update a blog if not the owner', async () => {
        const res = await request(app)
            .patch(`/blogs/${blogId}`)
            .send({ state: 'published' }); // No token
        expect(res.statusCode).toEqual(401);
    });
});