import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import { globalErrorHandler } from './middleware/errorMiddleware.js'; // Added
import logger from './utils/logger.js'; // Added

dotenv.config();
const app = express();

app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
    res.send('Altsch Second Semester Project API is Running!');
});

// Routes
app.use('/auth', authRoutes);
app.use('/blogs', blogRoutes);

// Global Error Handler (Requirement 18 & 19)
// We use the custom one to ensure the "format" and "logging" requirements are met
app.use(globalErrorHandler); 

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`); // Using logger instead of console
        });
    })
    .catch(err => {
        logger.error('Database connection failed:', err);
    });

export default app;