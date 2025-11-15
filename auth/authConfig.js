import { ConfidentialClientApplication } from "@azure/msal-node";
import 'dotenv/config'; // Use import for dotenv/config

/**
 * MSAL Configuration Object
 * See for details: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */
const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        // Authority format for Entra External ID: https://{TENANT_SUBDOMAIN}.ciamlogin.com/
        authority: `https://${process.env.TENANT_SUBDOMAIN}.ciamlogin.com/`
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: "Info",
        }
    }
};

// Instantiate the MSAL ConfidentialClientApplication
const authProvider = new ConfidentialClientApplication(msalConfig);

// --- FIX 1: Define constants before exporting ---
const REDIRECT_URI = process.env.REDIRECT_URI;
const POST_LOGOUT_REDIRECT_URI = process.env.POST_LOGOUT_REDIRECT_URI;

// --- FIX 2: Use ESM 'export' instead of 'module.exports' ---
export {
    authProvider,
    REDIRECT_URI,
    POST_LOGOUT_REDIRECT_URI
};