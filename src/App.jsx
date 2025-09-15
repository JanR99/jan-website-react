import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Cookbook from './components/Cookbook.jsx';
import Home from './components/Home.jsx';
import Destination from './components/Destination.jsx';
import Category from './components/Category.jsx';
import Recipe from './components/Recipe.jsx';

export default function App() {
    return (
        <Router>
            <div>
                {/* Header */}
                <header>
                    <h1 className="header">Willkommen auf meiner Website</h1>
                </header>

                {/* Navigation Bar */}
                <div className="top">
                    <Link to="/" className="button-link">Jans Website</Link>
                    <Link to="/cookbook" className="button-link">Mein Kochbuch</Link>
                </div>

                {/* Routes to display other pages */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/cookbook" element={<Cookbook />} />
                    <Route path="/destination/:destination" element={<Destination />} />
                    <Route path="/cookbook/:category" element={<Category />} />
                    <Route path="/cookbook/:category/:recipeTitle" element={<Recipe />} />
                </Routes>
            </div>
        </Router>
    );
}
