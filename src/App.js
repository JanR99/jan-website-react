import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css'; // Import your CSS file
import Cookbook from './components/Cookbook'; // Import Cookbook component
import Links from './components/Links'; // Import Links component
import Home from './components/Home'; // Import Home component
import Destination from './components/Destination'; // Import Destination component

function App() {
    return (
        <Router>
            <div>
                {/* Header */}
                <header>
                    <h1 className="header">Willkommen auf meiner Website</h1>
                </header>

                {/* Navigation Bar */}
                <div className="top">
                    {/* Use Link instead of buttons with onClick */}
                    <Link to="/" className="button-link">Jans Website</Link>
                    <Link to="/cookbook" className="button-link">Mein Kochbuch</Link>
                    <Link to="/links" className="button-link">Links</Link>
                </div>

                {/* Routes to display other pages */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/cookbook" element={<Cookbook />} />
                    <Route path="/links" element={<Links />} />
                    {/* Update the destination route to accept a dynamic parameter */}
                    <Route path="/destination/:destination" element={<Destination />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
