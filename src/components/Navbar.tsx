import { Link } from "react-router-dom";
import logo from "../assets/jan-wesbite-logo.png";
import "../styles/Navbar.css";
import React from "react";

type NavLink = {
    to: string;
    label: string;
};

type NavbarProps = {
    title: string;
    links: NavLink[];
};

const Navbar: React.FC<NavbarProps> = ({ title, links }) => {
    return (
        <div className="nav-wrapper">
            <div className="header-row">
                <header className="hero-header">
                    <h1>{title}</h1>
                </header>
                <Link to="/" className="logo-fixed">
                    <img src={logo} alt="Logo" />
                </Link>
            </div>

            <div className="hero-buttons">
                {links.map((link, index) => (
                    <Link key={index} to={link.to} className="button-link">
                        {link.label}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Navbar;