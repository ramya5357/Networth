import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { Customer, Loan, Repayment, CustomerFormData, LoanFormData, RepaymentFormData } from '../types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

// State interface
interface CustomerState {
  customers: Customer[];
  loans: Loan[];
  repayments: Repayment[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: CustomerState = {
  customers: [],
  loans: [],
  repayments: [],
  isLoading: false,
  error: null,
};

// Action types
type CustomerAction =
  | { type: 'FETCH_DATA_START' }
  | { type: 'FETCH_DATA_SUCCESS'; payload: { customers: Customer[]; loans: Loan[]; repayments: Repayment[] } }
  | { type: 'FETCH_DATA_FAILURE'; payload: string }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'ADD_LOAN'; payload: Loan }
  | { type: 'ADD_REPAYMENT'; payload: Repayment };

// Context type
interface CustomerContextType extends CustomerState {
  addCustomer: (data: CustomerFormData) => Promise<Customer>;
  addLoan: (customerId: string, data: LoanFormData) => Promise<Loan>;
  addRepayment: (customerId: string, data: RepaymentFormData) => Promise<Repayment>;
  getCustomerById: (id: string) => Customer | undefined;
  getCustomerLoans: (customerId: string) => Loan[];
  getCustomerRepayments: (customerId: string) => Repayment[];
  getLoanRepayments: (loanId: string) => Repayment[];
  updateLoanStatuses: () => void;
}

// Create context
const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

// Reducer function
const customerReducer = (state: CustomerState, action: CustomerAction): CustomerState => {
  switch (action.type) {
    case 'FETCH_DATA_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_DATA_SUCCESS':
      return {
        ...state,
        isLoading: false,
        customers: action.payload.customers,
        loans: action.payload.loans,
        repayments: action.payload.repayments,
        error: null,
      };
    case 'FETCH_DATA_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'ADD_LOAN':
      return { ...state, loans: [...state.loans, action.payload] };
    case 'ADD_REPAYMENT':
      return { ...state, repayments: [...state.repayments, action.payload] };
    default:
      return state;
  }
};

// Provider component
export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(customerReducer, initialState);
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  // Helper function to save data to localStorage
  const saveDataToStorage = (data: CustomerState) => {
    localStorage.setItem('customerData', JSON.stringify(data));
  };

