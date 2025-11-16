import { Router } from 'express';
const router = Router();
import { authProvider, REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } from '../auth/authConfig.js'; 

const scopes = ["openid", "profile", "offline_access"];

/**
 * GET /auth/signin
 */
router.get('/signin', async (req, res, next) => {
    try {
        const authCodeUrlParameters = {
            scopes: scopes,
            redirectUri: REDIRECT_URI,
            // NO authority parameter here
        };
        const authCodeUrl = await authProvider.getAuthCodeUrl(authCodeUrlParameters);
        res.redirect(authCodeUrl);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /auth/redirect
 */
router.get('/redirect', async (req, res, next) => {
    const tokenRequest = {
        code: req.query.code,
        scopes: scopes,
        redirectUri: REDIRECT_URI,
         // NO authority parameter here
    };

    try {
        const tokenResponse = await authProvider.acquireTokenByCode(tokenRequest);

        req.session.isAuthenticated = true;
        req.session.account = tokenResponse.account;
        req.session.idToken = tokenResponse.idToken; // DEĞİŞİKLİK: idToken'ı doğrudan session'a kaydedin
        
        res.redirect('/profile');
    } catch (error) {
        next(error);
    }
});

/**
 * GET /auth/signout
 * This logic is 100% correct.
 */
router.get('/signout', (req, res, next) => {
    const policyName = process.env.POLICY_NAME;
    const idToken = req.session.idToken; // DEĞİŞİKLİK: idToken'ı doğrudan session'dan okuyun

    if (!policyName) {
        console.error("POLICY_NAME is not set in .env file.");
        req.session.destroy(() => { res.redirect('/'); });
        return; 
    }

    const encodedRedirectUri = encodeURIComponent(POST_LOGOUT_REDIRECT_URI);
    
    let logoutUri = `https://${process.env.TENANT_SUBDOMAIN}.ciamlogin.com/${policyName}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodedRedirectUri}`;

    if (idToken) {
        logoutUri += `&id_token_hint=${encodeURIComponent(idToken)}`;
    } else {
        console.warn("Could not find idToken in session. Logout may show account picker.");
    }

    req.session.destroy((err) => {
        if (err) { return next(err); }
        res.redirect(logoutUri);
    });
});

export default router;