import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TransactionCard from "../components/TransactionCard";
import axiosClient from "../api/axiosClient";
import { MdAdd, MdClose } from "react-icons/md";

const INCOME_CATEGORIES = [
  "Salary", "Freelance", "Investment", "Business", "Gift", "Other Income",
];
const EXPENSE_CATEGORIES = [
  "Food", "Transport", "Shopping", "Entertainment", "Health",
  "Education", "Utilities", "Rent", "Travel", "Other Expense",
];

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [form, setForm] = useState({
    type: "expense",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Reset category when type changes
      ...(name === "type" ? { category: "" } : {}),
    }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount) {
      setFormError("Category and amount are required");
      return;
    }
    if (parseFloat(form.amount) <= 0) {
      setFormError("Amount must be greater than 0");
      return;
    }
    try {
      setSubmitting(true);
      await axiosClient.post("/transactions", form);
      setShowModal(false);
      setForm({
        type: "expense",
        category: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      fetchTransactions();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to add transaction");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await axiosClient.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      if (import.meta.env.MODE !== "production") console.error(err);
    }
  };

  const categories = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

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
                {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
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

          {/* Filters */}
          <div className="transactions-filters">
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setFilterCategory(""); }}
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
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Transaction List */}
          <div className="card">
            {loading ? (
              <div className="loader"><div className="spinner" /></div>
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

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add Transaction</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <MdClose />
              </button>
            </div>

            <div className="type-toggle">
              <button
                type="button"
                className={`type-btn ${form.type === "expense" ? "active expense" : ""}`}
                onClick={() => setForm({ ...form, type: "expense", category: "" })}
              >
                💸 Expense
              </button>
              <button
                type="button"
                className={`type-btn ${form.type === "income" ? "active income" : ""}`}
                onClick={() => setForm({ ...form, type: "income", category: "" })}
              >
                💰 Income
              </button>
            </div>

            {formError && <div className="error-message">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category</label>
                <select
                  id="category"
                  className="form-select"
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="amount">Amount (₹)</label>
                <input
                  id="amount"
                  className="form-input"
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Description (optional)</label>
                <input
                  id="description"
                  className="form-input"
                  type="text"
                  name="description"
                  placeholder="e.g. Monthly salary, Grocery shopping..."
                  value={form.description}
                  onChange={handleFormChange}
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="date">Date</label>
                <input
                  id="date"
                  className="form-input"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  disabled={submitting}
                >
                  {submitting ? "Adding..." : "Add Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
