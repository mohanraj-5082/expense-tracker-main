import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Validation helpers ────────────────────────────────────────────────────

const validateName = (name) => {
  const trimmed = name.trim();
  if (!trimmed) return "Full name is required";
  if (!/^[a-zA-Z\s]+$/.test(trimmed))
    return "Name must contain only alphabets and spaces";
  if (trimmed.length < 2) return "Name must be at least 2 characters";
  if (trimmed.length > 50) return "Name cannot exceed 50 characters";
  return "";
};

const validateEmail = (email) => {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
    return "Please provide a valid email address (e.g. abc@example.com)";
  return "";
};

const getPasswordErrors = (password) => {
  const errors = [];
  if (!password) return ["Password is required"];
  if (password.length < 8) errors.push("At least 8 characters");
  if (password.length > 16) errors.push("No more than 16 characters");
  if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("At least one lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("At least one number");
  if (!/[@#$%^&*!?~`\-_+=<>|\\/.,'"`;:()[\]{}]/.test(password))
    errors.push("At least one special character (@, #, $, %…)");
  return errors;
};

// ─── Component ─────────────────────────────────────────────────────────────

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // Field-specific error strings
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Live password requirement hints (array)
  const [pwErrors, setPwErrors] = useState([]);

  // General / server error
  const [serverError, setServerError] = useState("");

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    setServerError("");

    // Clear field error on change so it re-validates on blur / submit
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    // Live password hints while typing
    if (name === "password") {
      setPwErrors(getPasswordErrors(value));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let errorMsg = "";

    if (name === "name") errorMsg = validateName(value);
    if (name === "email") errorMsg = validateEmail(value);
    if (name === "password") {
      const issues = getPasswordErrors(value);
      errorMsg = issues.length > 0 ? issues[0] : "";
    }

    setFieldErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    // Run all validations
    const nameErr = validateName(form.name);
    const emailErr = validateEmail(form.email);
    const pwIssues = getPasswordErrors(form.password);
    const passwordErr = pwIssues.length > 0 ? pwIssues[0] : "";

    if (nameErr || emailErr || passwordErr) {
      setFieldErrors({ name: nameErr, email: emailErr, password: passwordErr });
      setPwErrors(pwIssues);
      return; // prevent submission – valid inputs are preserved
    }

    const result = await register(form.name, form.email, form.password);
    if (result.success) {
      navigate(result.role === "admin" ? "/admin" : "/dashboard");
    } else {
      // Server-side errors (e.g. duplicate email)
      setServerError(result.message || "Registration failed. Please try again.");
    }
  };

  const passwordStrengthOk = form.password && pwErrors.length === 0;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-circle">💰</div>
        </div>

        <h2 className="auth-title">Create account</h2>
        <p className="auth-subtitle">Start tracking your expenses today</p>

        {/* General server error (e.g. duplicate email) */}
        {serverError && (
          <div className="error-message" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Full Name ── */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              className={`form-input${fieldErrors.name ? " input-error" : ""}`}
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="name"
            />
            {fieldErrors.name && (
              <p className="field-error" role="alert">
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* ── Email ── */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
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
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className={`form-input${fieldErrors.password ? " input-error" : ""}`}
              type="password"
              name="password"
              placeholder="Min. 8 characters, max. 16"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="new-password"
              maxLength={16}
            />

            {/* Live password requirement hints while typing */}
            {form.password && pwErrors.length > 0 && (
              <ul className="pw-hints" aria-label="Password requirements">
                {pwErrors.map((msg) => (
                  <li key={msg} className="pw-hint-error">
                    ✗ {msg}
                  </li>
                ))}
              </ul>
            )}

            {/* All requirements met indicator */}
            {passwordStrengthOk && (
              <p className="pw-hint-ok">✓ Password meets all requirements</p>
            )}

            {/* Field-level error shown on blur / submit when not typing */}
            {fieldErrors.password && !form.password && (
              <p className="field-error" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            id="register-submit"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link" id="sign-in-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
