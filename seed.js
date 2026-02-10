import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Blog from './models/Blog.js';
import { calculateReadingTime } from './utils/readingTime.js';

dotenv.config();

const seedDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing data
    await User.deleteMany({});
    await Blog.deleteMany({});

    // Create a seed user
    const user = await User.create({
        first_name: "Admin",
        last_name: "Seeder",
        email: "admin@blog.com",
        password: "password123"
    });

    const blogs = [];
    const tagsPool = ['javascript', 'nodejs', 'webdev', 'database', 'express'];

    for (let i = 1; i <= 50; i++) {
        const body = `This is the body for blog number ${i}. It contains enough text to test things out.`;
        blogs.push({
            title: `Blog Post #${i}`,
            description: `Description for blog post ${i}`,
            author: user._id,
            state: i % 2 === 0 ? 'published' : 'draft', // Half published, half draft
            tags: [tagsPool[Math.floor(Math.random() * tagsPool.length)]],
            body: body,
            read_count: Math.floor(Math.random() * 100),
            reading_time: calculateReadingTime(body)
        });
    }

    await Blog.insertMany(blogs);
    console.log("Database Seeded with 50 blogs!");
    process.exit();
};

seedDB();