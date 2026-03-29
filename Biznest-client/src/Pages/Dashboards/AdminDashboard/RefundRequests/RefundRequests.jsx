import React, { useState, useEffect } from 'react';
import useAxiosSecure from "../../../../Hooks/useAxiosSecure";
import Swal from 'sweetalert2';
import { RiCheckLine, RiCloseLine, RiRefund2Line, RiUserLine, RiCalendarLine } from 'react-icons/ri';

const RefundRequests = () => {
    const axiosSecure = useAxiosSecure();
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRefunds();
    }, []);

    const fetchRefunds = async () => {
        try {
            const res = await axiosSecure.get('/admin/refunds');
            if (res.data.success) {
                setRefunds(res.data.data);
            }
        } catch (error) {
            console.error('Fetch Refunds Error:', error);

        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (orderID) => {
        const result = await Swal.fire({
            title: 'Approve Refund?',
            text: "This will trigger a real refund via Stripe and update the order status.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4F46E5', // Indigo-600
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Approve'
        });

        if (result.isConfirmed) {
            try {
                Swal.fire({ title: 'Processing...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                const res = await axiosSecure.put(`/admin/refunds/${orderID}/approve`);
                if (res.data.success) {
                    Swal.fire('Approved!', 'Refund has been processed successfully.', 'success');
                    fetchRefunds();
                }
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to approve refund', 'error');
            }
        }
    };

    const handleReject = async (orderID) => {
        const { value: reason } = await Swal.fire({
            title: 'Reject Refund Request',
            input: 'textarea',
            inputLabel: 'Reason for rejection',
            inputPlaceholder: 'Explain why the refund was denied...',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) return 'You need to provide a reason!';
            }
        });

        if (reason) {
            try {
                const res = await axiosSecure.put(`/admin/refunds/${orderID}/reject`, { reason });
                if (res.data.success) {
                    Swal.fire('Rejected', 'Refund request has been denied.', 'success');
                    fetchRefunds();
                }
            } catch (error) {
                console.error('Reject Refund Error:', error);
                Swal.fire('Error', 'Failed to reject refund', 'error');
            }
        }
    };

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <span className="loading loading-spinner loading-lg text-indigo-600"></span>
        </div>
    );

    return (
        <div className="p-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Refund Requests</h1>
                    <p className="text-gray-500">Manage customer refund requests initiated by NestBot</p>
                </div>
                <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600">
                    {refunds.length} Pending Requests
                </div>
            </div>

            {refunds.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                    <RiRefund2Line className="mb-2 text-4xl text-gray-300" />
                    <p className="text-gray-500">No pending refund requests found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                            <tr>
                                <th className="px-6 py-4">Order / Customer</th>
                                <th className="px-6 py-4">Request Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {refunds.map((refund) => (
                                <tr key={refund._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-indigo-600">#{refund.orderID}</div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <RiUserLine /> {refund.customerEmail}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-700">
                                            <RiCalendarLine className="text-gray-400" />
                                            {new Date(refund.refund_requested_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-gray-900">{refund.total_price} BDT</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="w-48 truncate text-sm text-gray-600" title={refund.refund_reason}>
                                            {refund.refund_reason}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleApprove(refund.orderID)}
                                                className="group flex items-center justify-center rounded-lg bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                title="Approve Refund"
                                            >
                                                <RiCheckLine size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleReject(refund.orderID)}
                                                className="group flex items-center justify-center rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                title="Reject Refund"
                                            >
                                                <RiCloseLine size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RefundRequests;
