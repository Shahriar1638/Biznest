import { createBrowserRouter } from "react-router-dom";
import Layout from "../Layout/Layout";
import ErrorPage from "../ErrorPage/ErrorPage";
import Login from "../Shared/AuthPage/Login";
import PublicSignup from "../Shared/AuthPage/PublicSignup";
import CustomerHome from "../Pages/Homepage/CustomerHome";
import SellerHome from "../Pages/Homepage/SellerHome";
import DefaultHome from "../Pages/Homepage/DefaultHome";
import Help_nd_Support from "../Pages/Help_nd_Support/Help_nd_Support";
import AllProducts from "../Pages/All Products/AllProducts";
import Profile from "../Pages/Profile/profile";
import ShowCart from "../Pages/Cart/ShowCart/ShowCart";
import ProcessPayment from "../Pages/Cart/ProcessPayment/ProcessPayment";

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
        path: "/login",
        element: <Login />
    },
    {
        path: "/signup",
        element: <PublicSignup />
    }
]);

export default Routes;