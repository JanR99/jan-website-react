import React from 'react';
import { HashRouter as Router, Link, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/layout/Layout';
import Cookbook from './components/Cookbook';
import Home from './components/Home';
import Destination from './components/Destination';
import RecipePage from './components/RecipePage';
import AccountPage from './components/account/AccountPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PasswordResetPage from './components/auth/PasswordResetPage';
import { ACCOUNT_BASE, ACCOUNT_SECTIONS } from './config/navigation';

const NotFound: React.FC = () => (
    <div className="container">
        <div className="card empty-state" style={{ marginTop: 48 }}>
            <h3>Seite nicht gefunden</h3>
            <p>Diese Seite gibt es leider nicht (mehr).</p>
            <Link to="/" className="btn">Zur Startseite</Link>
        </div>
    </div>
);

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/cookbook" element={<Cookbook />} />
                    <Route path="/cookbook/:recipeTitle" element={<RecipePage />} />
                    <Route path="/destination/:destination" element={<Destination />} />
                    <Route path="/passwort-zuruecksetzen" element={<PasswordResetPage />} />

                    {/* paths for logged-in users */}
                    <Route
                        path={ACCOUNT_BASE}
                        element={
                            <ProtectedRoute>
                                <AccountPage />
                            </ProtectedRoute>
                        }
                    >
                        {ACCOUNT_SECTIONS.map(section =>
                            section.path === '' ? (
                                <Route key="index" index element={section.element} />
                            ) : (
                                <Route
                                    key={section.path}
                                    path={section.path}
                                    element={section.element}
                                />
                            )
                        )}
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
