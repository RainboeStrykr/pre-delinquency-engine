'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import './MagicBento.css';

export function MagicBentoCard({ card, index, enableGlow = true, children, className = '', style = {} }) {
    const cardRef = useRef(null);

    const handleMouseMove = useCallback((e) => {
        if (!cardRef.current || !enableGlow) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.current.style.setProperty('--glow-x', `${x}px`);
        cardRef.current.style.setProperty('--glow-y', `${y}px`);
        cardRef.current.style.setProperty('--glow-intensity', '1');
    }, [enableGlow]);

    const handleMouseLeave = useCallback(() => {
        if (!cardRef.current) return;
        cardRef.current.style.setProperty('--glow-intensity', '0');
    }, []);

    const classNames = [
        'magic-bento-card',
        enableGlow ? 'magic-bento-card--border-glow' : '',
        'magic-bento-card--text-autohide',
    ].filter(Boolean).join(' ');

    return (
        <div
            ref={cardRef}
            className={`${classNames} ${className}`.trim()}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ ...(card?.style || {}), ...style }}
        >
            {children ? children : (
                <>
                    <div className="magic-bento-card__header">
                        <span className="magic-bento-card__label">{card.icon}</span>
                    </div>
                    <div className="magic-bento-card__content">
                        {card.visual && (
                            <div className="magic-bento-card__visual">
                                {card.visual}
                            </div>
                        )}
                        <h2 className="magic-bento-card__title">{card.title}</h2>
                        <p className="magic-bento-card__description">{card.description}</p>
                    </div>
                </>
            )}
        </div>
    );
}

export default function MagicBento({ cards }) {
    return (
        <div className="bento-section">
            <div className="card-grid">
                {cards.map((card, i) => (
                    <MagicBentoCard key={i} card={card} index={i} />
                ))}
            </div>
        </div>
    );
}
