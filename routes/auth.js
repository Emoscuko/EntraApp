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
 * GET /auth/redirect
 * The callback endpoint for Entra ID. Handles the authorization code.
 */
router.get('/redirect', async (req, res, next) => {
    const tokenRequest = {
        code: req.query.code,
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
    
    // --- THIS IS THE FIX ---
    // The policy name is static for this application, loaded from .env
    const policyName = process.env.POLICY_NAME;

    if (!policyName) {
        // This will only happen if you forget to add it to your .env file
        console.error("POLICY_NAME is not set in .env file. Cannot build logout URL.");
        req.session.destroy(() => {
            res.redirect('/');
        });
        return; 
    }

    // URL-encode the post-logout redirect URI
    const encodedRedirectUri = encodeURIComponent(POST_LOGOUT_REDIRECT_URI);
    
    // --- UPDATED URL CONSTRUCTION ---
    // The logout URL *must* include the policy name used to sign in.
    const logoutUri = `https://${process.env.TENANT_SUBDOMAIN}.ciamlogin.com/${policyName}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodedRedirectUri}`;

    console.log("--- START SIGNOUT DEBUG ---");
    console.log("Policy Name:", policyName);
    console.log("Final Logout URL:", logoutUri);

    // Destroy the local session
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }
        
        // Redirect to the correct Entra ID policy logout endpoint
        res.redirect(logoutUri);
    });
});

export default router;