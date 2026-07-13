import React, { useState } from 'react';
import { useAPI } from '../hooks/useAPI';
import './MadurezDigital.css';

export default function MadurezDigital() {
    const [selectedDimension, setSelectedDimension] = useState(null);
    const { data: dimensiones, loading, error } = useAPI('madurez');

    const getMaturityColor = (puntaje, max = 5) => {
        const percent = (puntaje / max) * 100;
        if (percent >= 80) return '#22c55e';
        if (percent >= 60) return '#eab308';
        if (percent >= 40) return '#f59e0b';
        return '#dc2626';
    };

    if (loading) return <div className="loading">Cargando madurez digital...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="madurez-container">
            <div className="madurez-header">
                <h2>Matriz de Madurez Digital</h2>
                <p className="subtitle">Comparativa de puntajes actuales vs objetivos</p>
            </div>

            <div className="dimensiones-grid">
                {dimensiones.map(dim => (
                    <div 
                        key={dim.id}
                        className="dimension-card"
                        onClick={() => setSelectedDimension(dim)}
                    >
                        <div className="dimension-title">{dim.dimension}</div>

                        <div className="comparison">
                            <div className="score-box">
                                <label>Actual</label>
                                <div className="score-display">
                                    <div className="score-number" style={{color: getMaturityColor(dim.puntaje_actual)}}>
                                        {dim.puntaje_actual}
                                    </div>
                                    <div className="score-bar">
                                        <div 
                                            className="score-fill"
                                            style={{
                                                width: `${(dim.puntaje_actual / 5) * 100}%`,
                                                background: getMaturityColor(dim.puntaje_actual)
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="arrow">→</div>

                            <div className="score-box">
                                <label>Objetivo</label>
                                <div className="score-display">
                                    <div className="score-number" style={{color: '#0369a1'}}>
                                        {dim.puntaje_objetivo}
                                    </div>
                                    <div className="score-bar">
                                        <div 
                                            className="score-fill"
                                            style={{
                                                width: `${(dim.puntaje_objetivo / 5) * 100}%`,
                                                background: '#0369a1'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="brecha-indicator">
                            Brecha: <strong>{dim.brecha || (dim.puntaje_objetivo - dim.puntaje_actual)}</strong>
                        </div>
                    </div>
                ))}
            </div>

            {selectedDimension && (
                <div className="modal-overlay" onClick={() => setSelectedDimension(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedDimension(null)}>✕</button>
                        <h2>{selectedDimension.dimension}</h2>

                        {selectedDimension.descripcion && (
                            <div className="detail-item">
                                <label>Descripción</label>
                                <p>{selectedDimension.descripcion}</p>
                            </div>
                        )}

                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Puntaje Actual</label>
                                <div className="score-display-large">
                                    <div className="score-number" style={{color: getMaturityColor(selectedDimension.puntaje_actual)}}>
                                        {selectedDimension.puntaje_actual} / 5
                                    </div>
                                </div>
                            </div>

                            <div className="detail-item">
                                <label>Puntaje Objetivo</label>
                                <div className="score-display-large">
                                    <div className="score-number" style={{color: '#0369a1'}}>
                                        {selectedDimension.puntaje_objetivo} / 5
                                    </div>
                                </div>
                            </div>

                            <div className="detail-item">
                                <label>Brecha</label>
                                <p style={{fontSize: '18px', fontWeight: 'bold', color: selectedDimension.brecha > 2 ? '#dc2626' : '#eab308'}}>
                                    {selectedDimension.brecha || (selectedDimension.puntaje_objetivo - selectedDimension.puntaje_actual)}
                                </p>
                            </div>
                        </div>

                        {selectedDimension.evidencia && (
                            <div className="detail-full">
                                <label>Evidencia</label>
                                <p>{selectedDimension.evidencia}</p>
                            </div>
                        )}

                        {selectedDimension.accion_recomendada && (
                            <div className="detail-full">
                                <label>Acción Recomendada</label>
                                <p>{selectedDimension.accion_recomendada}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
