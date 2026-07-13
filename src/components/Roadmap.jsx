import React, { useState } from 'react';
import { useAPI } from '../hooks/useAPI';
import './Roadmap.css';

export default function Roadmap() {
    const [selectedPhase, setSelectedPhase] = useState(null);
    const { data: roadmap, loading, error } = useAPI('roadmap');

    const getStateColor = (estado) => {
        const colors = {
            'No iniciado': '#f3f4f6',
            'En progreso': '#bfdbfe',
            'Completado': '#dcfce7',
            'Pausado': '#fed7aa'
        };
        return colors[estado] || '#f3f4f6';
    };

    const getStateTextColor = (estado) => {
        const colors = {
            'No iniciado': '#4b5563',
            'En progreso': '#1e40af',
            'Completado': '#166534',
            'Pausado': '#92400e'
        };
        return colors[estado] || '#4b5563';
    };

    if (loading) return <div className="loading">Cargando roadmap...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    const sortedRoadmap = [...roadmap].sort((a, b) => {
        const getPhaseNumber = (fase) => parseInt(fase.match(/\d+/)?.[0] || 0);
        return getPhaseNumber(a.fase) - getPhaseNumber(b.fase);
    });

    return (
        <div className="roadmap-container">
            <div className="roadmap-header">
                <h2>Roadmap de Iniciativas</h2>
                <p className="subtitle">Timeline de fases y entregables</p>
            </div>

            <div className="timeline">
                {sortedRoadmap.map((phase, index) => (
                    <div key={phase.id} className="timeline-item">
                        <div className="timeline-marker">
                            <div 
                                className="timeline-dot"
                                style={{
                                    background: getStateColor(phase.estado),
                                    borderColor: getStateTextColor(phase.estado)
                                }}
                            />
                            {index < sortedRoadmap.length - 1 && <div className="timeline-line" />}
                        </div>

                        <div 
                            className="phase-card"
                            onClick={() => setSelectedPhase(phase)}
                            style={{borderLeftColor: getStateTextColor(phase.estado)}}
                        >
                            <div className="phase-header">
                                <h3>{phase.fase}</h3>
                                <span 
                                    className="phase-state"
                                    style={{
                                        background: getStateColor(phase.estado),
                                        color: getStateTextColor(phase.estado)
                                    }}
                                >
                                    {phase.estado}
                                </span>
                            </div>

                            <h4 className="phase-initiative">{phase.iniciativa}</h4>

                            {phase.duracion_estimada && (
                                <p className="phase-duration">
                                    <strong>Duración:</strong> {phase.duracion_estimada}
                                </p>
                            )}

                            {phase.objetivo && (
                                <p className="phase-text">
                                    <strong>Objetivo:</strong> {phase.objetivo}
                                </p>
                            )}

                            {phase.entregable && (
                                <p className="phase-text">
                                    <strong>Entregable:</strong> {phase.entregable}
                                </p>
                            )}

                            {phase.impacto && (
                                <p className="phase-impact">
                                    <strong>Impacto:</strong> {phase.impacto}
                                </p>
                            )}

                            {phase.complejidad && (
                                <div className="phase-tags">
                                    <span className="tag-complexity">
                                        Complejidad: {phase.complejidad}
                                    </span>
                                    {phase.prioridad && (
                                        <span className="tag-priority">
                                            Prioridad: {phase.prioridad}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {selectedPhase && (
                <div className="modal-overlay" onClick={() => setSelectedPhase(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedPhase(null)}>✕</button>
                        <h2>{selectedPhase.fase}</h2>

                        <div className="detail-item">
                            <label>Iniciativa</label>
                            <h3 className="initiative-title">{selectedPhase.iniciativa}</h3>
                        </div>

                        <div className="detail-grid">
                            {selectedPhase.duracion_estimada && (
                                <div className="detail-item">
                                    <label>Duración Estimada</label>
                                    <p>{selectedPhase.duracion_estimada}</p>
                                </div>
                            )}
                            <div className="detail-item">
                                <label>Estado</label>
                                <p 
                                    className="state-badge"
                                    style={{
                                        background: getStateColor(selectedPhase.estado),
                                        color: getStateTextColor(selectedPhase.estado)
                                    }}
                                >
                                    {selectedPhase.estado}
                                </p>
                            </div>
                            {selectedPhase.complejidad && (
                                <div className="detail-item">
                                    <label>Complejidad</label>
                                    <p>{selectedPhase.complejidad}</p>
                                </div>
                            )}
                            {selectedPhase.prioridad && (
                                <div className="detail-item">
                                    <label>Prioridad</label>
                                    <p>{selectedPhase.prioridad}</p>
                                </div>
                            )}
                            {selectedPhase.fecha_inicio && (
                                <div className="detail-item">
                                    <label>Fecha de Inicio</label>
                                    <p>{new Date(selectedPhase.fecha_inicio).toLocaleDateString('es-AR')}</p>
                                </div>
                            )}
                            {selectedPhase.fecha_fin_estimada && (
                                <div className="detail-item">
                                    <label>Fecha Fin Estimada</label>
                                    <p>{new Date(selectedPhase.fecha_fin_estimada).toLocaleDateString('es-AR')}</p>
                                </div>
                            )}
                        </div>

                        {selectedPhase.objetivo && (
                            <div className="detail-full">
                                <label>Objetivo</label>
                                <p>{selectedPhase.objetivo}</p>
                            </div>
                        )}

                        {selectedPhase.entregable && (
                            <div className="detail-full">
                                <label>Entregable</label>
                                <p>{selectedPhase.entregable}</p>
                            </div>
                        )}

                        {selectedPhase.impacto && (
                            <div className="detail-full">
                                <label>Impacto Esperado</label>
                                <p>{selectedPhase.impacto}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
