import { useAuth } from "../context/AuthContext";


const Navbar = ({ title }) => {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="navbar">
      <h1 className="navbar-title">{title || "Dashboard"}</h1>
      <div className="navbar-right">
        <div className="user-badge">
          <div className="avatar">{initials}</div>
          <span className="user-name">{user?.name || "User"}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
