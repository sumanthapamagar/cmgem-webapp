import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './global.css'
import App from "../src/App"
import { msalInstance } from '../src/lib/authConfig';
import {  EventType } from "@azure/msal-browser";
// import { registerSW } from 'virtual:pwa-register';

// if ('serviceWorker' in navigator) {
//   registerSW();
// }

msalInstance.initialize().then(() => {
  // Default to using the first account if no account is active on page load
  if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
    // Account selection logic is app dependent. Adjust as needed for different use cases.
    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
  }

  // Optional - This will update account state if a user signs in from another tab or window
  msalInstance.enableAccountStorageEvents();

  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
      const account = event.payload.account;
      msalInstance.setActiveAccount(account);
    }
  });

  const container = document.getElementById("root");
  const root = ReactDOM.createRoot(container);

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App msalInstance ={msalInstance}/>
      </BrowserRouter>
    </React.StrictMode>,
  );
});