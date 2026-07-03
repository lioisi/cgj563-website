import React, { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje('');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: '888f9532-5f3b-4e0c-ba08-d5281e9b0b5b',
          name: formData.nombre,
          email: formData.email,
          message: formData.mensaje,
              subject: 'Nuevo contacto desde CGJ563.com'
        })
      });

      if (response.ok) {
        setMensaje('✓ Mensaje enviado exitosamente. Nos contactaremos pronto.');
        setFormData({ nombre: '', email: '', mensaje: '' });
      } else {
        setMensaje('Error al enviar. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('Error al enviar. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section id="contacto" className="contact">
      <div className="container">
        <h2>Contáctanos</h2>
        <div className="contact-wrapper">
          <div className="contact-info">
            <div className="info-item">
              <h4>Email</h4>
              <p>info@cgj563.com</p>
            </div>
            <div className="info-item">
              <h4>Teléfono</h4>
              <p>+54 11 3615 4077</p>
            </div>
            <div className="info-item">
              <h4>Dirección</h4>
              <p>Buenos Aires, Argentina</p>
            </div>
          </div>
          
          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="nombre"
              placeholder="Tu nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              disabled={enviando}
            />
            <input
              type="email"
              name="email"
              placeholder="Tu email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={enviando}
            />
            <textarea
              name="mensaje"
              placeholder="Tu mensaje"
              rows="5"
              value={formData.mensaje}
              onChange={handleChange}
              required
              disabled={enviando}
            ></textarea>
            <button type="submit" className="submit-button" disabled={enviando}>
              {enviando ? 'Enviando...' : 'Enviar'}
            </button>
            {mensaje && <p className="form-message">{mensaje}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
