import { NavLink, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdSwapHoriz,
  MdLogout,
} from "react-icons/md";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: <MdDashboard /> },
  { to: "/transactions", label: "Transactions", icon: <MdSwapHoriz /> },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">💰</div>
        <span>ExpenseIQ</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-item${isActive ? " active" : ""}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={handleLogout}>
          <MdLogout size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
