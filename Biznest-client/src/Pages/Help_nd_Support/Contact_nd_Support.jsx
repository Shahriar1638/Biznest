import { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { PrimaryButton, SecondaryButton } from '../../Components/Buttons';
import useAuth from '../../Hooks/useAuth';

const Contact_nd_Support = () => {
    const { user } = useAuth();
    const [contactForm, setContactForm] = useState({
        name: user?.username || '',
        email: user?.email || '',
        userType: user?.role?.type || 'general',
        issueCategory: '',
        subject: '',
        message: '',
        reply: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const axiosPublic = useAxiosPublic();

    const handleContactFormChange = (e) => {
        const { name, value } = e.target;
        setContactForm({
            ...contactForm,
            [name]: value
        });
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Send form data to API
            await axiosPublic.post('/public/contact', contactForm);
            
            // Show success message with SweetAlert
            await Swal.fire({
                icon: 'success',
                title: 'Message Sent Successfully!',
                text: 'Thank you for contacting us! We\'ll get back to you within 24 hours.',
                confirmButtonText: 'Great!',
                confirmButtonColor: '#f59e0b',
                background: '#fffbf0',
                color: '#1f2937'
            });
            
            // Reset form after successful submission
            setContactForm({
                name: user?.username || '',
                email: user?.email || '',
                userType: user?.role?.type || 'general',
                issueCategory: '',
                subject: '',
                message: ''
            });
            
        } catch (error) {
            console.error('Error sending contact form:', error);
            
            // Show error message with SweetAlert
            await Swal.fire({
                icon: 'error',
                title: 'Oops! Something went wrong',
                text: 'Failed to send your message. Please try again or contact us directly.',
                confirmButtonText: 'Try Again',
                confirmButtonColor: '#ef4444',
                background: '#fffbf0',
                color: '#1f2937'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    📞 Contact & Support Options
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Get the help you need when you need it
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Contact Methods */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Email Support */}
                    <div className="card-biznest p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl mr-3">
                                📧
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Email Support</h3>
                        </div>
                        <p className="text-gray-700 mb-2">support@biznest.com</p>
                        <p className="text-sm text-gray-600">Available Mon-Fri, 9 AM-5 PM local time</p>
                        <p className="text-sm text-gray-600">Response within 24 hours</p>
                    </div>

                    {/* Phone Support */}
                    <div className="card-biznest p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xl mr-3">
                                📱
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Phone Support</h3>
                        </div>
                        <p className="text-gray-700 mb-2">+880-1234-567890</p>
                        <p className="text-sm text-gray-600">For urgent order disputes</p>
                        <p className="text-sm text-gray-600">Mon-Fri, 10 AM-4 PM</p>
                    </div>

                    {/* Social Media */}
                    <div className="card-biznest p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xl mr-3">
                                📱
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Social Media</h3>
                        </div>
                        <div className="space-y-2">
                            <a href="#" className="block text-blue-600 hover:text-blue-800">
                                @BizNestBD on X (Twitter)
                            </a>
                            <a href="#" className="block text-blue-600 hover:text-blue-800">
                                Facebook: /BizNestMarketplace
                            </a>
                            <p className="text-sm text-gray-600">Quick updates and queries</p>
                        </div>
                    </div>

                    {/* Community Forum */}
                    <div className="card-biznest p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-xl mr-3">
                                💬
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Community Forum</h3>
                        </div>
                        <p className="text-gray-600 mb-3 text-sm">Join our seller forum for peer-to-peer advice</p>
                        <Link to="/forum">
                            <SecondaryButton size="small">Join Forum</SecondaryButton>
                        </Link>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                    <div className="card-biznest p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">
                            Contact Us
                        </h3>
                        <form onSubmit={handleContactSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={contactForm.name}
                                        onChange={handleContactFormChange}
                                        className="input-biznest"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={contactForm.email}
                                        onChange={handleContactFormChange}
                                        className="input-biznest"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        User Type
                                    </label>
                                    <input
                                        type='text'
                                        name="userType"
                                        value={contactForm.userType}
                                        onChange={handleContactFormChange}
                                        className="input-biznest"
                                        style={{ color: '#000' }}
                                        required
                                    >
                                    </input>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Issue Category
                                    </label>
                                    <select
                                        name="issueCategory"
                                        value={contactForm.issueCategory}
                                        onChange={handleContactFormChange}
                                        className="input-biznest"
                                        style={{ color: '#000' }}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        <option value="order-issue">Order Issue</option>
                                        <option value="payment-problem">Payment Problem</option>
                                        <option value="account-help">Account Help</option>
                                        <option value="seller-support">Seller Support</option>
                                        <option value="technical-issue">Technical Issue</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={contactForm.subject}
                                    onChange={handleContactFormChange}
                                    className="input-biznest"
                                    placeholder="Brief description of your issue"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    name="message"
                                    value={contactForm.message}
                                    onChange={handleContactFormChange}
                                    rows="5"
                                    className="input-biznest resize-none"
                                    placeholder="Please provide details about your issue..."
                                    required
                                />
                            </div>

                            <PrimaryButton 
                                type="submit" 
                                size="large" 
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                                        </svg>
                                        Sending Message...
                                    </div>
                                ) : (
                                    'Send Message'
                                )}
                            </PrimaryButton>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact_nd_Support;
