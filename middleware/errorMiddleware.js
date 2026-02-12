import logger from '../utils/logger.js';

export const globalErrorHandler = (err, req, res, next) => {
    const errorDetails = {
        message: err.message,
        status: err.status || 500,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.originalUrl,
        method: req.method
    };

    logger.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Error: ${err.message}`);

    res.status(errorDetails.status).json({
        status: 'error',
        message: errorDetails.message,
        ...(errorDetails.stack && { stack: errorDetails.stack })
    });
};