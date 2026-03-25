import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(null); // ID of user being verified

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axiosClient.get("/admin/users");
      setUsers(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleVerify = async (userId) => {
    setVerifying(userId);
    try {
      await axiosClient.patch(`/admin/users/${userId}/verify`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, verified: true } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to verify user");
    } finally {
      setVerifying(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="logo-circle" style={{ fontSize: 22 }}>🛡️</div>
          <span className="admin-brand">Admin Panel</span>
        </div>
        <div className="admin-header-right">
          <span className="admin-user-badge">👤 {user?.name}</span>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="admin-main">
        <div className="admin-title-row">
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>User Management</h1>
            <p className="page-subtitle" style={{ margin: "4px 0 0" }}>
              View and verify registered users
            </p>
          </div>
          <button className="btn btn-secondary" onClick={fetchUsers} disabled={loading}>
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="admin-empty">No users found.</td>
                  </tr>
                ) : (
                  users.map((u, idx) => (
                    <tr key={u._id} className={u.role === "admin" ? "admin-row" : ""}>
                      <td>{idx + 1}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge role-${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`verified-badge ${u.verified ? "verified-yes" : "verified-no"}`}>
                          {u.verified ? "✓ Verified" : "✗ Pending"}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {u.role !== "admin" && !u.verified ? (
                          <button
                            className="btn-verify"
                            onClick={() => handleVerify(u._id)}
                            disabled={verifying === u._id}
                          >
                            {verifying === u._id ? "Verifying…" : "Verify"}
                          </button>
                        ) : (
                          <span className="admin-no-action">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary strip */}
        <div className="admin-summary">
          <div className="admin-stat">
            <span className="admin-stat-value">{users.length}</span>
            <span className="admin-stat-label">Total Users</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-value">{users.filter((u) => u.verified).length}</span>
            <span className="admin-stat-label">Verified</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-value">{users.filter((u) => !u.verified).length}</span>
            <span className="admin-stat-label">Pending</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-value">{users.filter((u) => u.role === "admin").length}</span>
            <span className="admin-stat-label">Admins</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
