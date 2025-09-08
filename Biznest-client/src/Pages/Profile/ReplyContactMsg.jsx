import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import useAuth from '../../Hooks/useAuth';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { PrimaryButton, SecondaryButton } from '../../Components/Buttons';

const ReplyContactMsg = () => {
    const { user } = useAuth();
    const [contactMessages, setContactMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const axiosPublic = useAxiosPublic();

    // Fetch contact messages when component loads
    const fetchContactMessages = useCallback(async () => {
        if (!user?.email) return;
        
        try {
            setIsLoading(true);
            const response = await axiosPublic.get(`/public/contacts/${user.email}`);
            
            if (response.data.success) {
                setContactMessages(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch messages');
            }
        } catch (error) {
            console.error('Error fetching contact messages:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error Loading Messages',
                text: 'Failed to load your contact messages. Please try again.',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsLoading(false);
        }
    }, [user?.email, axiosPublic]);

    useEffect(() => {
        fetchContactMessages();
    }, [fetchContactMessages]);

    // Truncate text for table display
    const truncateText = (text, maxLength = 50) => {
        if (!text) return 'No message';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
            resolved: 'bg-green-100 text-green-800 border-green-200'
        };
        
        return `px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`;
    };

    // Handle view more button click
    const handleViewMore = (message) => {
        // Create detailed message content for SweetAlert
        const messageContent = `
            <div class="text-left space-y-4">
                <div class="border-b pb-3 mb-3">
                    <h3 class="font-bold text-lg text-gray-900">${message.subject}</h3>
                    <p class="text-sm text-gray-600">Category: ${message.issueCategory}</p>
                    <p class="text-sm text-gray-600">Submitted: ${formatDate(message.createdAt)}</p>
                    <span class="inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(message.status).split(' ').slice(3).join(' ')}">${message.status.charAt(0).toUpperCase() + message.status.slice(1)}</span>
                </div>
                
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-900 mb-2">Your Message:</h4>
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <p class="text-gray-700 whitespace-pre-wrap">${message.message}</p>
                    </div>
                </div>
                
                ${message.reply ? `
                    <div class="mb-4">
                        <h4 class="font-semibold text-gray-900 mb-2">Our Reply:</h4>
                        <div class="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                            <p class="text-gray-700 whitespace-pre-wrap">${message.reply}</p>
                            ${message.resolvedAt ? `<p class="text-xs text-gray-500 mt-2">Replied on: ${formatDate(message.resolvedAt)}</p>` : ''}
                        </div>
                    </div>
                ` : `
                    <div class="mb-4">
                        <div class="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                            <p class="text-gray-600 text-sm">⏳ No reply yet. We'll get back to you within 24 hours.</p>
                        </div>
                    </div>
                `}
            </div>
        `;

        Swal.fire({
            title: 'Message Details',
            html: messageContent,
            width: '600px',
            showCloseButton: true,
            showConfirmButton: false,
            customClass: {
                popup: 'text-left'
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        📧 Your Contact Messages
                    </h1>
                    <p className="text-gray-600">
                        View all messages you've sent to our support team
                    </p>
                </div>

                {/* Stats */}
                <div className="mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Total Messages: <span className="font-semibold text-gray-900">{contactMessages.length}</span>
                            </div>
                            <SecondaryButton onClick={fetchContactMessages} size="small">
                                🔄 Refresh Messages
                            </SecondaryButton>
                        </div>
                    </div>
                </div>

                {contactMessages.length === 0 ? (
                    <div className="card-biznest p-8 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Messages Found</h3>
                        <p className="text-gray-600 mb-6">
                            You haven't sent any messages to our support team yet.
                        </p>
                        <a href="/help-nd-support" className="inline-block">
                            <PrimaryButton>Contact Support</PrimaryButton>
                        </a>
                    </div>
                ) : (
                    <div className="card-biznest p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Subject</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Message</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contactMessages.map((message, index) => (
                                        <tr key={message._id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-amber-50 transition-colors`}>
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-gray-900">
                                                    {truncateText(message.subject, 30)}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-gray-600 capitalize">
                                                    {message.issueCategory.replace('-', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm text-gray-700">
                                                    {truncateText(message.message, 40)}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={getStatusBadge(message.status)}>
                                                    {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm text-gray-600">
                                                    {formatDate(message.createdAt)}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <SecondaryButton 
                                                    size="small" 
                                                    onClick={() => handleViewMore(message)}
                                                >
                                                    View More
                                                </SecondaryButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReplyContactMsg;