  // Load data from localStorage on initial load
  useEffect(() => {
    if (isAuthenticated) {
      dispatch({ type: 'FETCH_DATA_START' });
      try {
        const storedData = localStorage.getItem('customerData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          dispatch({
            type: 'FETCH_DATA_SUCCESS',
            payload: {
              customers: parsedData.customers || [],
              loans: parsedData.loans || [],
              repayments: parsedData.repayments || [],
            },
          });
        } else {
          // Initialize with empty data
          dispatch({
            type: 'FETCH_DATA_SUCCESS',
            payload: { customers: [], loans: [], repayments: [] },
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load data';
        dispatch({ type: 'FETCH_DATA_FAILURE', payload: message });
        showToast({ type: 'error', message });
      }
    }
  }, [isAuthenticated, showToast]);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (isAuthenticated) {
      saveDataToStorage(state);
    }
  }, [state, isAuthenticated]);

  // Update loan statuses
  const updateLoanStatuses = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const updatedLoans = state.loans.map(loan => {
      // Calculate remaining amount
      const loanRepayments = state.repayments.filter(r => r.loanId === loan.id);
      const totalRepaid = loanRepayments.reduce((sum, repayment) => sum + repayment.amount, 0);
      const remainingAmount = loan.amount - totalRepaid;
      
      // Determine status
      let status: Loan['status'] = 'unpaid';
      if (remainingAmount <= 0) {
        status = 'paid';
      } else if (remainingAmount < loan.amount) {
        status = 'partially-paid';
      }
      
      // Check if overdue
      if (remainingAmount > 0 && dayjs(loan.dueDate).isBefore(today)) {
        status = 'overdue';
      }
      
      return {
        ...loan,
        status,
        remainingAmount: Math.max(0, remainingAmount),
      };
    });
    
    dispatch({
      type: 'FETCH_DATA_SUCCESS',
      payload: {
        customers: updateCustomerStatuses(updatedLoans),
        loans: updatedLoans,
        repayments: state.repayments,
      },
    });
  };

  // Update customer statuses based on their loans
  const updateCustomerStatuses = (updatedLoans: Loan[]): Customer[] => {
    return state.customers.map(customer => {
      const customerLoans = updatedLoans.filter(loan => loan.customerId === customer.id);
      
      // Check if any loans are overdue
      const hasOverdueLoans = customerLoans.some(loan => loan.status === 'overdue');
      
      // Calculate total outstanding
      const totalOutstanding = customerLoans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
      
      // Find next due date
      const upcomingLoans = customerLoans
        .filter(loan => loan.remainingAmount > 0)
        .sort((a, b) => dayjs(a.dueDate).diff(dayjs(b.dueDate)));
      
      const nextDueDate = upcomingLoans.length > 0 ? upcomingLoans[0].dueDate : null;
      
      return {
        ...customer,
        totalOutstanding,
        nextDueDate,
        status: hasOverdueLoans ? 'overdue' : 'up-to-date',
      };
    });
  };

  // Add a new customer
  const addCustomer = async (data: CustomerFormData): Promise<Customer> => {
    try {
      const newCustomer: Customer = {
        id: uuidv4(),
        name: data.name,
        phone: data.phone,
        address: data.address,
        createdAt: dayjs().format('YYYY-MM-DD'),
        totalOutstanding: 0,
        nextDueDate: null,
        status: 'up-to-date',
      };
      
      dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
      showToast({ type: 'success', message: 'Customer added successfully!' });
      return newCustomer;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add customer';
      showToast({ type: 'error', message });
      throw new Error(message);
    }
  };

  // Add a new loan
  const addLoan = async (customerId: string, data: LoanFormData): Promise<Loan> => {
    try {
      const newLoan: Loan = {
        id: uuidv4(),
        customerId,
        description: data.description,
        amount: data.amount,
        dueDate: data.dueDate,
        createdAt: dayjs().format('YYYY-MM-DD'),
        status: 'unpaid',
        remainingAmount: data.amount,
      };
      
      dispatch({ type: 'ADD_LOAN', payload: newLoan });
      
      // Update loan statuses to reflect the new loan
      setTimeout(() => updateLoanStatuses(), 0);
      
      showToast({ type: 'success', message: 'Loan added successfully!' });
      return newLoan;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add loan';
      showToast({ type: 'error', message });
      throw new Error(message);
    }
  };

  // Add a new repayment
  const addRepayment = async (customerId: string, data: RepaymentFormData): Promise<Repayment> => {
    try {
      const newRepayment: Repayment = {
        id: uuidv4(),
        loanId: data.loanId,
        customerId,
        amount: data.amount,
        date: dayjs().format('YYYY-MM-DD'),
        notes: data.notes || '',
      };
      
      dispatch({ type: 'ADD_REPAYMENT', payload: newRepayment });
      
      // Update loan statuses to reflect the new repayment
      setTimeout(() => updateLoanStatuses(), 0);
      
      showToast({ type: 'success', message: 'Repayment recorded successfully!' });
      return newRepayment;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to record repayment';
      showToast({ type: 'error', message });
      throw new Error(message);
    }
  };

  // Get customer by ID
  const getCustomerById = (id: string): Customer | undefined => {
    return state.customers.find(customer => customer.id === id);
  };

  // Get loans for a specific customer
  const getCustomerLoans = (customerId: string): Loan[] => {
    return state.loans.filter(loan => loan.customerId === customerId);
  };

  // Get repayments for a specific customer
  const getCustomerRepayments = (customerId: string): Repayment[] => {
    return state.repayments.filter(repayment => repayment.customerId === customerId);
  };

  // Get repayments for a specific loan
  const getLoanRepayments = (loanId: string): Repayment[] => {
    return state.repayments.filter(repayment => repayment.loanId === loanId);
  };

  // Update loan statuses on component mount
  useEffect(() => {
    if (state.customers.length > 0 || state.loans.length > 0) {
      updateLoanStatuses();
    }
  }, [state.customers.length, state.loans.length]);

  const value = {
    ...state,
    addCustomer,
    addLoan,
    addRepayment,
    getCustomerById,
    getCustomerLoans,
    getCustomerRepayments,
    getLoanRepayments,
    updateLoanStatuses,
  };

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
};

// Custom hook for using customer context
export const useCustomer = (): CustomerContextType => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};