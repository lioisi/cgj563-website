import { useState, useEffect } from 'react';

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
        let url = `https://cgj563.com/api.php?action=${action}`;
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
  try {
    let url = `https://cgj563.com/api.php?action=${action}`;
    if (id) url += `&id=${id}`;

    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (payload) options.body = JSON.stringify(payload);

    const response = await fetch(url, options);
    const rawText = await response.text();
    const result = parseApiJson(rawText);

    if (!response.ok) throw new Error(result.error || 'API Error');

    return result;
  } catch (err) {
    throw err;
  }
}
