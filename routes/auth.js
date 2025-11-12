import { Router } from 'express';
const router = Router();
// .js extension is required for local imports
import { authProvider, REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } from '../auth/authConfig.js'; 

// Scopes required for the application
const scopes = ["openid", "profile", "offline_access"];

/**
 * GET /auth/signin
 * Initiates the authentication flow.
 */
router.get('/signin', async (req, res, next) => {
    try {
        const authCodeUrlParameters = {
            scopes: scopes,
            redirectUri: REDIRECT_URI,
        };

        // Get the URL to redirect the user to
        const authCodeUrl = await authProvider.getAuthCodeUrl(authCodeUrlParameters);
        res.redirect(authCodeUrl);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /auth/redirect
 * The callback endpoint for Entra ID. Handles the authorization code.
 * Note: Entra External ID sends a POST request to this endpoint.
 */
router.post('/redirect', async (req, res, next) => {
    const tokenRequest = {
        code: req.body.code,
        scopes: scopes,
        redirectUri: REDIRECT_URI,
    };

    try {
        // Exchange the auth code for an ID token
        const tokenResponse = await authProvider.acquireTokenByCode(tokenRequest);

        // Store user information in the session
        req.session.isAuthenticated = true;
        req.session.account = tokenResponse.account;
        
        // Redirect to the protected profile page
        res.redirect('/profile');
    } catch (error) {
        next(error);
    }
});

/**
 * GET /auth/signout
 * Logs the user out of both the local session and the Entra ID session.
 */
router.get('/signout', (req, res, next) => {
    // Construct the Entra ID logout URI 
    const logoutUri = `https://${process.env.TENANT_SUBDOMAIN}.ciamlogin.com/oauth2/v2.0/logout?post_logout_redirect_uri=${POST_LOGOUT_REDIRECT_URI}`;

    // Destroy the local session
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }
        
        // Redirect to Entra ID to end the remote session
        res.redirect(logoutUri);
    });
});

export default router;