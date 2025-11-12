// Use import for dotenv/config
import 'dotenv/config'; 

// ESM imports for packages
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url'; // Needed to fix __dirname

// Import route handlers with .js extension
import indexRouter from './routes/index.js';
import authRouter from './routes/auth.js';

// --- Fix for __dirname in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- End fix ---

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files (e.g., stylesheets)
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET, // Used to sign the session ID cookie
    resave: false,                      // Don't save session if unmodified
    saveUninitialized: false,           // Don't create session until something stored
    cookie: {
        secure: false, // Set to false for local HTTP development
        httpOnly: true, // Prevents client-side JS from accessing the cookie
        maxAge: 7200000 // 2 hours
    }
};

// Production-specific hardening for secure cookies
if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // Trust the first proxy (Azure App Service)
    sessionConfig.cookie.secure = true; // Serve secure cookies over HTTPS
}

app.use(session(sessionConfig));

/**
 * Global Middleware
 * This middleware makes the user's authentication status and account info
 * available to all EJS templates. This is used in the header partial
 * to conditionally display "Sign In" or "Sign Out" links. 
 */
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated || false;
    res.locals.account = req.session.account || null;
    next();
});

// Register route handlers
app.use('/', indexRouter);
app.use('/auth', authRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});