import { useState } from 'react';
import useAuth from '../../../../Hooks/useAuth';
import useAxiosSecure from '../../../../Hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const AddProducts = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        product_name: '',
        product_imgurl: '',
        category: '',
        quantity_description: [
            {
                unitid: 'U001',
                unit_value: '',
                unit_type: 'pieces-pcs',
                unit_quantity: '',
                unit_price: ''
            }
        ]
    });

    const categories = [
        'Electronics & Gadgets',
        'Health & Personal Care',
        'Sports & Fitness',
        'Home & Kitchen Appliances',
        'Fashion & Cosmetics',
        'Groceries & Pantry',
        'Beauty & Lifestyle',
        'Books, Stationery & Hobbies',
        'Home & Garden',
        'Kids & Baby'
    ];

    const unitTypes = [
        'pieces-pcs',
        'gram-g',
        'kilogram-kg',
        'mililiters-ml',
        'liters-l'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleQuantityChange = (index, field, value) => {
        const updatedQuantities = [...formData.quantity_description];
        updatedQuantities[index] = {
            ...updatedQuantities[index],
            [field]: field === 'unit_value' || field === 'unit_quantity' || field === 'unit_price' 
                ? parseFloat(value) || '' 
                : value
        };
        setFormData(prev => ({
            ...prev,
            quantity_description: updatedQuantities
        }));
    };

    const addQuantityVariant = () => {
        const newUnitId = `U${String(formData.quantity_description.length + 1).padStart(3, '0')}`;
        setFormData(prev => ({
            ...prev,
            quantity_description: [
                ...prev.quantity_description,
                {
                    unitid: newUnitId,
                    unit_value: '',
                    unit_type: 'pieces-pcs',
                    unit_quantity: '',
                    unit_price: ''
                }
            ]
        }));
    };

    const removeQuantityVariant = (index) => {
        if (formData.quantity_description.length > 1) {
            const updatedQuantities = formData.quantity_description.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                quantity_description: updatedQuantities
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const productId = `PRD${String(Math.floor(Math.random() * 900) + 100)}`;
            
            const productdetails = {
                productId,
                selleremail: user?.email,
                product_name: formData.product_name,
                product_imgurl: formData.product_imgurl,
                quantity_description: formData.quantity_description,
                product_publishdate: new Date().toISOString().split('T')[0],
                category: formData.category,
                product_status: 'pending',
                rating: [],
                sell_count: []
            };

            const response = await axiosSecure.post('/seller/addproduct', { productdetails });
            
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Product added successfully!',
                    confirmButtonColor: '#f59e0b'
                });
                setFormData({
                    product_name: '',
                    product_imgurl: '',
                    category: '',
                    quantity_description: [
                        {
                            unitid: 'U001',
                            unit_value: '',
                            unit_type: 'pieces-pcs',
                            unit_quantity: '',
                            unit_price: ''
                        }
                    ]
                });
            }
        } catch (error) {
            console.error('Error adding product:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to add product',
                confirmButtonColor: '#f59e0b'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Name *
                            </label>
                            <input
                                type="text"
                                name="product_name"
                                value={formData.product_name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                                placeholder="Enter product name"
                            />
                        </div>

                        {/* Product Image URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Image URL *
                            </label>
                            <input
                                type="url"
                                name="product_imgurl"
                                value={formData.product_imgurl}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                                placeholder="https://example.com/image.jpg"
                            />
                            {formData.product_imgurl && (
                                <div className="mt-2">
                                    <img 
                                        src={formData.product_imgurl} 
                                        alt="Preview" 
                                        className="w-32 h-32 object-cover rounded-lg border"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                            >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Quantity Descriptions */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Product Variants *
                                </label>
                                <button
                                    type="button"
                                    onClick={addQuantityVariant}
                                    className="px-3 py-1 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm"
                                >
                                    Add Variant
                                </button>
                            </div>

                            {formData.quantity_description.map((variant, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium text-gray-700">
                                            Variant {index + 1}
                                        </h4>
                                        {formData.quantity_description.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeQuantityVariant(index)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {/* Unit Value */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Unit Value
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={variant.unit_value}
                                                onChange={(e) => handleQuantityChange(index, 'unit_value', e.target.value)}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                                                placeholder="e.g., 1, 250, 500"
                                            />
                                        </div>

                                        {/* Unit Type */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Unit Type
                                            </label>
                                            <select
                                                value={variant.unit_type}
                                                onChange={(e) => handleQuantityChange(index, 'unit_type', e.target.value)}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                                            >
                                                {unitTypes.map((type) => (
                                                    <option key={type} value={type}>
                                                        {type}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Unit Quantity (Stock) */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Stock Quantity
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={variant.unit_quantity}
                                                onChange={(e) => handleQuantityChange(index, 'unit_quantity', e.target.value)}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                                                placeholder="e.g., 50"
                                            />
                                        </div>

                                        {/* Unit Price */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Price ($)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={variant.unit_price}
                                                onChange={(e) => handleQuantityChange(index, 'unit_price', e.target.value)}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                                                placeholder="e.g., 19.99"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({
                                        product_name: '',
                                        product_imgurl: '',
                                        category: '',
                                        quantity_description: [
                                            {
                                                unitid: 'U001',
                                                unit_value: '',
                                                unit_type: 'pieces-pcs',
                                                unit_quantity: '',
                                                unit_price: ''
                                            }
                                        ]
                                    });
                                }}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Clear Form
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Adding Product...' : 'Add Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProducts;
