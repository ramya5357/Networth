import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Toast } from '../types';

// State interface
interface ToastState {
  toasts: Toast[];
}

// Initial state
const initialState: ToastState = {
  toasts: [],
};

// Action types
type ToastAction =
  | { type: 'ADD_TOAST'; payload: Omit<Toast, 'id'> }
  | { type: 'REMOVE_TOAST'; payload: string };

// Context type
interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Reducer function
const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, { ...action.payload, id: uuidv4() }],
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload),
      };
    default:
      return state;
  }
};

// Provider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, initialState);

  // Show a toast
  const showToast = (toast: Omit<Toast, 'id'>) => {
    dispatch({ type: 'ADD_TOAST', payload: toast });
  };

  // Remove a toast
  const removeToast = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  };

  // Auto-remove toasts after 5 seconds
  useEffect(() => {
    const toastTimeouts: NodeJS.Timeout[] = [];
    
    state.toasts.forEach(toast => {
      const timeout = setTimeout(() => {
        removeToast(toast.id);
      }, 5000);
      
      toastTimeouts.push(timeout);
    });
    
    return () => {
      toastTimeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [state.toasts]);

  const value = {
    toasts: state.toasts,
    showToast,
    removeToast,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

// Custom hook for using toast context
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};