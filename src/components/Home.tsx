import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import Navbar from "./Navbar";

interface DestinationItem {
    name: string;
    thumbnail: string;
}

const destinations: DestinationItem[] = [
    { name: "Andorra", thumbnail: "Andorra1-min.jpg" },
    { name: "Porto", thumbnail: "Porto1-min.jpg" },
    { name: "Prag", thumbnail: "Prag1-min.jpg" },
    { name: "Spanien", thumbnail: "Spanien1-min.jpg" },
];

const chunkArray = <T,>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
};

const Home: React.FC = () => {
    const destinationChunks = chunkArray(destinations, 2);

    return (
        <div>
            {/* Navigation Bar */}
            <Navbar
                title="Willkommen auf meiner Website"
                links={[
                    { to: "/cookbook", label: "Mein Kochbuch" }
                ]}
            />

            {destinationChunks.map((chunk, chunkIndex) => (
                <div className="container" key={chunkIndex}>
                    {chunk.map((dest) => (
                        <div className="img-container" key={dest.name}>
                            <Link to={`/destination/${dest.name}`}>
                                <img
                                    src={`Bilder/Urlaub-thumbnail/${dest.thumbnail}`}
                                    alt={dest.name}
                                />
                            </Link>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Home;
