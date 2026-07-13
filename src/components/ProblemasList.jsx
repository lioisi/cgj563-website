import React, { useEffect, useState } from 'react';
import { useAPI, callAPI } from '../hooks/useAPI';
import './ProblemasList.css';

export default function ProblemasList() {
    const [sortBy, setSortBy] = useState('prioridad_calculada');
    const [filter, setFilter] = useState('all');
    const [selectedProblem, setSelectedProblem] = useState(null);
    const { data: problems, loading, error } = useAPI('problemas');
    const safeProblems = Array.isArray(problems) ? problems : [];

    const filteredProblems = safeProblems.filter(p => {
        if (filter === 'all') return true;
        if (filter === 'abiertos') return p.estado === 'Abierto';
        if (filter === 'en-analisis') return p.estado === 'En análisis';
        if (filter === 'resueltos') return p.estado === 'Resuelto';
        return true;
    });

    const sortedProblems = [...filteredProblems].sort((a, b) => {
        if (sortBy === 'prioridad_calculada') return parseFloat(b.prioridad_calculada) - parseFloat(a.prioridad_calculada);
        if (sortBy === 'impacto') return b.impacto - a.impacto;
        if (sortBy === 'riesgo') return b.riesgo - a.riesgo;
        return 0;
    });

    const getRiskColor = (valor, max = 5) => {
        const percent = (valor / max) * 100;
        if (percent >= 80) return '#dc2626';
        if (percent >= 60) return '#f59e0b';
        if (percent >= 40) return '#eab308';
        return '#22c55e';
    };

    if (loading) return <div className="loading">Cargando problemas...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="problemas-container">
            <div className="problemas-header">
                <h2>Matriz de Problemas</h2>
                <div className="controls">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="select">
                        <option value="prioridad_calculada">Ordenar: Prioridad</option>
                        <option value="impacto">Ordenar: Impacto</option>
                        <option value="riesgo">Ordenar: Riesgo</option>
                    </select>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="select">
                        <option value="all">Filtro: Todos</option>
                        <option value="abiertos">Abiertos</option>
                        <option value="en-analisis">En análisis</option>
                        <option value="resueltos">Resueltos</option>
                    </select>
                </div>
            </div>

            <div className="problemas-grid">
                {sortedProblems.map(problem => (
                    <div 
                        key={problem.id} 
                        className="problema-card"
                        onClick={() => setSelectedProblem(problem)}
                    >
                        <div className="problema-header">
                            <h3>#{problem.numero}: {problem.problema}</h3>
                            <span className={`badge estado estado-${problem.estado.toLowerCase().replace(/\s/g, '-')}`}>
                                {problem.estado}
                            </span>
                        </div>
                        <p className="proceso">{problem.proceso_afectado}</p>
                        <div className="metrics">
                            <div className="metric">
                                <label>Impacto</label>
                                <div className="rating">
                                    {Array.from({length: 5}, (_, i) => (
                                        <div 
                                            key={i}
                                            className={`star ${i < problem.impacto ? 'filled' : ''}`}
                                            style={{background: i < problem.impacto ? getRiskColor(problem.impacto) : '#e5e7eb'}}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="metric">
                                <label>Riesgo</label>
                                <div className="rating">
                                    {Array.from({length: 5}, (_, i) => (
                                        <div 
                                            key={i}
                                            className={`star ${i < problem.riesgo ? 'filled' : ''}`}
                                            style={{background: i < problem.riesgo ? getRiskColor(problem.riesgo) : '#e5e7eb'}}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="priority-score">
                            Prioridad: <strong>{Number(problem.prioridad_calculada || 0).toFixed(2)}</strong>
                        </div>
                    </div>
                ))}
            </div>

            {selectedProblem && (
                <div className="modal-overlay" onClick={() => setSelectedProblem(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedProblem(null)}>✕</button>
                        <h2>#{selectedProblem.numero}: {selectedProblem.problema}</h2>
                        
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Proceso Afectado</label>
                                <p>{selectedProblem.proceso_afectado}</p>
                            </div>
                            <div className="detail-item">
                                <label>Estado</label>
                                <p>{selectedProblem.estado}</p>
                            </div>
                            <div className="detail-item">
                                <label>Responsable</label>
                                <p>{selectedProblem.responsable || 'No asignado'}</p>
                            </div>
                            <div className="detail-item">
                                <label>Impacto (1-5)</label>
                                <p>{selectedProblem.impacto}</p>
                            </div>
                            <div className="detail-item">
                                <label>Frecuencia (1-5)</label>
                                <p>{selectedProblem.frecuencia}</p>
                            </div>
                            <div className="detail-item">
                                <label>Riesgo (1-5)</label>
                                <p>{selectedProblem.riesgo}</p>
                            </div>
                            <div className="detail-item">
                                <label>Esfuerzo de solución (1-5)</label>
                                <p>{selectedProblem.esfuerzo_solucion}</p>
                            </div>
                            <div className="detail-item">
                                <label>Prioridad Calculada</label>
                                <p><strong>{Number(selectedProblem.prioridad_calculada || 0).toFixed(2)}</strong></p>
                            </div>
                        </div>

                        {selectedProblem.accion_recomendada && (
                            <div className="detail-full">
                                <label>Acción Recomendada</label>
                                <p>{selectedProblem.accion_recomendada}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
