import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCustomer } from '../contexts/CustomerContext';
import { ArrowLeft, PlusCircle, Download, Phone } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoanCard from '../components/loans/LoanCard';
import { exportCustomerStatement } from '../utils/pdfExport';
import dayjs from 'dayjs';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomerById, getCustomerLoans, getCustomerRepayments } = useCustomer();
  
  const [activeTab, setActiveTab] = useState<'loans' | 'repayments'>('loans');
  
  // Get customer details
  const customer = getCustomerById(id || '');
  
  // Redirect if customer not found
  if (!customer) {
    navigate('/404');
    return null;
  }
  
  // Get loans and repayments
  const loans = getCustomerLoans(customer.id);
  const repayments = getCustomerRepayments(customer.id);
  
  // Export customer statement to PDF
  const handleExportStatement = () => {
    exportCustomerStatement(customer, loans, repayments);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM D, YYYY');
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Customer Details</h1>
      </div>
      
      {/* Customer info card */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{customer.name}</h2>
            <div className="flex items-center mt-1">
              <Phone size={16} className="text-gray-500 mr-1" />
              <span className="text-gray-600 dark:text-gray-400">{customer.phone}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{customer.address}</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
            <div className="flex items-center mb-2">
              <span className="text-gray-600 dark:text-gray-400 mr-2">Status:</span>
              <Badge status={customer.status} />
            </div>
            <div className="mb-2">
              <span className="text-gray-600 dark:text-gray-400">Total Outstanding:</span>
              <span className={`ml-2 text-lg font-bold ${
                customer.status === 'overdue' ? 'text-red-600 dark:text-red-400' : ''
              }`}>
                ₹{customer.totalOutstanding.toFixed(2)}
              </span>
            </div>
            {customer.nextDueDate && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Next Due Date:</span>
                <span className={`ml-2 ${
                  customer.status === 'overdue' ? 'text-red-600 dark:text-red-400' : ''
                }`}>
                  {formatDate(customer.nextDueDate)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <Link to={`/customers/${customer.id}/loans/add`}>
            <Button variant="primary" leftIcon={<PlusCircle size={18} />}>
              Add Loan
            </Button>
          </Link>
          <Button 
            variant="secondary" 
            leftIcon={<Download size={18} />}
            onClick={handleExportStatement}
          >
            Export Statement
          </Button>
        </div>
      </Card>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('loans')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'loans'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Loans ({loans.length})
          </button>
          <button
            onClick={() => setActiveTab('repayments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'repayments'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Repayments ({repayments.length})
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      {activeTab === 'loans' && (
        <>
          {loans.length === 0 ? (
            <Card className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No loans yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start tracking credit by adding a loan for this customer
              </p>
              <Link to={`/customers/${customer.id}/loans/add`}>
                <Button variant="primary" leftIcon={<PlusCircle size={18} />}>
                  Add First Loan
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loans.map(loan => (
                <LoanCard key={loan.id} {...loan} />
              ))}
            </div>
          )}
        </>
      )}
      
      {activeTab === 'repayments' && (
        <>
          {repayments.length === 0 ? (
            <Card className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No repayments yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Record repayments for this customer's loans
              </p>
              {loans.length > 0 && (
                <Link to={`/customers/${customer.id}/repayments/add`}>
                  <Button variant="primary" leftIcon={<PlusCircle size={18} />}>
                    Record Repayment
                  </Button>
                </Link>
              )}
            </Card>
          ) : (
            <Card>
              <h3 className="text-lg font-semibold mb-4">Repayment History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Loan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {repayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(repayment => {
                      const loan = loans.find(l => l.id === repayment.loanId);
                      return (
                        <tr key={repayment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatDate(repayment.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {loan ? loan.description : 'Unknown loan'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            ₹{repayment.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {repayment.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerDetail;