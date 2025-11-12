import { Router } from 'express';
const router = Router();
import { isAuthenticated } from '../middleware/auth.js'; // .js extension is required

/**
 * GET /
 * Renders the public home page.
 */
router.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

/**
 * GET /profile
 * Renders the protected profile page.
 * This route is protected by the 'isAuthenticated' middleware. 
 */
router.get('/profile', isAuthenticated, (req, res) => {
    // The user's account info was stored in the session during login
    const user = req.session.account;
    
    // Render the profile view, passing the user object
    res.render('profile', { 
        title: 'Profile', 
        user: user 
    });
});

export default router;