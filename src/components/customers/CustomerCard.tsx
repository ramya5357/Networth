import React from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { FileText, ChevronRight } from 'lucide-react';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

interface CustomerCardProps {
  id: string;
  name: string;
  phone: string;
  totalOutstanding: number;
  nextDueDate: string | null;
  status: 'up-to-date' | 'overdue';
}

const CustomerCard: React.FC<CustomerCardProps> = ({
  id,
  name,
  phone,
  totalOutstanding,
  nextDueDate,
  status,
}) => {
  const navigate = useNavigate();
  
  // Format due date
  const formattedDueDate = nextDueDate 
    ? dayjs(nextDueDate).format('MMM D, YYYY')
    : 'No upcoming dues';

  // Handle card click
  const handleCardClick = () => {
    navigate(`/customers/${id}`);
  };
  
  // Calculate days until due
  const getDaysUntilDue = () => {
    if (!nextDueDate) return null;
    
    const today = dayjs();
    const dueDate = dayjs(nextDueDate);
    const days = dueDate.diff(today, 'day');
    
    if (days < 0) {
      return `${Math.abs(days)} days overdue`;
    } else if (days === 0) {
      return 'Due today';
    } else if (days === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${days} days`;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCardClick}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{phone}</p>
        </div>
        <Badge status={status} />
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding</p>
          <p className={`text-xl font-bold ${status === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            ₹{totalOutstanding.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Next Due</p>
          <p className="text-base font-medium">{formattedDueDate}</p>
          {nextDueDate && (
            <p className={`text-sm ${status === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {getDaysUntilDue()}
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium">
          <span className="mr-1">View Details</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </Card>
  );
};

export default CustomerCard;