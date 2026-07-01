import { Navigate, Outlet } from "react-router-dom";

/*
  ProtectedRoute
  - checks user login
  - protects private pages (cart, checkout, orders etc.)
*/

function ProtectedRoute() {
  const user = JSON.parse(localStorage.getItem("user"));

  // NOT LOGGED IN → redirect login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // LOGGED IN → allow access
  return <Outlet />;
}

export default ProtectedRoute;