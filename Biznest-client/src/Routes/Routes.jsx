import { createBrowserRouter } from "react-router-dom";
import Layout from "../Layout/Layout";
import ErrorPage from "../ErrorPage/ErrorPage";
import Login from "../Shared/Login";
import PublicSignup from "../Shared/PublicSignup";
import CustomerHome from "../Pages/Homepage/CustomerHome";
import SellerHome from "../Pages/Homepage/SellerHome";

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