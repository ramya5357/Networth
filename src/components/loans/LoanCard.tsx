import React from 'react';
import dayjs from 'dayjs';
import { ArrowUpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface LoanCardProps {
  id: string;
  customerId: string;
  description: string;
  amount: number;
  dueDate: string;
  createdAt: string;
  status: 'paid' | 'partially-paid' | 'unpaid' | 'overdue';
  remainingAmount: number;
}

const LoanCard: React.FC<LoanCardProps> = ({
  id,
  customerId,
  description,
  amount,
  dueDate,
  createdAt,
  status,
  remainingAmount,
}) => {
  const navigate = useNavigate();
  
  // Format dates
  const formattedDueDate = dayjs(dueDate).format('MMM D, YYYY');
  const formattedCreatedDate = dayjs(createdAt).format('MMM D, YYYY');
  
  // Calculate percentage paid
  const percentagePaid = Math.max(0, Math.min(100, ((amount - remainingAmount) / amount) * 100));
  
  // Handle repayment button click
  const handleAddRepayment = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/customers/${customerId}/repayments/add?loanId=${id}`);
  };

  return (
    <Card className="h-full">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{description}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Created on {formattedCreatedDate}</p>
        </div>
        <Badge status={status} />
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">Repayment Progress</span>
          <span className="text-sm font-medium">{percentagePaid.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              status === 'paid' ? 'bg-green-500' : 
              status === 'partially-paid' ? 'bg-yellow-500' :
              status === 'overdue' ? 'bg-red-500' : 'bg-blue-500'
            }`} 
            style={{ width: `${percentagePaid}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">₹{amount.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
          <p className={`text-xl font-bold ${status === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            ₹{remainingAmount.toFixed(2)}
          </p>
        </div>
      </div>
      
      <div className="mt-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
        <p className={`text-base font-medium ${status === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
          {formattedDueDate}
        </p>
      </div>
      
      {(status === 'unpaid' || status === 'partially-paid' || status === 'overdue') && (
        <div className="mt-4">
          <Button
            variant="primary"
            size="sm"
            fullWidth
            leftIcon={<ArrowUpCircle size={16} />}
            onClick={handleAddRepayment}
          >
            Record Repayment
          </Button>
        </div>
      )}
    </Card>
  );
};

export default LoanCard;