import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { destinationImage, destinationThumbnail, destinations, findDestination } from '../data/destinations';
import PageHeader from './layout/PageHeader';
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import '../styles/Destination.css';

const Destination: React.FC = () => {
    const { destination: param } = useParams();
    const destination = findDestination(param);
    const [lightbox, setLightbox] = useState<number | null>(null);

    const count = destination?.imageCount ?? 0;
    const close = useCallback(() => setLightbox(null), []);
    const step = useCallback(
        (delta: number) => setLightbox(i => (i === null ? i : (i + delta + count) % count)),
        [count]
    );

    useEffect(() => {
        if (lightbox === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowRight') step(1);
            if (e.key === 'ArrowLeft') step(-1);
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [lightbox, close, step]);

    if (!destination) {
        return (
            <div className="container">
                <div className="card empty-state" style={{ marginTop: 48 }}>
                    <h3>Reiseziel nicht gefunden</h3>
                    <Link to="/" className="btn">Zu allen Reisen</Link>
                </div>
            </div>
        );
    }

    const images = Array.from({ length: count }, (_, i) => i + 1);
    const others = destinations.filter(d => d.name !== destination.name);

    return (
        <div className="container">
            <PageHeader
                back={{ to: '/', label: 'Alle Reisen' }}
                eyebrow={destination.country !== destination.name ? destination.country : 'Reise'}
                title={destination.name}
            />

            <div className="gallery">
                {images.map((n, i) => (
                    <button
                        key={n}
                        type="button"
                        className="gallery-item"
                        onClick={() => setLightbox(i)}
                        aria-label={`${destination.name} – Foto ${n} vergrößern`}
                    >
                        <img
                            src={destinationThumbnail(destination.name, n)}
                            alt={`${destination.name} ${n}`}
                            loading={i < 2 ? 'eager' : 'lazy'}
                        />
                    </button>
                ))}
            </div>

            <section className="section">
                <h2 className="other-destinations-title">Weitere Reiseziele</h2>
                <div className="other-destinations">
                    {others.map(d => (
                        <Link key={d.name} to={`/destination/${d.name}`} className="other-destination">
                            <img src={destinationThumbnail(d.name, 1)} alt="" loading="lazy" />
                            <span>
                                <strong>{d.name}</strong>
                                {d.country !== d.name && <small>{d.country}</small>}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {lightbox !== null && (
                <div className="lightbox" role="dialog" aria-modal="true" aria-label="Bildansicht" onClick={close}>
                    <img
                        key={lightbox}
                        src={destinationImage(destination.name, lightbox + 1)}
                        alt={`${destination.name} ${lightbox + 1}`}
                        onClick={e => e.stopPropagation()}
                        style={{ backgroundImage: `url("${destinationThumbnail(destination.name, lightbox + 1)}")` }}
                    />
                    <button type="button" className="lightbox-btn lightbox-close" onClick={close} aria-label="Schließen">
                        <X size={20} />
                    </button>
                    <button
                        type="button"
                        className="lightbox-btn lightbox-prev"
                        onClick={e => { e.stopPropagation(); step(-1); }}
                        aria-label="Vorheriges Bild"
                    >
                        <ChevronLeft size={26} />
                    </button>
                    <button
                        type="button"
                        className="lightbox-btn lightbox-next"
                        onClick={e => { e.stopPropagation(); step(1); }}
                        aria-label="Nächstes Bild"
                    >
                        <ChevronRight size={26} />
                    </button>
                    <span className="lightbox-counter">{lightbox + 1} / {count}</span>
                </div>
            )}
        </div>
    );
};

export default Destination;
