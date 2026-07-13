import React, { useState } from 'react';
import { useAPI } from '../hooks/useAPI';
import './BacklogFuncional.css';

export default function BacklogFuncional() {
    const [selectedItem, setSelectedItem] = useState(null);
    const [filterEpica, setFilterEpica] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const { data: backlog, loading, error } = useAPI('backlog');
    const safeBacklog = Array.isArray(backlog) ? backlog : [];

    const epicas = [...new Set(safeBacklog.map(b => b.epica))];

    const filteredBacklog = safeBacklog.filter(item => {
        if (filterEpica !== 'all' && item.epica !== filterEpica) return false;
        if (filterPriority !== 'all' && item.prioridad !== filterPriority) return false;
        return true;
    });

    const getPriorityColor = (prioridad) => {
        const colors = {
            'Baja': '#22c55e',
            'Media': '#eab308',
            'Alta': '#f59e0b',
            'Crítica': '#dc2626'
        };
        return colors[prioridad] || '#64748b';
    };

    const getComplexityColor = (complejidad) => {
        const colors = {
            'Baja': '#6366f1',
            'Media': '#0369a1',
            'Alta': '#7c3aed',
            'Muy Alta': '#dc2626'
        };
        return colors[complejidad] || '#64748b';
    };

    if (loading) return <div className="loading">Cargando backlog...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="backlog-container">
            <div className="backlog-header">
                <h2>Backlog Funcional</h2>
                <div className="controls">
                    <select value={filterEpica} onChange={(e) => setFilterEpica(e.target.value)} className="select">
                        <option value="all">Épica: Todas</option>
                        {epicas.map(ep => (
                            <option key={ep} value={ep}>{ep}</option>
                        ))}
                    </select>
                    <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="select">
                        <option value="all">Prioridad: Todas</option>
                        <option value="Baja">Baja</option>
                        <option value="Media">Media</option>
                        <option value="Alta">Alta</option>
                        <option value="Crítica">Crítica</option>
                    </select>
                </div>
            </div>

            <div className="backlog-grid">
                {filteredBacklog.map(item => (
                    <div 
                        key={item.id}
                        className="backlog-card"
                        onClick={() => setSelectedItem(item)}
                    >
                        <div className="card-header">
                            <h3>{item.funcionalidad}</h3>
                            <div className="badges">
                                <span 
                                    className="badge-priority"
                                    style={{background: getPriorityColor(item.prioridad)}}
                                >
                                    {item.prioridad}
                                </span>
                            </div>
                        </div>

                        <p className="epica-label">{item.epica}</p>
                        {item.modulo && <p className="modulo-label">{item.modulo}</p>}

                        <p className="descripcion">{item.descripcion}</p>

                        <div className="card-footer">
                            <span 
                                className="badge-complexity"
                                style={{background: getComplexityColor(item.complejidad)}}
                            >
                                {item.complejidad}
                            </span>
                            <span className={`estado-badge estado-${item.estado.toLowerCase().replace(/\s/g, '-')}`}>
                                {item.estado}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {selectedItem && (
                <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedItem(null)}>✕</button>
                        <h2>{selectedItem.funcionalidad}</h2>

                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Épica</label>
                                <p>{selectedItem.epica}</p>
                            </div>
                            <div className="detail-item">
                                <label>Módulo</label>
                                <p>{selectedItem.modulo || 'N/A'}</p>
                            </div>
                            <div className="detail-item">
                                <label>Prioridad</label>
                                <p>
                                    <span 
                                        className="badge-priority"
                                        style={{background: getPriorityColor(selectedItem.prioridad)}}
                                    >
                                        {selectedItem.prioridad}
                                    </span>
                                </p>
                            </div>
                            <div className="detail-item">
                                <label>Complejidad</label>
                                <p>
                                    <span 
                                        className="badge-complexity"
                                        style={{background: getComplexityColor(selectedItem.complejidad)}}
                                    >
                                        {selectedItem.complejidad}
                                    </span>
                                </p>
                            </div>
                            <div className="detail-item">
                                <label>Estado</label>
                                <p className={`estado-badge estado-${selectedItem.estado.toLowerCase().replace(/\s/g, '-')}`}>
                                    {selectedItem.estado}
                                </p>
                            </div>
                        </div>

                        {selectedItem.descripcion && (
                            <div className="detail-full">
                                <label>Descripción</label>
                                <p>{selectedItem.descripcion}</p>
                            </div>
                        )}

                        {selectedItem.beneficio_esperado && (
                            <div className="detail-full">
                                <label>Beneficio Esperado</label>
                                <p>{selectedItem.beneficio_esperado}</p>
                            </div>
                        )}

                        {selectedItem.dependencias && (
                            <div className="detail-full">
                                <label>Dependencias</label>
                                <p>{selectedItem.dependencias}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
