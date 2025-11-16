import { ConfidentialClientApplication } from "@azure/msal-node";
import 'dotenv/config';

/**
 * MSAL Configuration Object
 */
const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        // This MUST be the generic authority
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

const REDIRECT_URI = process.env.REDIRECT_URI;
const POST_LOGOUT_REDIRECT_URI = process.env.POST_LOGOUT_REDIRECT_URI;

export {
    authProvider,
    REDIRECT_URI,
    POST_LOGOUT_REDIRECT_URI
};