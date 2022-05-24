export const msalConfig = {
  auth: {
    clientId: window.ENV.clientId, 
    authority: "https://login.microsoftonline.com/e4a7ae9d-d444-450b-a556-d3dd348a7f34", // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
    redirectUri: "/",
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  }
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: window.ENV.scopes
};
