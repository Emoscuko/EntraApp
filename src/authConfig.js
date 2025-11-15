

import { LogLevel } from "@azure/msal-browser";


export const msalConfig = {
  auth: {
    // ⬇ BURAYI DEĞİŞTİRİN: App Registration > Overview sayfasındaki 'Application (client) ID'
    clientId: "4c24b69b-4ae9-461f-88ca-0f7f4501b2c4", 

    // ⬇ BURAYI DEĞİŞTİRİN: Müşteri Kiracınızın tam adı.
    // Örn: "https://ardahwcustomertenant.onmicrosoft.com/"
    // VEYA "https://[tenant-name].ciamlogin.com/" (Yeni format bu olabilir, portal'dan kontrol edin)
    authority: "https://EmirhanAtarHWCustomerTenant.ciamlogin.com/", 

    
    redirectUri: "https://emirhanatar-hw-entra-rg-e9emgzfma3ethagy.westeurope-01.azurewebsites.net/auth/redirect", 

    // ⬇ BURAYI DEĞİŞTİRİN: (Gerekirse) authority'yi bu formatta da deneyebilirsiniz.
    // authority: "https://[YOUR_TENANT_DOMAIN_NAME].ciamlogin.com/",

    knownAuthorities: ["EmirhanAtarHWCustomerTenant.ciamlogin.com"],// Kiracı alan adınızı buraya ekleyin
  },
  cache: {
    cacheLocation: "sessionStorage", // Bu, oturum depolamayı ayarlar
    storeAuthStateInCookie: false, 
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
    },
  },
};

/**
 * Giriş/kayıt akışı için istek kapsamları.
 */
export const loginRequest = {
  scopes: ["openid", "profile"]
};

/**
 * ⬇ BURAYI DEĞİŞTİRİN: User Flow adınız
 * User Flow'unuzun tam adını buraya girin (örn: "B2C_1_SignUpSignIn").
 * Not: MSAL, bunu 'authority' ile birleştirecektir.
 */
 export const userFlows = {
    signUpSignIn: "SigninSignup",
};