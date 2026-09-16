import { useState, useEffect, useRef } from 'react';

export default function ErrorConsole() {
  const [logs, setLogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const logEndRef = useRef(null);

  useEffect(() => {
    // 1. Keep original console.error to avoid breaking browser logging
    const originalConsoleError = console.error;

    const addLog = (message, stack = null) => {
      setLogs((prevLogs) => [
        ...prevLogs,
        {
          id: Date.now() + Math.random(),
          time: new Date().toLocaleTimeString(),
          message: typeof message === 'object' ? JSON.stringify(message, null, 2) : String(message),
          stack,
        },
      ]);
    };

    // Intercept console.error
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      const formatted = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(' ');
      addLog(formatted);
    };

    // 2. Capture uncaught window runtime errors
    const handleWindowError = (event) => {
      addLog(event.message, event.error?.stack);
    };

    // 3. Capture unhandled Promise rejections
    const handleUnhandledRejection = (event) => {
      const reason = event.reason;
      addLog(
        `Unhandled Rejection: ${reason?.message || reason}`,
        reason?.stack
      );
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup when component unmounts
    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Auto-scroll to bottom on new log
  useEffect(() => {
    if (isOpen && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  return (
    <div style={styles.container}>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...styles.toggleButton,
          backgroundColor: logs.length > 0 ? '#e53e3e' : '#4a5568',
        }}
      >
        Console Errors ({logs.length})
      </button>

      {/* Drawer Window */}
      {isOpen && (
        <div style={styles.drawer}>
          <div style={styles.header}>
            <span style={{ fontWeight: 'bold' }}>Error Log ({logs.length})</span>
            <div>
              <button onClick={() => setLogs([])} style={styles.actionBtn}>
                Clear
              </button>
              <button onClick={() => setIsOpen(false)} style={styles.actionBtn}>
                ✕
              </button>
            </div>
          </div>

          <div style={styles.logList}>
            {logs.length === 0 ? (
              <div style={styles.empty}>No errors recorded yet.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} style={styles.logItem}>
                  <span style={styles.timestamp}>[{log.time}]</span>
                  <pre style={styles.logText}>{log.message}</pre>
                  {log.stack && <pre style={styles.stack}>{log.stack}</pre>}
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}

// Inline styles so no extra CSS setup is required
const styles = {
  container: {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    zIndex: 99999,
    fontFamily: 'monospace',
  },
  toggleButton: {
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 14px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
  },
  drawer: {
    position: 'fixed',
    bottom: '56px',
    right: '16px',
    width: '480px',
    maxWidth: '90vw',
    height: '320px',
    backgroundColor: '#1a202c',
    color: '#edf2f7',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid #2d3748',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#2d3748',
    borderBottom: '1px solid #4a5568',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: '#cbd5e0',
    cursor: 'pointer',
    marginLeft: '8px',
    fontSize: '12px',
  },
  logList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  empty: {
    color: '#718096',
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '40px',
  },
  logItem: {
    backgroundColor: '#2d1515',
    borderLeft: '3px solid #e53e3e',
    padding: '6px 8px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  timestamp: {
    color: '#a0aec0',
    fontSize: '10px',
    marginRight: '6px',
  },
  logText: {
    margin: '4px 0 0 0',
    color: '#fc8181',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  stack: {
    margin: '4px 0 0 0',
    color: '#718096',
    fontSize: '10px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
};