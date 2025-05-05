import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, User, Phone, MapPin } from 'lucide-react';
import { useCustomer } from '../contexts/CustomerContext';
import { CustomerFormData } from '../types';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const AddCustomer: React.FC = () => {
  const navigate = useNavigate();
  const { addCustomer } = useCustomer();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>();
  
  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true);
      const newCustomer = await addCustomer(data);
      navigate(`/customers/${newCustomer.id}`);
    } catch (error) {
      console.error('Error adding customer:', error);
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
        <h1 className="text-2xl font-bold">Add New Customer</h1>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            id="name"
            label="Customer Name"
            leftIcon={<User size={18} />}
            placeholder="Enter customer's full name"
            error={errors.name?.message}
            {...register('name', {
              required: 'Customer name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
          />
          
          <Input
            id="phone"
            label="Phone Number"
            leftIcon={<Phone size={18} />}
            placeholder="Enter customer's phone number"
            error={errors.phone?.message}
            {...register('phone', {
              required: 'Phone number is required',
              pattern: {
                value: /^\+?[0-9]{10,15}$/,
                message: 'Please enter a valid phone number',
              },
            })}
          />
          
          <Input
            id="address"
            label="Address"
            leftIcon={<MapPin size={18} />}
            placeholder="Enter customer's address"
            error={errors.address?.message}
            {...register('address', {
              required: 'Address is required',
              minLength: {
                value: 5,
                message: 'Address must be at least 5 characters',
              },
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
              Add Customer
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddCustomer;