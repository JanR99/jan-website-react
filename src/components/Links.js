import React from "react";
import '../App.css'; // Assuming the CSS file is the same

function Links() {
    const links = [
        {
            url: "https://education.github.com/pack/offers",
            title: "Software für Studenten",
            description: "GitHub Seite, wo man Software kostenlos downloaden kann",
        },
        {
            url: "https://wwwcip.informatik.uni-erlangen.de/documentation/sshhostkeys.en.html",
            title: "SSH Hostkeys",
            description: "SSH Hostkeys, damit man sich bei den CIPs anmelden kann",
        },
        {
            url: "https://remote.cip.cs.fau.de/",
            title: "CIP-Pool",
            description: "Website zum Anmelden an den CIP-Pools",
        },
        {
            url: "https://leetcode.com/problemset/all/",
            title: "Leetcode",
            description: "Website zum Üben/Lösen von algorithmischen Problemen",
        },
        {
            url: "https://www.hackerrank.com/dashboard",
            title: "HackerRank",
            description: "Website zum Üben/Lösen von algorithmischen Problemen",
        },
        {
            url: "https://www.studisoft.de/shibboleth/shibdwayf?entityID=http%3A%2F%2Fwww.studisoft.de%2Fshibboleth&return=https%3A%2F%2Fwww.studisoft.de%2FShibboleth.sso%2FLogin%3FSAMLDS%3D1%26target%3Dcookie%253A1660417377_7d1c",
            title: "StudiSoft",
            description: "Software für Studenten",
        },
    ];

    return (
        <div>
            <header>
                <h1 className="header">Links</h1>
            </header>

            <table className="table-center">
                <thead>
                <tr>
                    <th style={{ color: "black", fontWeight: "bold" }}>
                        <u>Links</u>
                    </th>
                    <th style={{ color: "black", fontWeight: "bold" }}>
                        <u>Beschreibung</u>
                    </th>
                </tr>
                </thead>
                <tbody>
                {links.map((link, index) => (
                    <tr key={index}>
                        <td>
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                                {link.title}
                            </a>
                        </td>
                        <td>{link.description}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default Links;
