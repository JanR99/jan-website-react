import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces';
import './index.css';
import App from './App';
import { AuthProvider } from "./components/auth/AuthContext.tsx";
import { storeRecipesForOffline } from "./utils/offlineCache.ts";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

storeRecipesForOffline().catch(() => {
    // offline storage is optional: the site works without it
});

root.render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
);
