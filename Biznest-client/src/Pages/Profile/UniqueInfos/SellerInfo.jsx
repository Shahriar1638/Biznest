const SellerInfo = ({ roleDetails }) => {
    const approvalRate = roleDetails?.numOfApproved && roleDetails?.numOfReject 
        ? ((roleDetails.numOfApproved / (roleDetails.numOfApproved + roleDetails.numOfReject)) * 100).toFixed(1)
        : 0;

    return (
        <div className="card-biznest p-6">
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 4h2M9 15h2" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Seller Dashboard</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Seller ID</label>
                    <p className="text-lg font-semibold text-gray-900">{roleDetails?.sellerID || 'N/A'}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Total Revenue</label>
                    <p className="text-lg font-semibold text-green-600">
                        ${roleDetails?.revenue ? roleDetails.revenue.toLocaleString() : '0.00'}
                    </p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center">
                        <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-2xl font-bold text-green-700">{roleDetails?.numOfApproved || 0}</p>
                            <p className="text-sm text-green-600">Approved Products</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center">
                        <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-2xl font-bold text-red-700">{roleDetails?.numOfReject || 0}</p>
                            <p className="text-sm text-red-600">Rejected Products</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                        <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <div>
                            <p className="text-2xl font-bold text-blue-700">{approvalRate}%</p>
                            <p className="text-sm text-blue-600">Approval Rate</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <p className="text-sm text-green-800">
                        Keep up the great work! Focus on maintaining high-quality products to improve your approval rate.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SellerInfo;
