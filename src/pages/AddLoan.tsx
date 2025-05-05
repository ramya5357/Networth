import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, FileText, Calendar, DollarSign } from 'lucide-react';
import { useCustomer } from '../contexts/CustomerContext';
import { LoanFormData } from '../types';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const AddLoan: React.FC = () => {
  const { id: customerId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomerById, addLoan } = useCustomer();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Get customer details
  const customer = getCustomerById(customerId || '');
  
  // Redirect if customer not found
  if (!customer) {
    navigate('/404');
    return null;
  }
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoanFormData>({
    defaultValues: {
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    },
  });
  
  const onSubmit = async (data: LoanFormData) => {
    try {
      setIsSubmitting(true);
      await addLoan(customer.id, data);
      navigate(`/customers/${customer.id}`);
    } catch (error) {
      console.error('Error adding loan:', error);
      setIsSubmitting(false);
    }
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
        <h1 className="text-2xl font-bold">Add New Loan</h1>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Customer: <span className="text-primary-600">{customer.name}</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{customer.phone}</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            id="description"
            label="Loan Description"
            leftIcon={<FileText size={18} />}
            placeholder="e.g., Monthly groceries, Electronics, etc."
            error={errors.description?.message}
            {...register('description', {
              required: 'Description is required',
              minLength: {
                value: 3,
                message: 'Description must be at least 3 characters',
              },
            })}
          />
          
          <Input
            id="amount"
            type="number"
            label="Loan Amount (₹)"
            leftIcon={<DollarSign size={18} />}
            placeholder="Enter loan amount"
            error={errors.amount?.message}
            {...register('amount', {
              required: 'Amount is required',
              min: {
                value: 1,
                message: 'Amount must be greater than 0',
              },
              valueAsNumber: true,
            })}
          />
          
          <Input
            id="dueDate"
            type="date"
            label="Due Date"
            leftIcon={<Calendar size={18} />}
            error={errors.dueDate?.message}
            {...register('dueDate', {
              required: 'Due date is required',
            })}
          />
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Add Loan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddLoan;