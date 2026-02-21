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
import ReplyContactMsg from "../Pages/Profile/ReplyContactMsg";
import ShowCart from "../Pages/Cart/ShowCart/ShowCart";
import ProcessPayment from "../Pages/Cart/ProcessPayment/ProcessPayment";
import MyProducts from "../Pages/Dashboards/SellerDashboard/MyProductsList/Myproducts";
import AddProducts from "../Pages/Dashboards/SellerDashboard/AddProducts/Addproducts";
import ALLProductsAdmin from "../Pages/Dashboards/AdminDashboard/All Prodcuts Admin/ALLProductsAdmin";
import RegisterAdmin from "../Pages/Dashboards/AdminDashboard/RegisterAdmin/RegisterAdmin";
import Feedback from "../Pages/Dashboards/AdminDashboard/FeedBacks/Feedback";
import DashboardDefault from "../Pages/Dashboards/DashboardDefault";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import SellerRoute from "./SellerRoute";

const Routes = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <DefaultHome />,
      },
      {
        path: "/customer-home",
        element: (
          <PrivateRoute>
            <CustomerHome />
          </PrivateRoute>
        ),
      },
      {
        path: "/seller-home",
        element: (
          <SellerRoute>
            <SellerHome />
          </SellerRoute>
        ),
      },
      {
        path: "/admin-home",
        element: (
          <AdminRoute>
            <AdminHome />
          </AdminRoute>
        ),
      },
      {
        path: "/help-nd-support",
        element: <Help_nd_Support />,
      },
      {
        path: "/allproducts",
        element: <AllProducts />,
      },
      {
        path: "/profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "/profile/contact-messages",
        element: (
          <PrivateRoute>
            <ReplyContactMsg />
          </PrivateRoute>
        ),
      },
      {
        path: "/cart",
        element: (
          <PrivateRoute>
            <ShowCart />
          </PrivateRoute>
        ),
      },
      {
        path: "/payment",
        element: (
          <PrivateRoute>
            <ProcessPayment />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardDefault />,
      },
      {
        path: "/dashboard/seller/products",
        element: (
          <SellerRoute>
            <MyProducts />
          </SellerRoute>
        ),
      },
      {
        path: "/dashboard/seller/add-product",
        element: (
          <SellerRoute>
            <AddProducts />
          </SellerRoute>
        ),
      },
      {
        path: "/dashboard/admin/products",
        element: (
          <AdminRoute>
            <ALLProductsAdmin />
          </AdminRoute>
        ),
      },
      {
        path: "/dashboard/admin/register",
        element: (
          <AdminRoute>
            <RegisterAdmin />
          </AdminRoute>
        ),
      },
      {
        path: "/dashboard/admin/feedback",
        element: (
          <AdminRoute>
            <Feedback />
          </AdminRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <PublicSignup />,
  },
]);

export default Routes;
