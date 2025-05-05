import React, { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, DollarSign, FileText } from 'lucide-react';
import { useCustomer } from '../contexts/CustomerContext';
import { RepaymentFormData } from '../types';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

const RecordRepayment: React.FC = () => {
  const { id: customerId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { getCustomerById, getCustomerLoans, addRepayment } = useCustomer();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Get the customer details
  const customer = getCustomerById(customerId || '');
  
  // Redirect if customer not found
  if (!customer) {
    navigate('/404');
    return null;
  }
  
  // Get all unpaid or partially paid loans for this customer
  const customerLoans = getCustomerLoans(customer.id).filter(
    loan => loan.status !== 'paid'
  );
  
  // Get the loan ID from the URL query parameter if it exists
  const queryParams = new URLSearchParams(location.search);
  const loanIdFromQuery = queryParams.get('loanId');
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RepaymentFormData>({
    defaultValues: {
      loanId: loanIdFromQuery || '',
      amount: 0,
      notes: '',
    },
  });
  
  // Set the loan ID if it's provided in the query
  useEffect(() => {
    if (loanIdFromQuery) {
      setValue('loanId', loanIdFromQuery);
    }
  }, [loanIdFromQuery, setValue]);
  
  // Watch the selected loan to display remaining amount
  const selectedLoanId = watch('loanId');
  const selectedLoan = customerLoans.find(loan => loan.id === selectedLoanId);
  
  const onSubmit = async (data: RepaymentFormData) => {
    try {
      setIsSubmitting(true);
      
      // Check if amount is greater than the remaining amount
      if (selectedLoan && data.amount > selectedLoan.remainingAmount) {
        data.amount = selectedLoan.remainingAmount;
      }
      
      await addRepayment(customer.id, data);
      navigate(`/customers/${customer.id}`);
    } catch (error) {
      console.error('Error recording repayment:', error);
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
        <h1 className="text-2xl font-bold">Record Repayment</h1>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Customer: <span className="text-primary-600">{customer.name}</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{customer.phone}</p>
        </div>
        
        {customerLoans.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">No outstanding loans</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This customer has no unpaid or partially paid loans.
            </p>
            <Button
              variant="secondary"
              onClick={() => navigate(`/customers/${customer.id}`)}
            >
              Back to Customer
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Select
              id="loanId"
              label="Select Loan"
              options={customerLoans.map(loan => ({
                value: loan.id,
                label: `${loan.description} - ₹${loan.remainingAmount.toFixed(2)} remaining`,
              }))}
              error={errors.loanId?.message}
              {...register('loanId', {
                required: 'Please select a loan',
              })}
            />
            
            {selectedLoan && (
              <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                <p className="text-sm font-medium">
                  Selected Loan: {selectedLoan.description}
                </p>
                <p className="text-sm">
                  Remaining amount: ₹{selectedLoan.remainingAmount.toFixed(2)}
                </p>
              </div>
            )}
            
            <Input
              id="amount"
              type="number"
              label="Repayment Amount (₹)"
              leftIcon={<DollarSign size={18} />}
              placeholder="Enter amount"
              error={errors.amount?.message}
              {...register('amount', {
                required: 'Amount is required',
                min: {
                  value: 1,
                  message: 'Amount must be greater than 0',
                },
                max: {
                  value: selectedLoan ? selectedLoan.remainingAmount : Infinity,
                  message: `Amount cannot exceed the remaining amount`,
                },
                valueAsNumber: true,
              })}
            />
            
            <Input
              id="notes"
              label="Notes (Optional)"
              leftIcon={<FileText size={18} />}
              placeholder="Any additional notes"
              {...register('notes')}
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
                Record Repayment
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default RecordRepayment;