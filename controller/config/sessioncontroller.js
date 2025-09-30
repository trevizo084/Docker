const session = require("express-session");
const dotenv = require("dotenv");

dotenv.config(); 

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRETKEY, // Replace with a strong secret key
    resave: false, // Prevents resaving session if unmodified
    saveUninitialized: false, // Prevents saving uninitialized sessions
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
});

module.exports = sessionMiddleware;