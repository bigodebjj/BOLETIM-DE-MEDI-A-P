import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`toast ${type} show`}>
      {message}
      <style>{`
        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 14px 24px;
          border-radius: 10px;
          color: white;
          font-weight: 500;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          z-index: 300;
          transform: translateY(0);
          opacity: 1;
          transition: all 0.3s;
        }
        .toast.success { background: #28a745; }
        .toast.error { background: #dc3545; }
        .toast.info { background: #1F4E79; }
      `}</style>
    </div>
  )
}

export default Toast
