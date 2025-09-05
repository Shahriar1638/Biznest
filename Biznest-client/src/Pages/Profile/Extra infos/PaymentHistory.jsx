import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../../Hooks/useAuth';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const PaymentHistory = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch payment history
  const { data: paymentHistory = [], isLoading, error, refetch } = useQuery({
    queryKey: ['paymentHistory', user?.email],
    queryFn: async () => {
      const response = await axiosSecure.get(`/user/paymenthistory/${user?.email}`);
      return response.data.payments || [];
    },
    enabled: !!user?.email,
  });

  const handleViewMore = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPayment(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading payment history: {error.message}</p>
        <button 
          className="btn btn-primary mt-4" 
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Payment History</h2>
      
      {paymentHistory.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No payment history found</p>
          <p className="text-gray-400">Your completed orders will appear here</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left font-semibold text-gray-700">Order ID</th>
                  <th className="text-left font-semibold text-gray-700">Date</th>
                  <th className="text-left font-semibold text-gray-700">Amount</th>
                  <th className="text-left font-semibold text-gray-700">Status</th>
                  <th className="text-center font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, index) => (
                  <tr key={payment._id || index} className="hover:bg-gray-50">
                    <td className="font-medium text-gray-900">
                      {payment.orderID || 'N/A'}
                    </td>
                    <td className="text-gray-600">
                      {payment.payment_date || 'N/A'}
                    </td>
                    <td className="text-gray-900 font-semibold">
                      ৳{payment.payment_amount?.toFixed(2) || '0.00'}
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.payment_status === 'succeeded' 
                          ? 'bg-green-100 text-green-800' 
                          : payment.payment_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.payment_status === 'succeeded' ? 'Completed' : 
                         payment.payment_status === 'pending' ? 'Pending' : 'Failed'}
                      </span>
                    </td>
                    <td className="text-center">
                      <button 
                        className="btn btn-sm btn-outline btn-primary"
                        onClick={() => handleViewMore(payment)}
                      >
                        View More
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Total Orders: {paymentHistory.length}
          </div>
        </>
      )}

      {/* Modal for viewing payment details */}
      {showModal && selectedPayment && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Order Details</h3>
              <button 
                className="btn btn-sm btn-circle btn-ghost"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
            
            {/* Payment Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-700">Order ID</p>
                  <p className="font-semibold text-gray-600">{selectedPayment.orderID}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Date</p>
                  <p className="font-semibold text-gray-600">{selectedPayment.payment_date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Total Amount</p>
                  <p className="font-semibold text-gray-600">৳{selectedPayment.payment_amount?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedPayment.payment_status === 'succeeded' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedPayment.payment_status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedPayment.payment_status === 'succeeded' ? 'Completed' : 
                     selectedPayment.payment_status === 'pending' ? 'Pending' : 'Failed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Billing Information */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Billing Information</h4>
              <div className="bg-gray-50 p-3 rounded">
                <p className='text-black'><span className="font-medium text-black">Name:</span> {selectedPayment.billingrelated_infos.name}</p>
                <p className='text-black'><span className="font-medium text-black">Email:</span> {selectedPayment.customer_email}</p>
                <p className='text-black'><span className="font-medium text-black">Phone:</span> {selectedPayment.phone}</p>
                <p className='text-black'><span className="font-medium text-black">Address:</span> {selectedPayment.address}</p>
              </div>
            </div>

            {/* Cart Items */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Items Purchased ({selectedPayment.itemcount || 0})</h4>
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr>
                      <th>Product ID</th>
                      <th>Unit ID</th>
                      <th>Quantity</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPayment.cartitems && selectedPayment.cartitems.length > 0 ? (
                      selectedPayment.cartitems.map((item, index) => (
                        <tr key={index}>
                          <td className="font-mono text-sm">{item.productid}</td>
                          <td>{item.unitId}</td>
                          <td>{item.quantity}</td>
                          <td>৳{item.price?.toFixed(2) || '0.00'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-gray-500">
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Transaction Details */}
            {selectedPayment.transaction_id && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Transaction Details</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p className='text-black'><span className="font-medium text-black">Transaction ID:</span> {selectedPayment.transaction_id}</p>
                  {selectedPayment.payment_timestamp && (
                    <p className='text-black'><span className="font-medium text-black">Processed At:</span> {new Date(selectedPayment.payment_timestamp).toLocaleString()}</p>
                  )}
                </div>
              </div>
            )}

            <div className="modal-action">
              <button className="btn btn-primary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
