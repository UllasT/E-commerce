import { useState, useEffect } from 'react';

export function useToast() {
  const [message, setMessage] = useState('');
  const show = (msg: string) => { setMessage(msg); };

  const Toast = message ? (
    <div className="toast" key={message}>{message}</div>
  ) : null;

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return { show, Toast };
}
