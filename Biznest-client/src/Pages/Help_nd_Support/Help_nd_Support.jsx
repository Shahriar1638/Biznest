import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryButton, SecondaryButton, OutlineButton } from '../../Components/Buttons';
import Contact_nd_Support from './Contact_nd_Support';

const Help_nd_Support = () => {
    const [activeSection, setActiveSection] = useState('policies');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <section className="bg-gradient-to-r from-amber-500 to-orange-500 py-16 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Help & Support Center
                    </h1>
                    <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
                        Everything you need to know about shopping and selling on BizNest
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <PrimaryButton 
                            size="large" 
                            className="bg-white text-amber-600 hover:bg-gray-50"
                            onClick={() => setActiveSection('contact')}
                        >
                            Contact Support
                        </PrimaryButton>
                        <SecondaryButton 
                            size="large" 
                            className="!border-white !text-white hover:!bg-white hover:!text-amber-600"
                            onClick={() => setActiveSection('policies')}
                        >
                            View Policies
                        </SecondaryButton>
                    </div>
                </div>
            </section>

            {/* Navigation Tabs */}
            <section className="bg-white shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center space-x-8 py-4">
                        <button
                            onClick={() => setActiveSection('policies')}
                            className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                                activeSection === 'policies'
                                    ? 'border-amber-500 text-amber-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Policies & Guidelines
                        </button>
                        <button
                            onClick={() => setActiveSection('contact')}
                            className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                                activeSection === 'contact'
                                    ? 'border-amber-500 text-amber-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Contact & Support
                        </button>
                        <button
                            onClick={() => setActiveSection('faq')}
                            className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                                activeSection === 'faq'
                                    ? 'border-amber-500 text-amber-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Quick Help
                        </button>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">
                {/* Policies and Guidelines Section */}
                {activeSection === 'policies' && (
                    <div className="space-y-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                📋 Policies & Guidelines
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Clear expectations to ensure a safe and fair marketplace for everyone
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Terms of Service */}
                            <div className="card-biznest p-6">
                                <div className="flex items-start mb-4">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl mr-4">
                                        📜
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Terms of Service</h3>
                                        <p className="text-gray-600 text-sm mb-4">Key rules for using BizNest</p>
                                    </div>
                                </div>
                                <ul className="space-y-2 text-gray-700 text-sm">
                                    <li>• All products must be authentic and genuine</li>
                                    <li>• No counterfeit gadgets or electronics allowed</li>
                                    <li>• Accurate product descriptions and images required</li>
                                    <li>• Respectful communication between buyers and sellers</li>
                                    <li>• Comply with local laws and regulations</li>
                                </ul>
                                <Link to="/terms" className="inline-block mt-4">
                                    <OutlineButton size="small">Read Full Terms</OutlineButton>
                                </Link>
                            </div>

                            {/* Privacy Policy */}
                            <div className="card-biznest p-6">
                                <div className="flex items-start mb-4">
                                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xl mr-4">
                                        🔒
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Privacy Policy</h3>
                                        <p className="text-gray-600 text-sm mb-4">How we protect your data</p>
                                    </div>
                                </div>
                                <ul className="space-y-2 text-gray-700 text-sm">
                                    <li>• Your address is only shared with sellers when you order</li>
                                    <li>• Payment information is securely encrypted</li>
                                    <li>• We never sell your personal data to third parties</li>
                                    <li>• Local delivery details kept confidential</li>
                                    <li>• You can delete your account anytime</li>
                                </ul>
                                <Link to="/privacy" className="inline-block mt-4">
                                    <OutlineButton size="small">Read Privacy Policy</OutlineButton>
                                </Link>
                            </div>

                            {/* Seller Guidelines */}
                            <div className="card-biznest p-6">
                                <div className="flex items-start mb-4">
                                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xl mr-4">
                                        🏪
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Seller Guidelines</h3>
                                        <p className="text-gray-600 text-sm mb-4">What products can I sell?</p>
                                    </div>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <h4 className="font-semibold text-green-700 mb-1">✅ Allowed Products:</h4>
                                        <p className="text-gray-700">Groceries, electronics, clothing, books, home goods, handmade items, beauty products, sports equipment</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-red-700 mb-1">❌ Prohibited Items:</h4>
                                        <p className="text-gray-700">Hazardous healthcare products, weapons, illegal substances, expired food items, counterfeit goods</p>
                                    </div>
                                </div>
                                <Link to="/seller-guide" className="inline-block mt-4">
                                    <OutlineButton size="small">Full Seller Guide</OutlineButton>
                                </Link>
                            </div>

                            {/* Buyer Protection */}
                            <div className="card-biznest p-6">
                                <div className="flex items-start mb-4">
                                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-xl mr-4">
                                        🛡️
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Buyer Protection</h3>
                                        <p className="text-gray-600 text-sm mb-4">Return & refund policy</p>
                                    </div>
                                </div>
                                <ul className="space-y-2 text-gray-700 text-sm">
                                    <li>• 7-day returns for shoes, cosmetics, and clothing</li>
                                    <li>• Local pickup options for returns</li>
                                    <li>• Full refund if product doesn't match description</li>
                                    <li>• Dispute resolution support</li>
                                    <li>• Secure payment protection</li>
                                </ul>
                                <Link to="/buyer-protection" className="inline-block mt-4">
                                    <OutlineButton size="small">Learn More</OutlineButton>
                                </Link>
                            </div>

                            {/* Community Standards */}
                            <div className="card-biznest p-6 lg:col-span-2">
                                <div className="flex items-start mb-4">
                                    <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center text-xl mr-4">
                                        🤝
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Community Standards</h3>
                                        <p className="text-gray-600 text-sm mb-4">Promoting Fair Trade in Your Local Community</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">🌟 Our Values:</h4>
                                        <ul className="space-y-1 text-gray-700">
                                            <li>• Support local businesses and entrepreneurs</li>
                                            <li>• Fair pricing and honest communication</li>
                                            <li>• Respect for all community members</li>
                                            <li>• Environmental responsibility in packaging</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">🚀 Community Benefits:</h4>
                                        <ul className="space-y-1 text-gray-700">
                                            <li>• Faster local delivery</li>
                                            <li>• Personal customer service</li>
                                            <li>• Supporting neighborhood economy</li>
                                            <li>• Building lasting relationships</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact and Support Section */}
                {activeSection === 'contact' && (
                    <Contact_nd_Support />
                )}

                {/* Quick Help Section */}
                {activeSection === 'faq' && (
                    <div className="space-y-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                ❓ Quick Help & FAQs
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Find answers to common questions
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* For Buyers */}
                            <div className="card-biznest p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="mr-2">🛒</span>
                                    For Buyers
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">How do I track my order?</h4>
                                        <p className="text-sm text-gray-600">Go to "My Orders" in your account dashboard to see real-time tracking.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">What if I need to return something?</h4>
                                        <p className="text-sm text-gray-600">Contact the seller within 7 days. Most items can be returned with local pickup.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Is my payment secure?</h4>
                                        <p className="text-sm text-gray-600">Yes! We use bank-level encryption and secure payment gateways.</p>
                                    </div>
                                </div>
                            </div>

                            {/* For Sellers */}
                            <div className="card-biznest p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="mr-2">🏪</span>
                                    For Sellers
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">How do I list a product?</h4>
                                        <p className="text-sm text-gray-600">Go to your seller dashboard and click "Add Product" with photos and description.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">When do I get paid?</h4>
                                        <p className="text-sm text-gray-600">Payments are released 24 hours after successful delivery confirmation.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">What are the seller fees?</h4>
                                        <p className="text-sm text-gray-600">We charge a small 3% transaction fee only when you make a sale.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                                Still need help? Try these quick actions:
                            </h3>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <Link to="/orders">
                                    <SecondaryButton>Check My Orders</SecondaryButton>
                                </Link>
                                <Link to="/account">
                                    <SecondaryButton>Account Settings</SecondaryButton>
                                </Link>
                                <button onClick={() => setActiveSection('contact')}>
                                    <PrimaryButton>Contact Support</PrimaryButton>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Help_nd_Support;
