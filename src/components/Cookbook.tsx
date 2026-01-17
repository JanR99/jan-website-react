import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const categories = [
    'asiatisch',
    'kartoffel',
    'nachspeisen',
    'pasta',
    'teigwaren',
    'aromenkick',
];

const Cookbook: React.FC = () => {
    return (
        <main>
            <header>
                <h1 className="header">Mein Kochbuch</h1>
            </header>

            <nav className="top">
                {categories.map((cat) => (
                    <Link key={cat} to={`/cookbook/${cat}`} className="button-link">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Link>
                ))}
            </nav>
        </main>
    );
};

export default Cookbook;
