import { createBrowserRouter } from "react-router-dom";
import Layout from "../Layout/Layout";
import ErrorPage from "../ErrorPage/ErrorPage";
import Login from "../Shared/Login";
import PublicSignup from "../Shared/PublicSignup";
import Home from "../Pages/Homepage/Home";

const Routes = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: <Home />
            },

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