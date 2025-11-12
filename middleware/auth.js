/**
 * Custom middleware to check if the user is authenticated.
 * If not authenticated, the user is redirected to the sign-in page.
 * */
export function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        // User is not authenticated, redirect to sign-in
        return res.redirect('/auth/signin');
    }

    // User is authenticated, proceed to the next middleware or route handler
    next();
};