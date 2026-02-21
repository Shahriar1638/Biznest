import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import useAuth from "../../Hooks/useAuth";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { PrimaryButton, SecondaryButton } from "../../Components/Buttons";
import { MessageDetailsModal } from "../../Components/Modals";

const ReplyContactMsg = () => {
  const { user } = useAuth();
  const [contactMessages, setContactMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toggleLoadingStates, setToggleLoadingStates] = useState({});
  const axiosSecure = useAxiosSecure();

  const fetchContactMessages = useCallback(async () => {
    if (!user?.email) return;

    try {
      setIsLoading(true);
      const response = await axiosSecure.get("/public/my-contacts");

      if (response.data.success) {
        setContactMessages(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      Swal.fire({
        icon: "error",
        title: "Error Loading Messages",
        text: "Failed to load your contact messages. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, axiosSecure]);

  useEffect(() => {
    fetchContactMessages();
  }, [fetchContactMessages]);

  // Handle toggle read/unread status
  const handleToggleReadStatus = async (messageId) => {
    if (!user?.email) return;

    try {
      setToggleLoadingStates((prev) => ({ ...prev, [messageId]: true }));

      const response = await axiosSecure.put(
        `/public/my-contacts/${messageId}/toggle-read`,
      );

      if (response.data.success) {
        // Update the local state
        setContactMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? { ...msg, msgClientStatus: response.data.isRead }
              : msg,
          ),
        );

        Swal.fire({
          icon: "success",
          title: "Status Updated",
          text: response.data.message,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error toggling read status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update message status. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setToggleLoadingStates((prev) => ({ ...prev, [messageId]: false }));
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    const unreadMessages = contactMessages.filter(
      (msg) => !msg.msgClientStatus,
    );

    if (unreadMessages.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Unread Messages",
        text: "All messages are already marked as read.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Mark All as Read?",
      text: `This will mark ${unreadMessages.length} messages as read.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, mark all as read",
    });

    if (!confirm.isConfirmed) return;

    try {
      // Mark all unread messages as read
      const promises = unreadMessages.map((msg) =>
        axiosSecure.put(`/public/my-contacts/${msg._id}/toggle-read`),
      );

      await Promise.all(promises);

      // Update local state
      setContactMessages((prev) =>
        prev.map((msg) => ({ ...msg, msgClientStatus: true })),
      );

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `${unreadMessages.length} messages marked as read.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error marking all messages as read:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to mark all messages as read. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "No message";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
    };

    return `px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`;
  };

  // Handle view more button click
  const handleViewMore = (message) => {
    const modal = MessageDetailsModal({
      message,
      onToggleRead: handleToggleReadStatus,
      isToggling: toggleLoadingStates[message._id] || false,
    });
    modal.showModal();
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

        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-6">
                <div className="text-sm text-gray-500">
                  Total Messages:{" "}
                  <span className="font-semibold text-gray-900">
                    {contactMessages.length}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Unread:{" "}
                  <span className="font-semibold text-amber-600">
                    {
                      contactMessages.filter((msg) => !msg.msgClientStatus)
                        .length
                    }
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Read:{" "}
                  <span className="font-semibold text-green-600">
                    {
                      contactMessages.filter((msg) => msg.msgClientStatus)
                        .length
                    }
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                {contactMessages.filter((msg) => !msg.msgClientStatus).length >
                  0 && (
                  <PrimaryButton onClick={handleMarkAllAsRead} size="small">
                    ✅ Mark All as Read
                  </PrimaryButton>
                )}
                <SecondaryButton onClick={fetchContactMessages} size="small">
                  🔄 Refresh Messages
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>

        {contactMessages.length === 0 ? (
          <div className="card-biznest p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Messages Found
            </h3>
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Subject
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Reply Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contactMessages.map((message, index) => (
                    <tr
                      key={message._id}
                      className={`border-b border-gray-100 transition-colors hover:bg-amber-50 ${
                        !message.msgClientStatus
                          ? "bg-amber-50 border-l-4 border-l-amber-400"
                          : index % 2 === 0
                            ? "bg-gray-50"
                            : "bg-white"
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              message.msgClientStatus
                                ? "bg-green-400"
                                : "bg-amber-400"
                            }`}
                          ></div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              message.msgClientStatus
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {message.msgClientStatus ? "Read" : "Unread"}
                          </span>
                          {!message.msgClientStatus && (
                            <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded">
                              New
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {truncateText(message.subject, 30)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 capitalize">
                          {message.issueCategory.replace("-", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={getStatusBadge(message.status)}>
                          {message.status.charAt(0).toUpperCase() +
                            message.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {formatDate(message.createdAt)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <SecondaryButton
                            size="small"
                            onClick={() => handleViewMore(message)}
                          >
                            View More
                          </SecondaryButton>
                          <button
                            onClick={() => handleToggleReadStatus(message._id)}
                            disabled={toggleLoadingStates[message._id]}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                              message.msgClientStatus
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                : "bg-green-100 text-green-800 hover:bg-green-200"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {toggleLoadingStates[message._id] ? (
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                                <span>...</span>
                              </div>
                            ) : message.msgClientStatus ? (
                              "Mark Unread"
                            ) : (
                              "Mark Read"
                            )}
                          </button>
                        </div>
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
