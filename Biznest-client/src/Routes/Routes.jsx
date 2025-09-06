import { createBrowserRouter } from "react-router-dom";
import Layout from "../Layout/Layout";
import DashboardLayout from "../Layout/DashboardLayout";
import ErrorPage from "../ErrorPage/ErrorPage";
import Login from "../Shared/AuthPage/Login";
import PublicSignup from "../Shared/AuthPage/PublicSignup";
import CustomerHome from "../Pages/Homepage/CustomerHome";
import SellerHome from "../Pages/Homepage/SellerHome";
import AdminHome from "../Pages/Homepage/AdminHome";
import DefaultHome from "../Pages/Homepage/DefaultHome";
import Help_nd_Support from "../Pages/Help_nd_Support/Help_nd_Support";
import AllProducts from "../Pages/All Products/AllProducts";
import Profile from "../Pages/Profile/profile";
import ShowCart from "../Pages/Cart/ShowCart/ShowCart";
import ProcessPayment from "../Pages/Cart/ProcessPayment/ProcessPayment";
import MyProducts from "../Pages/Dashboards/SellerDashboard/MyProductsList/Myproducts";
import AddProducts from "../Pages/Dashboards/SellerDashboard/AddProducts/Addproducts";
import ALLProductsAdmin from "../Pages/Dashboards/AdminDashboard/All Prodcuts Admin/ALLProductsAdmin";
import RegisterAdmin from "../Pages/Dashboards/AdminDashboard/RegisterAdmin/RegisterAdmin";
import DashboardDefault from "../Pages/Dashboards/DashboardDefault";

const Routes = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: <DefaultHome />
            },
            {
                path: "/customer-home",
                element: <CustomerHome />
            },
            {
                path: "/seller-home",
                element: <SellerHome />
            },
            {
                path: "/admin-home",
                element: <AdminHome />
            },
            {
                path: "/help-nd-support",
                element: <Help_nd_Support />
            },
            {
                path: "/allproducts",
                element: <AllProducts />
            },
            {
                path: "/profile",
                element: <Profile />
            },
            {
                path: "/cart",
                element: <ShowCart />
            },
            {
                path: "/payment",
                element: <ProcessPayment />
            }

        ]
    },
    {
        path: "/dashboard",
        element: <DashboardLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/dashboard",
                element: <DashboardDefault />
            },
            {
                path: "/dashboard/seller/products",
                element: <MyProducts />
            },
            {
                path: "/dashboard/seller/add-product",
                element: <AddProducts />
            },
            {
                path: "/dashboard/admin/products",
                element: <ALLProductsAdmin />
            },
            {
                path: "/dashboard/admin/register",
                element: <RegisterAdmin />
            }
        ]
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/signup",
        element: <PublicSignup />
    }
]);

export default Routes;