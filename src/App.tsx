import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { Login } from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import { AuthProvider } from "./utility/AuthContext";
import { ProtectedRoute } from "./utility/utility";

export default function App() {
  const user = JSON.parse(localStorage.getItem("user") || "null"); // logged in detail
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              user ? (
                <Navigate
                  to={
                    user?.role === "ADMIN"
                      ? "/admin/dashboard"
                      : "/employee/dashboard"
                  }
                  replace
                />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback route for unauthorized access */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
