import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1000,
});

export default rateLimiter;