import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TransactionCard from "../components/TransactionCard";
import Toast from "../components/Toast";
import axiosClient from "../api/axiosClient";
import { MdAdd, MdClose } from "react-icons/md";

// ─── Category lists (must match backend enum) ─────────────────────────────
const INCOME_CATEGORIES = [
  "Salary", "Freelance", "Investment", "Business", "Gift", "Other Income",
];
const EXPENSE_CATEGORIES = [
  "Food", "Transport", "Shopping", "Entertainment", "Health",
  "Education", "Utilities", "Rent", "Travel", "Other Expense",
];

// ─── Constants ────────────────────────────────────────────────────────────
const MAX_AMOUNT = 9999999.99;
const XSS_PATTERN = /[<>"'`]/;

// ─── Helpers ──────────────────────────────────────────────────────────────
const stripXss = (v) =>
  typeof v === "string" ? v.replace(/[<>"'`]/g, "") : v;

const emptyForm = () => ({
  type: "expense",
  category: "",
  amount: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
});

const emptyErrors = () => ({
  category: "",
  amount: "",
  description: "",
  date: "",
});

// ─── Validators ───────────────────────────────────────────────────────────
const validateCategory = (v) =>
  !v ? "Please select a category" : "";

const validateAmount = (v) => {
  if (v === "" || v === null || v === undefined) return "Amount is required";
  const num = parseFloat(v);
  if (isNaN(num) || !isFinite(num)) return "Please enter a valid number";
  if (num <= 0) return "Amount must be greater than 0";
  if (num > MAX_AMOUNT) return "Amount cannot exceed ₹9,999,999.99";
  const dec = String(v).split(".")[1];
  if (dec && dec.length > 2) return "Maximum 2 decimal places allowed";
  return "";
};

const validateDescription = (v) => {
  if (!v) return "";
  if (XSS_PATTERN.test(v)) return "Description contains invalid characters (< > \" ' `)";
  if (v.length > 200) return `Description too long (${v.length}/200)`;
  return "";
};

const validateDate = (v) => {
  if (!v) return "Date is required";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "Please enter a valid date";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);
  if (d > tomorrow) return "Date cannot be in the future";
  return "";
};

// ─── Component ────────────────────────────────────────────────────────────
const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [form, setForm] = useState(emptyForm());
  const [fieldErrors, setFieldErrors] = useState(emptyErrors());
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [xssWarning, setXssWarning] = useState(false);

  // Toast state: { message, type } | null
  const [toast, setToast] = useState(null);

  const amountRef = useRef(null);

  // ─── Show toast helper ──────────────────────────────────────────────
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // ─── Fetch transactions ─────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType) params.set("type", filterType);
      if (filterCategory) params.set("category", filterCategory);
      const { data } = await axiosClient.get(`/transactions?${params}`);
      setTransactions(data.data);
    } catch (err) {
      if (import.meta.env.MODE !== "production") console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterCategory]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // ─── ESC key closes modal ────────────────────────────────────────────
  useEffect(() => {
    if (!showModal) return;
    const handleKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showModal]);

  // ─── Prevent mouse-wheel from changing amount ────────────────────────
  useEffect(() => {
    const el = amountRef.current;
    if (!el) return;
    const prevent = (e) => e.preventDefault();
    el.addEventListener("wheel", prevent, { passive: false });
    return () => el.removeEventListener("wheel", prevent);
  }, [showModal]);

  // ─── Modal helpers ───────────────────────────────────────────────────
  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm());
    setFieldErrors(emptyErrors());
    setServerError("");
    setXssWarning(false);
  };

  // ─── Type toggle ─────────────────────────────────────────────────────
  const handleTypeToggle = (newType) => {
    if (form.type === newType) return; // already selected — no-op
    setForm((prev) => ({ ...prev, type: newType, category: "" }));
    setFieldErrors((prev) => ({ ...prev, category: "" }));
    setServerError("");
  };

  // ─── Field change handler ────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    // ── Amount: block non-numeric characters (e, E, +, -)
    if (name === "amount") {
      // Block negative input by clamping at 0 on a trailing minus
      const sanitizedAmt = value.replace(/[^0-9.]/g, "");
      // Allow only one decimal point
      const parts = sanitizedAmt.split(".");
      const fixedAmt =
        parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitizedAmt;

      setForm((prev) => ({ ...prev, amount: fixedAmt }));
      // Live validation on amount while typing
      const err = validateAmount(fixedAmt);
      setFieldErrors((prev) => ({ ...prev, amount: err }));
      setServerError("");
      return;
    }

    // ── Description: strip XSS chars, warn user
    if (name === "description") {
      if (XSS_PATTERN.test(value)) {
        setXssWarning(true);
        const sanitized = stripXss(value);
        setForm((prev) => ({ ...prev, description: sanitized }));
        setFieldErrors((prev) => ({ ...prev, description: "" }));
        return;
      }
      setXssWarning(false);
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const validators = {
      category: validateCategory,
      amount: validateAmount,
      description: validateDescription,
      date: validateDate,
    };
    if (validators[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validators[name](value) }));
    }
  };

  // ─── Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const errors = {
      category: validateCategory(form.category),
      amount: validateAmount(form.amount),
      description: validateDescription(form.description),
      date: validateDate(form.date),
    };

    if (Object.values(errors).some((err) => err !== "")) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      await axiosClient.post("/transactions", {
        ...form,
        description: stripXss(form.description),
        amount: parseFloat(form.amount),
      });

      closeModal();
      fetchTransactions();

      // Show success toast
      const typeLabel = form.type === "income" ? "Income" : "Expense";
      showToast(`${typeLabel} of ₹${parseFloat(form.amount).toFixed(2)} added successfully! 🎉`);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to add transaction. Please try again.";
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await axiosClient.delete(`/transactions/${id}`);
      fetchTransactions();
      showToast("Transaction deleted.", "warning");
    } catch (err) {
      showToast("Failed to delete transaction.", "error");
      if (import.meta.env.MODE !== "production") console.error(err);
    }
  };

  // ─── Derived ─────────────────────────────────────────────────────────
  const categories =
    form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const descLength = form.description.length;
  const charCounterClass =
    descLength >= 200
      ? "char-counter limit"
      : descLength >= 180
      ? "char-counter warn"
      : "char-counter";

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Transactions" />
        <main className="page-content">
          <div className="transactions-header">
            <div>
              <h1 className="page-title">Transactions</h1>
              <p className="page-subtitle">
                {transactions.length} transaction
                {transactions.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              className="btn btn-success"
              onClick={() => setShowModal(true)}
              id="add-transaction-btn"
            >
              <MdAdd size={20} />
              Add Transaction
            </button>
          </div>

          {/* ── Filters ── */}
          <div className="transactions-filters">
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterCategory("");
              }}
              id="filter-type"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <select
              className="filter-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              id="filter-category"
            >
              <option value="">All Categories</option>
              {(filterType === "income"
                ? INCOME_CATEGORIES
                : filterType === "expense"
                ? EXPENSE_CATEGORIES
                : [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]
              ).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* ── Transaction List ── */}
          <div className="card">
            {loading ? (
              <div className="loader">
                <div className="spinner" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💸</div>
                <p>No transactions found. Add your first one!</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <TransactionCard
                  key={tx._id}
                  transaction={tx}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </main>
      </div>

      {/* ── Add Transaction Modal ── */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title" id="modal-title">
                Add Transaction
              </h2>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="Close modal (Esc)"
                title="Close (Esc)"
              >
                <MdClose />
              </button>
            </div>

            {/* ── Type Toggle ── */}
            <div className="type-toggle" role="group" aria-label="Transaction type">
              <button
                type="button"
                className={`type-btn${form.type === "expense" ? " active expense" : ""}`}
                onClick={() => handleTypeToggle("expense")}
                aria-pressed={form.type === "expense"}
                id="type-expense"
              >
                💸 Expense
              </button>
              <button
                type="button"
                className={`type-btn${form.type === "income" ? " active income" : ""}`}
                onClick={() => handleTypeToggle("income")}
                aria-pressed={form.type === "income"}
                id="type-income"
              >
                💰 Income
              </button>
            </div>

            {/* Server / general error */}
            {serverError && (
              <div className="error-message" role="alert">
                {serverError}
              </div>
            )}

            {/* XSS strip warning */}
            {xssWarning && (
              <div className="warn-message" role="alert">
                ⚠ Some invalid characters were removed from the description.
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* ── Category ── */}
              <div className="form-group">
                <label className="form-label" htmlFor="tx-category">
                  Category <span className="label-required">*</span>
                </label>
                <select
                  id="tx-category"
                  className={`form-select${fieldErrors.category ? " select-error" : ""}`}
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  onBlur={handleBlur}
                >
                  <option value="" disabled>
                    Select category…
                  </option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {fieldErrors.category && (
                  <p className="field-error" role="alert">
                    {fieldErrors.category}
                  </p>
                )}
              </div>

              {/* ── Amount ── */}
              <div className="form-group">
                <label className="form-label" htmlFor="tx-amount">
                  Amount (₹) <span className="label-required">*</span>
                </label>
                <div className="amount-input-wrap">
                  <span className="amount-prefix">₹</span>
                  <input
                    id="tx-amount"
                    ref={amountRef}
                    className={`form-input amount-input${fieldErrors.amount ? " input-error" : ""}`}
                    type="text"
                    inputMode="decimal"
                    name="amount"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleFormChange}
                    onBlur={handleBlur}
                    autoComplete="off"
                  />
                </div>
                {fieldErrors.amount && (
                  <p className="field-error" role="alert">
                    {fieldErrors.amount}
                  </p>
                )}
                {!fieldErrors.amount && form.amount && parseFloat(form.amount) > 0 && (
                  <p className="field-success">
                    ✓ ₹{parseFloat(form.amount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                )}
              </div>

              {/* ── Description ── */}
              <div className="form-group">
                <label className="form-label" htmlFor="tx-description">
                  Description{" "}
                  <span className="label-optional">(optional)</span>
                </label>
                <input
                  id="tx-description"
                  className={`form-input${fieldErrors.description ? " input-error" : ""}`}
                  type="text"
                  name="description"
                  placeholder="e.g. Monthly salary, Grocery shopping…"
                  value={form.description}
                  onChange={handleFormChange}
                  onBlur={handleBlur}
                  maxLength={200}
                />
                <div className="desc-meta">
                  {fieldErrors.description ? (
                    <p className="field-error" role="alert">
                      {fieldErrors.description}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className={charCounterClass}>{descLength} / 200</span>
                </div>
              </div>

              {/* ── Date ── */}
              <div className="form-group">
                <label className="form-label" htmlFor="tx-date">
                  Date <span className="label-required">*</span>
                </label>
                <input
                  id="tx-date"
                  className={`form-input${fieldErrors.date ? " input-error" : ""}`}
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleFormChange}
                  onBlur={handleBlur}
                  max={new Date().toISOString().split("T")[0]}
                />
                {fieldErrors.date && (
                  <p className="field-error" role="alert">
                    {fieldErrors.date}
                  </p>
                )}
              </div>

              {/* ── Actions ── */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                  onClick={closeModal}
                  id="cancel-transaction"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary${submitting ? " btn-loading" : ""}`}
                  style={{ flex: 2 }}
                  disabled={submitting}
                  id="submit-transaction"
                >
                  {submitting ? (
                    <>
                      <span className="btn-spinner" />
                      Adding…
                    </>
                  ) : (
                    "Add Transaction"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Transactions;
