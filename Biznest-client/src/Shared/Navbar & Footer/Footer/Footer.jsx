import logo from "../../../assets/logo.png";

const Footer = () => {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-3 mb-4">
                            <img 
                                src={logo} 
                                alt="BizNest Logo" 
                                className="w-10 h-10 object-contain"
                            />
                            <h3 className="text-2xl font-bold text-gray-900">BizNest</h3>
                        </div>
                        <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
                            Your trusted e-commerce platform connecting buyers and sellers. 
                            Discover quality products and grow your business with BizNest.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                                <span className="sr-only">Facebook</span>
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                                <span className="sr-only">Twitter</span>
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                                <span className="sr-only">Instagram</span>
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447c0-1.297.49-2.447 1.418-3.322.927-.875 2.078-1.365 3.323-1.365 1.297 0 2.447.49 3.322 1.365.875.875 1.365 2.025 1.365 3.322 0 1.297-.49 2.448-1.365 3.323-.875.927-2.025 1.418-3.322 1.418zm7.718-1.418c-.875.927-2.025 1.418-3.322 1.418-1.297 0-2.448-.49-3.323-1.418-.927-.875-1.418-2.026-1.418-3.323 0-1.297.49-2.447 1.418-3.322.875-.875 2.026-1.365 3.323-1.365 1.297 0 2.447.49 3.322 1.365.927.875 1.418 2.025 1.418 3.322 0 1.297-.49 2.448-1.418 3.323z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h4>
                        <ul className="space-y-3">
                            <li><a href="/" className="text-gray-600 hover:text-orange-500 transition-colors">Home</a></li>
                            <li><a href="/allproducts" className="text-gray-600 hover:text-orange-500 transition-colors">All Products</a></li>
                            <li><a href="/help-nd-support" className="text-gray-600 hover:text-orange-500 transition-colors">Help & Support</a></li>
                            <li><a href="/profile" className="text-gray-600 hover:text-orange-500 transition-colors">Profile</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Support</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-gray-600 hover:text-orange-500 transition-colors">Help Center</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-orange-500 transition-colors">Contact Us</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-orange-500 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-orange-500 transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-200 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm">
                        © 2025 BizNest. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="text-gray-500 hover:text-orange-500 text-sm transition-colors">Privacy</a>
                        <a href="#" className="text-gray-500 hover:text-orange-500 text-sm transition-colors">Terms</a>
                        <a href="#" className="text-gray-500 hover:text-orange-500 text-sm transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
