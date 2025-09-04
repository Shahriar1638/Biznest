const CustomerInfo = ({ roleDetails }) => {
    return (
        <div className="card-biznest p-6">
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Customer Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Customer ID</label>
                    <p className="text-lg font-semibold text-gray-900">{roleDetails?.customerID || 'N/A'}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Loyalty Points</label>
                    <p className="text-lg font-semibold text-amber-600">
                        {roleDetails?.points ? roleDetails.points.toLocaleString() : 0} pts
                    </p>
                </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-600 mb-3">Wishlist Items</label>
                {roleDetails?.wishlist && roleDetails.wishlist.length > 0 ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Items:</span>
                            <span className="font-semibold text-gray-900">{roleDetails.wishlist.length}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {roleDetails.wishlist.map((item, index) => (
                                <span 
                                    key={index}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No items in wishlist</p>
                )}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <p className="text-sm text-blue-800">
                        Enjoy shopping with us! Your loyalty points can be redeemed for discounts on future purchases.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CustomerInfo;
