import { ConfidentialClientApplication } from "@azure/msal-node";
import 'dotenv/config'; // Use import for dotenv/config

// --- FIX 1: Load variables needed for config first ---
const TENANT_SUBDOMAIN = process.env.TENANT_SUBDOMAIN;
const POLICY_NAME = process.env.POLICY_NAME;

// Check that .env variables are loaded
if (!TENANT_SUBDOMAIN || !POLICY_NAME || !process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    throw new Error("Missing one or more required .env variables: TENANT_SUBDOMAIN, POLICY_NAME, CLIENT_ID, CLIENT_SECRET");
}

/**
 * MSAL Configuration Object
 * See for details: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */
const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        
        // --- FIX 2: The authority URL MUST include the policy name ---
        // Format: https://{TENANT_SUBDOMAIN}.ciamlogin.com/{POLICY_NAME}
        authority: `https://${TENANT_SUBDOMAIN}.ciamlogin.com/${POLICY_NAME}`
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: "Info", // Use "Verbose" for more detailed logs if needed
        }
    }
};

// Instantiate the MSAL ConfidentialClientApplication
const authProvider = new ConfidentialClientApplication(msalConfig);

// Define constants before exporting
const REDIRECT_URI = process.env.REDIRECT_URI;
const POST_LOGOUT_REDIRECT_URI = process.env.POST_LOGOUT_REDIRECT_URI;

// Use ESM 'export'
export {
    authProvider,
    REDIRECT_URI,
    POST_LOGOUT_REDIRECT_URI
};