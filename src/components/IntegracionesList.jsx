import React, { useState } from 'react';
import { useAPI } from '../hooks/useAPI';
import './IntegracionesList.css';

export default function IntegracionesList() {
    const [selectedIntegration, setSelectedIntegration] = useState(null);
    const { data: integraciones, loading, error } = useAPI('integraciones');

    const getCriticalityColor = (criticidad) => {
        const colors = {
            'Baja': '#22c55e',
            'Media': '#eab308',
            'Alta': '#f59e0b',
            'Crítica': '#dc2626'
        };
        return colors[criticidad] || '#64748b';
    };

    if (loading) return <div className="loading">Cargando integraciones...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="integraciones-container">
            <div className="integraciones-header">
                <h2>Mapa de Integraciones</h2>
                <div className="legend">
                    <div className="legend-item">
                        <div className="legend-box" style={{background: '#22c55e'}}></div>
                        <span>Baja</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-box" style={{background: '#eab308'}}></div>
                        <span>Media</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-box" style={{background: '#f59e0b'}}></div>
                        <span>Alta</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-box" style={{background: '#dc2626'}}></div>
                        <span>Crítica</span>
                    </div>
                </div>
            </div>

            <div className="integraciones-table-wrapper">
                <table className="integraciones-table">
                    <thead>
                        <tr>
                            <th>Origen</th>
                            <th>Destino</th>
                            <th>Dato/Evento</th>
                            <th>Existe</th>
                            <th>Tipo Actual</th>
                            <th>Tipo Propuesto</th>
                            <th>Frecuencia</th>
                            <th>Criticidad</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {integraciones.map(integ => (
                            <tr 
                                key={integ.id}
                                className="integracion-row"
                                onClick={() => setSelectedIntegration(integ)}
                            >
                                <td className="origen">{integ.sistema_origen}</td>
                                <td className="destino">{integ.sistema_destino}</td>
                                <td className="dato">{integ.dato_evento}</td>
                                <td className="existe">{integ.existe_integracion}</td>
                                <td className="tipo">{integ.tipo_actual || '-'}</td>
                                <td className="tipo-propuesto">{integ.tipo_propuesto}</td>
                                <td className="frecuencia">{integ.frecuencia || '-'}</td>
                                <td className="criticidad">
                                    <span 
                                        className="badge-criticidad"
                                        style={{background: getCriticalityColor(integ.criticidad)}}
                                    >
                                        {integ.criticidad}
                                    </span>
                                </td>
                                <td className="estado">
                                    <span className={`badge-estado estado-${integ.estado.toLowerCase().replace(/\s/g, '-')}`}>
                                        {integ.estado}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedIntegration && (
                <div className="modal-overlay" onClick={() => setSelectedIntegration(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedIntegration(null)}>✕</button>
                        <h2>{selectedIntegration.sistema_origen} → {selectedIntegration.sistema_destino}</h2>

                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Dato/Evento</label>
                                <p>{selectedIntegration.dato_evento}</p>
                            </div>
                            <div className="detail-item">
                                <label>Existe Integración</label>
                                <p>{selectedIntegration.existe_integracion}</p>
                            </div>
                            <div className="detail-item">
                                <label>Tipo Actual</label>
                                <p>{selectedIntegration.tipo_actual || 'No especificado'}</p>
                            </div>
                            <div className="detail-item">
                                <label>Tipo Propuesto</label>
                                <p>{selectedIntegration.tipo_propuesto}</p>
                            </div>
                            <div className="detail-item">
                                <label>Frecuencia</label>
                                <p>{selectedIntegration.frecuencia || 'No especificada'}</p>
                            </div>
                            <div className="detail-item">
                                <label>Criticidad</label>
                                <p>
                                    <span 
                                        className="badge-criticidad"
                                        style={{background: getCriticalityColor(selectedIntegration.criticidad)}}
                                    >
                                        {selectedIntegration.criticidad}
                                    </span>
                                </p>
                            </div>
                            <div className="detail-item">
                                <label>Estado</label>
                                <p className={`estado-${selectedIntegration.estado.toLowerCase().replace(/\s/g, '-')}`}>
                                    {selectedIntegration.estado}
                                </p>
                            </div>
                        </div>

                        {selectedIntegration.observaciones && (
                            <div className="detail-full">
                                <label>Observaciones</label>
                                <p>{selectedIntegration.observaciones}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
