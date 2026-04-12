import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Injection guard (client-side, first line of defence) ────────────────────
const SQL_RE =
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|WHERE|HAVING|SLEEP|BENCHMARK)\b)|(-{2,}|\/\*[\s\S]*?\*\/)|'?\s*OR\s+'?\s*[\w'"]+\s*=\s*[\w'"]+/i;
const NOSQL_RE =
  /(\$where|\$gt|\$lt|\$gte|\$lte|\$ne|\$in|\$nin|\$or|\$and|\$regex|\$expr)/i;
const containsInjection = (val) =>
  typeof val === "string" && (SQL_RE.test(val) || NOSQL_RE.test(val));

// ─── Validation helpers ────────────────────────────────────────────────────
const validateEmail = (email) => {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required";
  if (containsInjection(trimmed))
    return "Email contains invalid characters or patterns";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
    return "Please enter a valid email address (e.g. abc@example.com)";
  return "";
};

const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (containsInjection(password))
    return "Password contains invalid characters or patterns";
  return "";
};

// ─── Component ─────────────────────────────────────────────────────────────
const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [serverError, setServerError] = useState("");

  // ─── Handlers ─────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let err = "";
    if (name === "email") err = validateEmail(value);
    if (name === "password") err = validatePassword(value);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    // Run all validations
    const emailErr = validateEmail(form.email);
    const passErr = validatePassword(form.password);

    if (emailErr || passErr) {
      setFieldErrors({ email: emailErr, password: passErr });
      return; // Prevent submission — valid inputs are preserved
    }

    const result = await login(form.email, form.password);
    if (result.success) {
      navigate(result.role === "admin" ? "/admin" : "/dashboard");
    } else {
      // Server error (wrong credentials, blocked, etc.) — do NOT expose details
      setServerError(result.message || "Invalid email or password. Please try again.");
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-circle">💰</div>
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to manage your finances</p>

        {/* Server / auth error */}
        {serverError && (
          <div className="error-message" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Email ── */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className={`form-input${fieldErrors.email ? " input-error" : ""}`}
              type="email"
              name="email"
              placeholder="abc@example.com"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
            />
            {fieldErrors.email && (
              <p className="field-error" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* ── Password ── */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className={`form-input${fieldErrors.password ? " input-error" : ""}`}
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="current-password"
              maxLength={16}
            />
            {fieldErrors.password && (
              <p className="field-error" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            id="login-submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="auth-link" id="create-account-link">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
