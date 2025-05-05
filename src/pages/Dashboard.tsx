import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCustomer } from '../contexts/CustomerContext';
import CustomerCard from '../components/customers/CustomerCard';
import { UserPlus, Search, ArrowDownUp, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';

const Dashboard: React.FC = () => {
  const { customers, updateLoanStatuses } = useCustomer();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'name' | 'amount' | 'dueDate'>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Update loan statuses on component mount
  useEffect(() => {
    updateLoanStatuses();
  }, [updateLoanStatuses]);

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  // Sort customers based on selected option
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortOption === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    
    if (sortOption === 'amount') {
      return sortDirection === 'asc'
        ? a.totalOutstanding - b.totalOutstanding
        : b.totalOutstanding - a.totalOutstanding;
    }
    
    // Sort by due date
    const dateA = a.nextDueDate ? new Date(a.nextDueDate).getTime() : Infinity;
    const dateB = b.nextDueDate ? new Date(b.nextDueDate).getTime() : Infinity;
    
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // Toggle sort direction
  const toggleSort = (option: 'name' | 'amount' | 'dueDate') => {
    if (sortOption === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOption(option);
      setSortDirection('asc');
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Get the count of overdue customers
  const overdueCount = customers.filter(c => c.status === 'overdue').length;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your customers and track credit
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/customers/add">
            <Button variant="primary" leftIcon={<UserPlus size={18} />}>
              Add Customer
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Customers</p>
          <p className="text-2xl font-bold">{customers.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Outstanding</p>
          <p className="text-2xl font-bold">
            ₹{customers.reduce((sum, c) => sum + c.totalOutstanding, 0).toFixed(2)}
          </p>
        </div>
        <div className={`rounded-lg shadow-md p-4 ${
          overdueCount > 0 
            ? 'bg-red-50 dark:bg-red-900/20' 
            : 'bg-white dark:bg-gray-800'
        }`}>
          <div className="flex items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Overdue Accounts</p>
            {overdueCount > 0 && <AlertTriangle size={16} className="ml-2 text-red-500" />}
          </div>
          <p className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
            {overdueCount}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Up-to-date</p>
          <p className="text-2xl font-bold">{customers.filter(c => c.status === 'up-to-date').length}</p>
        </div>
      </div>

      {/* Search and sort */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search customers by name or phone..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="form-input pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              variant={sortOption === 'name' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => toggleSort('name')}
              rightIcon={sortOption === 'name' && <ArrowDownUp size={16} />}
            >
              Name
            </Button>
            <Button
              variant={sortOption === 'amount' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => toggleSort('amount')}
              rightIcon={sortOption === 'amount' && <ArrowDownUp size={16} />}
            >
              Amount
            </Button>
            <Button
              variant={sortOption === 'dueDate' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => toggleSort('dueDate')}
              rightIcon={sortOption === 'dueDate' && <ArrowDownUp size={16} />}
            >
              Due Date
            </Button>
          </div>
        </div>
      </div>

      {/* Customer list */}
      {customers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No customers yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start by adding your first customer to track their credit
          </p>
          <Link to="/customers/add">
            <Button variant="primary" leftIcon={<UserPlus size={18} />}>
              Add Customer
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {filteredCustomers.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedCustomers.map(customer => (
                <CustomerCard
                  key={customer.id}
                  id={customer.id}
                  name={customer.name}
                  phone={customer.phone}
                  totalOutstanding={customer.totalOutstanding}
                  nextDueDate={customer.nextDueDate}
                  status={customer.status}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;