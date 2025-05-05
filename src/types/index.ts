// User-related types
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Customer-related types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
  totalOutstanding: number;
  nextDueDate: string | null;
  status: 'up-to-date' | 'overdue';
}

// Loan-related types
export interface Loan {
  id: string;
  customerId: string;
  description: string;
  amount: number;
  dueDate: string;
  createdAt: string;
  status: 'paid' | 'partially-paid' | 'unpaid' | 'overdue';
  remainingAmount: number;
}

// Repayment-related types
export interface Repayment {
  id: string;
  loanId: string;
  customerId: string;
  amount: number;
  date: string;
  notes: string;
}

// Toast notification types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

// Form types
export interface CustomerFormData {
  name: string;
  phone: string;
  address: string;
}

export interface LoanFormData {
  description: string;
  amount: number;
  dueDate: string;
}

export interface RepaymentFormData {
  amount: number;
  loanId: string;
  notes: string;
}