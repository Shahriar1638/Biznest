import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../../Hooks/useAxiosSecure';
import useAuth from '../../../../Hooks/useAuth';
import Swal from 'sweetalert2';

const Feedback = () => {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [isReplying, setIsReplying] = useState(false);

    const { data: contactsData = null, isLoading, error, refetch } = useQuery({
        queryKey: ['adminContacts', selectedFilter],
        queryFn: async () => {
            const params = new URLSearchParams({
                adminEmail: user.email,
                ...(selectedFilter !== 'all' && { status: selectedFilter })
            });
            
            const response = await axiosSecure.get(`/admin/contacts?${params}`);
            return response.data;
        },
        enabled: !!user?.email && user?.role?.type === 'admin',
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
    });

    const contacts = contactsData?.data || [];

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             contact.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             contact.issueCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             contact.message?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleReply = async (contact) => {
        if (!user || user.role?.type !== 'admin') {
            Swal.fire({
                icon: 'error',
                title: 'Unauthorized',
                text: 'You must be an admin to perform this action.',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        // Show reply modal
        const { value: replyText } = await Swal.fire({
            title: 'Reply to Contact Message',
            html: `
                <div class="text-left mb-4">
                    <p><strong>From:</strong> ${contact.email}</p>
                    <p><strong>Subject:</strong> ${contact.subject}</p>
                    <p><strong>Category:</strong> ${contact.issueCategory}</p>
                    <p><strong>Date:</strong> ${new Date(contact.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="text-left mb-4 p-3 bg-gray-100 rounded">
                    <p><strong>Message:</strong></p>
                    <p class="text-sm mt-2">${contact.message}</p>
                </div>
                <textarea 
                    id="reply-text" 
                    placeholder="Type your reply here..." 
                    class="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    rows="6"
                    style="font-size: 14px; font-family: inherit;"
                ></textarea>
            `,
            showCancelButton: true,
            confirmButtonText: 'Send Reply',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280',
            width: '600px',
            preConfirm: () => {
                const reply = document.getElementById('reply-text').value;
                if (!reply || reply.trim() === '') {
                    Swal.showValidationMessage('Please enter a reply message');
                    return false;
                }
                return reply.trim();
            }
        });

        if (replyText) {
            setIsReplying(true);
            try {
                Swal.fire({
                    title: 'Sending Reply...',
                    text: 'Please wait while we send your reply.',
                    icon: 'info',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const response = await axiosSecure.put('/admin/contacts/reply', {
                    messageId: contact._id,
                    reply: replyText,
                    adminEmail: user.email
                });

                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Reply Sent!',
                        text: 'Your reply has been sent successfully.',
                        confirmButtonColor: '#f59e0b'
                    });
                    
                    refetch();
                } else {
                    throw new Error(response.data.message || 'Failed to send reply');
                }
            } catch (error) {
                console.error('Error sending reply:', error);
                
                const errorMessage = error.response?.data?.message || error.message || 'Failed to send reply';
                
                Swal.fire({
                    icon: 'error',
                    title: 'Reply Failed',
                    text: errorMessage,
                    confirmButtonColor: '#f59e0b'
                });
            } finally {
                setIsReplying(false);
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
            resolved: 'bg-green-100 text-green-800 border-green-200'
        };
        
        return `px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`;
    };

    const truncateText = (text, maxLength = 50) => {
        if (!text) return 'No message';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading contact messages...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading Messages</h2>
                    <p className="text-gray-600 mb-4">Failed to load contact messages. Please try again.</p>
                    <button 
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Messages & Feedback</h1>
                    <p className="text-gray-600">Manage customer inquiries and provide support</p>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search messages, email, or subject..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black placeholder-gray-500"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-4">
                            {/* Status Filter */}
                            <select
                                value={selectedFilter}
                                onChange={(e) => setSelectedFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>

                            {/* Refresh Button */}
                            <button
                                onClick={() => refetch()}
                                className="p-2 text-gray-600 hover:text-amber-600 transition-colors"
                                title="Refresh messages"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                        <span>
                            Showing {filteredContacts.length} messages
                        </span>
                        <span>
                            Filter: {selectedFilter === 'all' ? 'All Status' : selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
                        </span>
                    </div>
                </div>

                {/* Messages Table */}
                {filteredContacts.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                {/* Table Header */}
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Message
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                {/* Table Body */}
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredContacts.map((contact, index) => (
                                        <tr key={contact._id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-amber-50 transition-colors`}>
                                            {/* User Email */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {contact.userEmail}
                                                </div>
                                            </td>

                                            {/* Subject */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-medium">
                                                    {truncateText(contact.subject, 30)}
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600 capitalize">
                                                    {contact.issueCategory?.replace('-', ' ')}
                                                </span>
                                            </td>

                                            {/* Message */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-700">
                                                    {truncateText(contact.message, 40)}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={getStatusBadge(contact.status)}>
                                                    {contact.status?.charAt(0).toUpperCase() + contact.status?.slice(1)}
                                                </span>
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">
                                                    {formatDate(contact.createdAt)}
                                                </div>
                                                {contact.resolvedAt && (
                                                    <div className="text-xs text-green-600">
                                                        Replied: {formatDate(contact.resolvedAt)}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleReply(contact)}
                                                        disabled={isReplying}
                                                        className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white ${
                                                            contact.status === 'resolved' 
                                                                ? 'bg-gray-400 hover:bg-gray-500' 
                                                                : 'bg-amber-600 hover:bg-amber-700'
                                                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    >
                                                        {contact.status === 'resolved' ? 'View Reply' : 'Reply'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm || selectedFilter !== 'all' ? 'No messages found' : 'No contact messages yet'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm || selectedFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Contact messages will appear here when customers submit feedback'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feedback;