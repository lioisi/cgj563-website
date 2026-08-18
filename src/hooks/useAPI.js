import { useState, useEffect } from 'react';

const API_BASE_URL = 'https://cgj563.com/api.php';
const AMEPORT_API_BASE_URL = '/ameport_api.php';

function getAdminToken() {
  return localStorage.getItem('dashboardToken') || '';
}

function parseApiJson(rawText) {
  const cleanText = rawText.trim();

  if (!cleanText) {
    throw new Error('La API devolvio una respuesta vacia.');
  }

  try {
    return JSON.parse(cleanText);
  } catch {
    // Algunas respuestas de PHP incluyen warnings/HTML al inicio o final.
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonSlice = cleanText.slice(firstBrace, lastBrace + 1);
      return JSON.parse(jsonSlice);
    }

    throw new Error('La API devolvio JSON invalido.');
  }
}

// Hook para consumir APIs
export function useAPI(action, id = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = `${API_BASE_URL}?action=${action}`;
        if (id) url += `&id=${id}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('API Error');

        const rawText = await response.text();
        const result = parseApiJson(rawText);
        setData(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [action, id]);

  return { data, loading, error };
}

// Función genérica para POST/PUT/DELETE
export async function callAPI(action, method, id = null, payload = null) {
  let url = `${API_BASE_URL}?action=${action}`;
  if (id) url += `&id=${id}`;

  const adminToken = getAdminToken();
  if (!adminToken) {
    throw new Error('Sesion expirada. Inicia sesion nuevamente.');
  }

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': adminToken
    }
  };

  if (payload) options.body = JSON.stringify(payload);

  const response = await fetch(url, options);
  const rawText = await response.text();
  const result = parseApiJson(rawText);

  if (!response.ok) throw new Error(result.error || 'API Error');

  return result;
}

export function useAmeportAPI(action, query = '') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const response = await fetch(`${AMEPORT_API_BASE_URL}?action=${action}${query ? `&${query}` : ''}`);
        const rawText = await response.text();
        const result = parseApiJson(rawText);
        if (!response.ok) throw new Error(result.error || 'AMEPORT API Error');
        if (!cancelled) setData(result.data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [action, query]);

  return { data, loading, error };
}

export async function callAmeportAPI(action, method, id = null, payload = null) {
  const token = getAdminToken();
  if (!token) throw new Error('Sesion expirada. Inicia sesion nuevamente.');
  const url = `${AMEPORT_API_BASE_URL}?action=${action}${id ? `&id=${id}` : ''}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token }
  };
  if (payload) options.body = JSON.stringify(payload);
  const response = await fetch(url, options);
  const rawText = await response.text();
  const result = parseApiJson(rawText);
  if (!response.ok) throw new Error(result.error || 'AMEPORT API Error');
  return result;
}
