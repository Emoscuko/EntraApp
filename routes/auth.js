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
        
        res.redirect('/profile');
    } catch (error) {
        next(error);
    }
});

/**
 * GET /auth/signout
 * Hesap seçici ile çıkış yapar - kullanıcı hangi hesaptan çıkış yapacağını seçebilir
 */
router.get('/signout', (req, res, next) => {
    const policyName = process.env.POLICY_NAME;

    if (!policyName) {
        console.error("POLICY_NAME is not set in .env file.");
        req.session.destroy(() => { res.redirect('/'); });
        return; 
    }

    const encodedRedirectUri = encodeURIComponent(POST_LOGOUT_REDIRECT_URI);
    
    // id_token_hint OLMADAN logout URL'i - Microsoft hesap seçici gösterecek
    const logoutUri = `https://${process.env.TENANT_SUBDOMAIN}.ciamlogin.com/${policyName}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodedRedirectUri}`;

    // ÖNEMLİ: Session'ı SONRA sil - önce Microsoft'a yönlendir
    // Böylece Microsoft'un çerezleri hala aktif olacak ve hesabı gösterecek
    res.redirect(logoutUri);
    
    // Session'ı async olarak sil (kullanıcı Microsoft sayfasına gittikten sonra)
    setTimeout(() => {
        req.session.destroy((err) => {
            if (err) console.error("Session destroy error:", err);
        });
    }, 100);
});

export default router;