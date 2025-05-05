import React from 'react';

interface BadgeProps {
  status: 'up-to-date' | 'overdue' | 'paid' | 'partially-paid' | 'unpaid';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const baseClasses = 'badge';
  
  const statusClasses = {
    'up-to-date': 'badge-success',
    'paid': 'badge-success',
    'partially-paid': 'badge-warning',
    'unpaid': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'overdue': 'badge-danger',
  };
  
  const statusText = {
    'up-to-date': 'Up to date',
    'paid': 'Paid',
    'partially-paid': 'Partially paid',
    'unpaid': 'Unpaid',
    'overdue': 'Overdue',
  };
  
  return (
    <span className={`${baseClasses} ${statusClasses[status]} ${className}`}>
      {statusText[status]}
    </span>
  );
};

export default Badge;