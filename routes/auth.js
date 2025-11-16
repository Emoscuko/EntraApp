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
        req.session.idToken = tokenResponse.idToken; // ✅ ID Token'ı session'da sakla
        
        res.redirect('/profile');
    } catch (error) {
        next(error);
    }
});

/**
 * GET /auth/signout
 * ID token hint ile sessiz çıkış yapar - hesap seçici gösterilmez
 */
router.get('/signout', (req, res, next) => {
    const policyName = process.env.POLICY_NAME;
    const idToken = req.session.idToken; // ✅ Session'dan ID token al

    if (!policyName) {
        console.error("POLICY_NAME is not set in .env file.");
        req.session.destroy(() => { res.redirect('/'); });
        return; 
    }

    const encodedRedirectUri = encodeURIComponent(POST_LOGOUT_REDIRECT_URI);
    
    // ✅ Logout URL'ini oluştur
    let logoutUri = `https://${process.env.TENANT_SUBDOMAIN}.ciamlogin.com/${policyName}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodedRedirectUri}`;
    
    // ✅ ID token varsa id_token_hint parametresini ekle
    if (idToken) {
        logoutUri += `&id_token_hint=${idToken}`;
    }

    // ÖNEMLİ: Session'ı Microsoft'a yönlendirmeden ÖNCE sil
    req.session.destroy((err) => {
        if (err) console.error("Session destroy error:", err);
        res.redirect(logoutUri);
    });
});

export default router;