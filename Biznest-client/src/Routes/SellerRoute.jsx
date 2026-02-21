import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../Hooks/useAuth";

const SellerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <progress className="progress w-56"></progress>;
  }

  if (user && user.role?.type === "seller") {
    return children;
  }

  return <Navigate to="/" state={{ from: location }} replace></Navigate>;
};

export default SellerRoute;
