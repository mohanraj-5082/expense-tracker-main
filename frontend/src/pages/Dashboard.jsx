import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TransactionCard from "../components/TransactionCard";
import { IncomeExpenseChart, CategoryPieChart } from "../components/Chart";
import axiosClient from "../api/axiosClient";
import { formatCurrency } from "../utils/currencyFormatter";

const Dashboard = () => {
  const [summary, setSummary] = useState({ balance: 0, totalIncome: 0, totalExpense: 0 });
  const [recentTx, setRecentTx] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, txRes, monthlyRes, catRes] = await Promise.all([
        axiosClient.get("/transactions/summary"),
        axiosClient.get("/transactions?limit=5"),
        axiosClient.get("/transactions/monthly"),
        axiosClient.get("/transactions/category-stats?type=expense"),
      ]);
      setSummary(summaryRes.data.data);
      setRecentTx(txRes.data.data.slice(0, 6));
      setMonthlyData(monthlyRes.data.data);
      setCategoryData(catRes.data.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Dashboard" />
        <main className="page-content">
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Your financial summary at a glance</p>

          {/* Stat Cards */}
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-label">
                <div className="stat-icon blue">💳</div>
                Total Balance
              </div>
              <div className={`stat-value ${summary.balance >= 0 ? "" : "red"}`}>
                {formatCurrency(summary.balance)}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">
                <div className="stat-icon green">📈</div>
                Total Income
              </div>
              <div className="stat-value green">
                {formatCurrency(summary.totalIncome)}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">
                <div className="stat-icon red">📉</div>
                Total Expenses
              </div>
              <div className="stat-value red">
                {formatCurrency(summary.totalExpense)}
              </div>
            </div>
          </div>

          {/* Charts + Recent Transactions */}
          <div className="dashboard-grid">
            <div>
              <div className="card">
                <div className="section-header">
                  <span className="section-title">Income vs Expense</span>
                  <span className="section-badge">Last 6 months</span>
                </div>
                {loading ? (
                  <div className="loader"><div className="spinner" /></div>
                ) : (
                  <IncomeExpenseChart data={monthlyData} />
                )}
              </div>

              <div className="card" style={{ marginTop: 24 }}>
                <div className="section-header">
                  <span className="section-title">Recent Transactions</span>
                </div>
                {loading ? (
                  <div className="loader"><div className="spinner" /></div>
                ) : recentTx.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <p>No transactions yet. Add your first one!</p>
                  </div>
                ) : (
                  recentTx.map((tx) => (
                    <TransactionCard key={tx._id} transaction={tx} />
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="card">
                <div className="section-header">
                  <span className="section-title">Spending by Category</span>
                </div>
                {loading ? (
                  <div className="loader"><div className="spinner" /></div>
                ) : (
                  <CategoryPieChart data={categoryData} />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
