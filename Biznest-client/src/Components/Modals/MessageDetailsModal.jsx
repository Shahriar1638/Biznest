import React from 'react';
import Swal from 'sweetalert2';

const MessageDetailsModal = ({ message, onToggleRead, isToggling }) => {
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

    const showModal = () => {
        Swal.fire({
            title: 'Message Details',
            html: getModalContent(),
            width: '700px',
            showCloseButton: true,
            showConfirmButton: false,
            customClass: {
                popup: 'text-left'
            },
            didOpen: () => {
                const toggleBtn = document.getElementById('toggle-read-btn');
                if (toggleBtn) {
                    toggleBtn.addEventListener('click', handleToggleClick);
                }
            },
            willClose: () => {
                const toggleBtn = document.getElementById('toggle-read-btn');
                if (toggleBtn) {
                    toggleBtn.removeEventListener('click', handleToggleClick);
                }
            }
        });
    };

    // Handle toggle button click in modal
    const handleToggleClick = () => {
        if (onToggleRead && !isToggling) {
            onToggleRead(message._id);
            Swal.close();
        }
    };

    const getModalContent = () => {
        return `
            <div class="space-y-6">
                <!-- Header Section -->
                <div class="border-b pb-4 mb-4">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="font-bold text-xl text-gray-900">${message.subject}</h3>
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 rounded-full ${message.msgClientStatus ? 'bg-green-400' : 'bg-amber-400'}"></div>
                            <span class="text-xs px-2 py-1 rounded-full font-medium ${
                                message.msgClientStatus 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-amber-100 text-amber-800'
                            }">
                                ${message.msgClientStatus ? 'Read' : 'Unread'}
                            </span>
                            ${!message.msgClientStatus ? '<span class="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded">New</span>' : ''}
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <p><span class="font-medium">Category:</span> ${message.issueCategory.replace('-', ' ')}</p>
                        <p><span class="font-medium">Submitted:</span> ${formatDate(message.createdAt)}</p>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <span class="inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(message.status)}">
                            ${message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                        </span>
                        
                        <button
                            id="toggle-read-btn"
                            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                message.msgClientStatus
                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}"
                            ${isToggling ? 'disabled' : ''}
                        >
                            ${isToggling ? (
                                '<div class="flex items-center space-x-2"><div class="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin"></div><span>Updating...</span></div>'
                            ) : (
                                message.msgClientStatus ? '📖 Mark as Unread' : '✅ Mark as Read'
                            )}
                        </button>
                    </div>
                </div>
                
                <!-- Your Message Section -->
                <div class="space-y-3">
                    <h4 class="font-semibold text-gray-900 text-lg flex items-center">
                        <span class="mr-2">💬</span> Your Message
                    </h4>
                    <div class="bg-gray-50 p-4 rounded-lg border">
                        <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">${message.message}</p>
                    </div>
                </div>
                
                <!-- Reply Section -->
                ${message.reply ? `
                    <div class="space-y-3">
                        <h4 class="font-semibold text-gray-900 text-lg flex items-center">
                            <span class="mr-2">💭</span> Our Reply
                        </h4>
                        <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                            <p class="text-gray-700 whitespace-pre-wrap leading-relaxed mb-3">${message.reply}</p>
                            ${message.resolvedAt ? `
                                <div class="flex items-center text-xs text-gray-500 bg-white px-3 py-2 rounded-md">
                                    <span class="mr-2">🕒</span>
                                    <span>Replied on: ${formatDate(message.resolvedAt)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : `
                    <div class="space-y-3">
                        <h4 class="font-semibold text-gray-900 text-lg flex items-center">
                            <span class="mr-2">💭</span> Our Reply
                        </h4>
                        <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                            <div class="flex items-center text-gray-600">
                                <span class="text-2xl mr-3">⏳</span>
                                <div>
                                    <p class="font-medium">No reply yet</p>
                                    <p class="text-sm">We'll get back to you within 24 hours.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `}
                
                <!-- Footer Info -->
                <div class="text-xs text-gray-500 pt-4 border-t">
                    <p>💡 <strong>Tip:</strong> You can toggle the read status using the button above to help organize your messages.</p>
                </div>
            </div>
        `;
    };

    return { showModal };
};

export default MessageDetailsModal;
