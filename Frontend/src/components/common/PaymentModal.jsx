// Frontend/src/components/common/PaymentModal.jsx

import React, { useState } from 'react';
import { CreditCard, Lock, DollarSign } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';

const PaymentModal = ({ isOpen, onClose, onPayment, amount, description, loading }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleSubmit = (e) => {
    e.preventDefault();
    onPayment();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Payment"
    >
      <div className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-primary-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-secondary-600">Description</span>
            <span className="font-medium text-secondary-900">{description}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-secondary-600">Amount</span>
            <div className="flex items-center gap-1">
              <DollarSign size={20} className="text-primary-600" />
              <span className="text-2xl font-bold text-primary-600">{amount}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
              >
                <CreditCard size={24} />
                <span className="text-sm font-medium">Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  paymentMethod === 'upi'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
              >
                <DollarSign size={24} />
                <span className="text-sm font-medium">UPI</span>
              </button>
            </div>
          </div>

          {/* Card Details (Razorpay will handle this) */}
          <div className="flex items-center gap-2 text-sm text-secondary-500">
            <Lock size={16} />
            <span>Secure payment powered by Razorpay</span>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={<CreditCard size={18} />}
            >
              Pay ${amount}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PaymentModal;