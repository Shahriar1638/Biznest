import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../../Hooks/useAxiosSecure";
import useAuth from "../../../../Hooks/useAuth";
import Swal from "sweetalert2";
import {
  PrimaryButton,
  SecondaryButton,
  DangerButton,
} from "../../../../Components/Buttons";

const Feedback = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const {
    data: contactsData = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["adminContacts", selectedFilter],
    queryFn: async () => {
      if (!user?.email) return { contacts: [] };

      // Backend now handles admin verification and email retrieval from token
      // We just need to pass the status filter if it's not 'all'
      const params = new URLSearchParams();
      if (selectedFilter !== "all") {
        params.append("status", selectedFilter);
      }

      console.log("Fetching contacts with params:", params.toString());
      const response = await axiosSecure.get(
        `/admin/contacts?${params.toString()}`,
      );
      return response.data;
    },
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const contacts =
    contactsData?.contacts?.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    ) || [];

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSendingReply(true);
    try {
      // Backend now expects admin email from token (handled by req.decoded.email)
      // So we don't need to send adminEmail in the body, but verifyAdmin middleware will check it
      const response = await axiosSecure.post("/admin/contacts/reply", {
        contactId: selectedContact._id,
        replyMessage: replyMessage,
        // adminEmail: user.email // Removed as per new backend logic
      });

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Reply Sent",
          text: "Your reply has been sent successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
        setReplyModalOpen(false);
        setReplyMessage("");
        setSelectedContact(null);
        refetch();
      } else {
        throw new Error(response.data.message || "Failed to send reply");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Failed to send reply. Please try again.",
        confirmButtonColor: "#f59e0b",
      });
    } finally {
      setSendingReply(false);
    }
  };

  const handleToggleReadStatus = async (contact) => {
    try {
      // Backend now expects admin email from token
      const response = await axiosSecure.put(
        `/admin/contacts/${contact._id}/toggle-read`,
        {
          // adminEmail: user.email // Removed as per new backend logic
        },
      );

      if (response.data.success) {
        // Optimistic update or refetch
        refetch();
        // constant toast = Swal.mixin({ ... }) // could add a toast here
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error toggling read status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update message status",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  const openReplyModal = (contact) => {
    setSelectedContact(contact);
    setReplyMessage(
      `Dear ${contact.name},\n\nThank you for reaching out regarding "${contact.subject}".\n\n[Your reply here]\n\nBest regards,\nBizNest Support Team`,
    );
    setReplyModalOpen(true);
    // Mark as read if not already read
    if (!contact.msgAdminStatus) {
      handleToggleReadStatus(contact);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleMarkAllAsRead = async () => {
    // This could be optimized with a dedicated backend endpoint
    // For now, we'll iterate through unread messages (limit to visible ones or first batch)
    const unreadContacts = contacts.filter((c) => !c.msgAdminStatus);

    if (unreadContacts.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No unread messages",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    try {
      Swal.showLoading();
      // Execute in parallel
      await Promise.all(
        unreadContacts.map((contact) =>
          axiosSecure.put(`/admin/contacts/${contact._id}/toggle-read`),
        ),
      );

      Swal.close();
      Swal.fire({
        icon: "success",
        title: "All marked as read",
        timer: 1500,
        showConfirmButton: false,
      });
      refetch();
    } catch (error) {
      console.error("Error marking all as read:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to mark all as read",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Error Loading Feedback
          </h2>
          <p className="text-gray-600 mb-4">
            Failed to load contact messages. Please try again.
          </p>
          <PrimaryButton onClick={() => refetch()}>Try Again</PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Feedback & Support
            </h1>
            <p className="text-gray-600">
              Manage user inquiries and support tickets
            </p>
          </div>
          <div className="flex gap-3">
            <SecondaryButton onClick={handleMarkAllAsRead}>
              Mark All as Read
            </SecondaryButton>
            <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-medium">
              {contacts.filter((c) => !c.msgAdminStatus).length} Unread
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-biznest p-6 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">Filter by Status:</span>
            <div className="flex gap-2">
              {["all", "pending", "in-progress", "resolved"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedFilter === status
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={() => refetch()}
              className="ml-auto p-2 text-gray-500 hover:text-amber-600"
              title="Refresh"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {contacts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No messages found
              </h3>
              <p className="text-gray-500">
                {selectedFilter !== "all"
                  ? `No ${selectedFilter} messages found`
                  : "You haven't received any messages yet"}
              </p>
            </div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact._id}
                className={`card-biznest p-6 transition-shadow hover:shadow-md ${
                  !contact.msgAdminStatus
                    ? "border-l-4 border-l-amber-500 bg-amber-50/10"
                    : ""
                }`}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Message Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {contact.subject}
                        </h3>
                        {!contact.msgAdminStatus && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            New
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(contact.status)}`}
                        >
                          {contact.status}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityBadge(contact.priority)}`}
                        >
                          {contact.priority} Priority
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(contact.createdAt).toLocaleDateString()}{" "}
                        {new Date(contact.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span className="font-medium text-gray-900">
                          {contact.name}
                        </span>
                        <span>&lt;{contact.email}&gt;</span>
                        <span className="text-gray-400">•</span>
                        <span className="capitalize">{contact.userType}</span>
                        <span className="text-gray-400">•</span>
                        <span className="capitalize">
                          {contact.issueCategory.replace("-", " ")}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100">
                        {contact.message}
                      </p>
                    </div>

                    {/* Previous Reply if any */}
                    {contact.reply && (
                      <div className="ml-8 mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-xs font-semibold text-blue-800 mb-1">
                          Reply sent on{" "}
                          {new Date(contact.resolvedAt).toLocaleDateString()}:
                        </p>
                        <p className="text-sm text-blue-900 italic">
                          "{contact.reply}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 justify-start md:min-w-[120px]">
                    <PrimaryButton
                      onClick={() => openReplyModal(contact)}
                      size="small"
                      className="w-full justify-center"
                    >
                      {contact.reply ? "Send Another" : "Reply"}
                    </PrimaryButton>

                    <button
                      onClick={() => handleToggleReadStatus(contact)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg border w-full transition-colors ${
                        contact.msgAdminStatus
                          ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                          : "border-amber-500 text-amber-600 hover:bg-amber-50"
                      }`}
                    >
                      Mark as {contact.msgAdminStatus ? "Unread" : "Read"}
                    </button>

                    {/* Could add delete button here if needed */}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {replyModalOpen && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Reply to {selectedContact.name}
              </h3>
              <button
                onClick={() => setReplyModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleReply} className="p-6 flex-1 overflow-y-auto">
              {/* Original Message Preview */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg text-sm text-gray-600 max-h-32 overflow-y-auto">
                <p className="font-medium text-gray-900 mb-1">
                  Original Message:
                </p>
                <p>{selectedContact.message}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Reply
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={8}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="Type your reply here..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <SecondaryButton
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={sendingReply}>
                  {sendingReply ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Reply"
                  )}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
