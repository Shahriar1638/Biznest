import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../../Hooks/useAuth";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { useProducts } from "../../../Hooks/useProducts";
import {
  PrimaryButton,
  SecondaryButton,
  DangerButton,
} from "../../../Components/Buttons";
import Swal from "sweetalert2";

const ShowCart = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    data: cartData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userCart", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      try {
        const response = await axiosSecure.get(`/user/cart`);
        return response.data.userCart;
      } catch (error) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!user?.email,
    staleTime: 1,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
  const { data: allProducts, isLoading: isProductsLoading } =
    useProducts("all");

  const getProductDetails = (productId) => {
    if (!allProducts) return null;
    return allProducts.find((product) => product.productId === productId);
  };

  const getUnitDetails = (productId, unitid) => {
    const product = getProductDetails(productId);
    if (!product?.quantity_description) return null;
    return product.quantity_description.find((unit) => unit.unitid === unitid);
  };

  const isItemOutOfStock = (cartItem) => {
    const unitDetails = getUnitDetails(cartItem.productId, cartItem.unitid);
    return unitDetails?.unit_quantity === 0;
  };

  const hasOutOfStockItems = () => {
    if (!cartData?.cart_details) return false;
    return cartData.cart_details.some((item) => isItemOutOfStock(item));
  };

  const calculateTotal = () => {
    if (!cartData?.cart_details || !allProducts) return 0;
    return cartData.cart_details.reduce((total, cartItem) => {
      const unitDetails = getUnitDetails(cartItem.productId, cartItem.unitid);
      const unitPrice = unitDetails?.unit_price || 0;

      return total + unitPrice * cartItem.unitquantity;
    }, 0);
  };

  const handleQuantityUpdate = async (cartItem, newQuantity) => {
    console.log(
      "Updating quantity for item:",
      cartItem,
      "to new quantity:",
      newQuantity,
    );

    if (newQuantity < 1) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Quantity",
        text: "Quantity must be at least 1.",
      });
      return;
    }

    if (cartItem.unitquantity === newQuantity) {
      console.log("Quantity is the same, no update needed");
      return;
    }

    setIsUpdating(true);
    try {
      console.log("Sending update request with data:", {
        unitid: cartItem.unitid,
        productId: cartItem.productId,
        newQuantity: parseInt(newQuantity),
      });

      const response = await axiosSecure.put("/user/cart/update-quantity", {
        unitid: cartItem.unitid,
        productId: cartItem.productId,
        newQuantity: parseInt(newQuantity),
      });

      console.log("Update response:", response.data);

      if (response.data.success) {
        await refetch();

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Cart item quantity updated successfully.",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      } else {
        throw new Error(response.data.message || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Update quantity error:", error);

      let errorMessage = "Failed to update quantity. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: errorMessage,
        confirmButtonColor: "#f59e0b",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle remove item
  const handleRemoveItem = async (cartItem) => {
    const productDetails = getProductDetails(cartItem.productId);
    const unitDetails = getUnitDetails(cartItem.productId, cartItem.unitid);

    const productName = productDetails?.product_name || "Unknown Product";
    const unitInfo = unitDetails
      ? `${unitDetails.unit_value} ${unitDetails.unit_type?.split("-")[0]}`
      : "Unknown Unit";

    const result = await Swal.fire({
      title: "Remove Item?",
      html: `Are you sure you want to remove this item from your cart?<br><br><strong>${productName}</strong><br>Unit: ${unitInfo}<br>Quantity: ${cartItem.unitquantity}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    });

    if (result.isConfirmed) {
      try {
        console.log("Removing item with data:", {
          productId: cartItem.productId,
          unitid: cartItem.unitid,
        });

        const response = await axiosSecure.delete("/user/cart/remove-item", {
          data: {
            productId: cartItem.productId,
            unitid: cartItem.unitid,
          },
        });

        console.log("Remove response:", response.data);

        await refetch();

        Swal.fire({
          icon: "success",
          title: "Removed!",
          text: "Item has been removed from your cart.",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      } catch (error) {
        console.error("Remove item error:", error);

        let errorMessage = "Failed to remove item. Please try again.";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        Swal.fire({
          icon: "error",
          title: "Remove Failed",
          text: errorMessage,
          confirmButtonColor: "#f59e0b",
        });
      }
    }
  };

  const handleCheckout = () => {
    if (!cartData?.cart_details || cartData.cart_details.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Items in Cart",
        text: "Please add items to your cart before proceeding to checkout.",
      });
      return;
    }

    console.log(
      "Proceeding to payment with cart items:",
      cartData.cart_details,
    );
    navigate("/payment", {
      state: {
        cartData: cartData.cart_details,
        totalAmount: calculateTotal() + 50,
        userEmail: user.email,
      },
    });
  };

  if (isLoading || isProductsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
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
            Error Loading Cart
          </h2>
          <p className="text-gray-600 mb-4">
            Failed to load your cart. Please try again.
          </p>
          <SecondaryButton onClick={() => refetch()}>Try Again</SecondaryButton>
        </div>
      </div>
    );
  }

  if (!cartData?.cart_details || cartData.cart_details.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Cart</h1>

          <div className="text-center py-16">
            <svg
              className="w-24 h-24 text-gray-300 mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L3 3H1m6 10v6a2 2 0 002 2h8a2 2 0 002-2v-6m-10 6V9a2 2 0 012-2h8a2 2 0 012 2v8"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Start shopping to add items to your cart!
            </p>
            <Link to="/allproducts">
              <PrimaryButton>Continue Shopping</PrimaryButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Cart</h1>
          <div className="text-sm text-gray-600">
            {cartData.cart_details.length} item
            {cartData.cart_details.length !== 1 ? "s" : ""} in cart
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Cart Items List */}
            {cartData.cart_details.map((item) => {
              const productDetails = getProductDetails(item.productId);
              const unitDetails = getUnitDetails(item.productId, item.unitid);
              const unitPrice = unitDetails.unit_price;
              const totalItemPrice = unitPrice * item.unitquantity;

              return (
                <div
                  key={`${item.productId}-${item.unitid}`}
                  className="card-biznest p-6"
                >
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      {productDetails?.product_imgurl ? (
                        <img
                          src={productDetails.product_imgurl}
                          alt={productDetails.product_name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {productDetails?.product_name || "Product Name"}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Sold by: {item.selleremail}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        Unit: {unitDetails?.unit_value}{" "}
                        {unitDetails?.unit_type?.split("-")[0]}
                      </p>
                      <p className="text-xs text-gray-400 mb-1">
                        Category: {productDetails?.category}
                      </p>
                      <p className="text-xs text-gray-400 mb-2">
                        Added: {item.added_date}
                      </p>
                      {/* Stock Status */}
                      {isItemOutOfStock(item) && (
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Out of Stock
                        </div>
                      )}
                    </div>

                    {/* Price and Quantity */}
                    <div className="text-right">
                      <div className="text-lg font-semibold text-amber-600 mb-2">
                        ৳{totalItemPrice.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 mb-3">
                        ৳{unitPrice} × {item.unitquantity}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mb-3">
                        <button
                          onClick={() =>
                            handleQuantityUpdate(item, item.unitquantity - 1)
                          }
                          disabled={item.unitquantity <= 1 || isUpdating}
                          className="w-8 h-8 bg-amber-500 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                        <span className="w-8 text-center font-medium text-black">
                          {item.unitquantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityUpdate(item, item.unitquantity + 1)
                          }
                          disabled={isUpdating}
                          className="w-8 h-8 bg-amber-500 rounded border border-gray-300 flex cursor-pointer items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium border-2 rounded-md px-2 py-1 border-amber-600 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-biznest p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Items:</span>
                  <span className="font-medium text-gray-600 ">
                    {cartData.cart_details.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium text-gray-600">
                    ৳{calculateTotal().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Shipping:</span>
                  <span className="font-medium text-gray-600">৳50</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-amber-600">Total:</span>
                  <span className="text-amber-600">
                    ৳{(calculateTotal() + 50).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {/* Show warning if items are out of stock */}
                {hasOutOfStockItems() && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-red-600 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm text-red-800">
                        Some items are out of stock. Please remove them to
                        proceed.
                      </p>
                    </div>
                  </div>
                )}

                <PrimaryButton
                  onClick={handleCheckout}
                  disabled={
                    !cartData?.cart_details ||
                    cartData.cart_details.length === 0 ||
                    hasOutOfStockItems()
                  }
                  className="w-full"
                >
                  {hasOutOfStockItems()
                    ? "Cannot Proceed - Items Out of Stock"
                    : `Proceed to Payment (${cartData.cart_details.length})`}
                </PrimaryButton>

                <Link to="/allproducts">
                  <SecondaryButton className="w-full">
                    Continue Shopping
                  </SecondaryButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowCart;
