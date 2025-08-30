import { PublicClientApplication } from "@azure/msal-browser";

// Config object to be passed to Msal on creation
export const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_CLIENT_ID,
        authority: import.meta.env.VITE_AUTHORITY,
        redirectUri: import.meta.env.VITE_REDIRECT_URI,
        postLogoutRedirectUri: "/",
    },

    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: true,
    },
    system: {
        tokenRenewalOffsetSeconds: 3000, // Set token renewal offset in seconds
    },
};

export const msalInstance = new PublicClientApplication(msalConfig);

// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest = {
    scopes: [
        "User.Read",
        "openid",
        "profile",
    ]
};

// Add here the endpoints for MS Graph API services you would like to use.
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
};

export const getIdToken = async () => {
    const account = msalInstance.getActiveAccount();
    if (!account) {
        throw Error("No active account! Verify a user has been signed in and setActiveAccount has been called.");
    }
    const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: account
    });
    if (response && response.idToken) {
        return response.idToken;
    } else {
        // Handle the case when no ID token is received
        console.error('Failed to acquire ID token:', response);
        // You might want to initiate a login or take appropriate action.
    }
}
