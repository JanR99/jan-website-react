import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Cookbook() {
    return (
        <div>
            <header>
                <h1 className="header">Mein Kochbuch</h1>
            </header>

            {/* Categories Section */}
            <header className="categories">
                <h2 style={{ fontSize: '40px' }}>Food Categories</h2>
            </header>

            <div className="top">
                <Link to="/cookbook/asiatisch" className="button-link">Asiatisch</Link>
                <Link to="/cookbook/kartoffel" className="button-link">Kartoffelrezepte</Link>
                <Link to="/cookbook/nachspeisen" className="button-link">Nachspeisen</Link>
                <Link to="/cookbook/pasta" className="button-link">Pasta</Link>
                <Link to="/cookbook/teigwaren" className="button-link">Teigwaren</Link>
            </div>
        </div>
    );
}

export default Cookbook;
