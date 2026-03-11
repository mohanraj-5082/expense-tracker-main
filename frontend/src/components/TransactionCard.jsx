import { MdTrendingUp, MdTrendingDown, MdDelete } from "react-icons/md";
import { formatCurrency, formatDate } from "../utils/currencyFormatter";

const categoryEmojis = {
  Salary: "💼",
  Freelance: "💻",
  Investment: "📈",
  Business: "🏢",
  Gift: "🎁",
  "Other Income": "💰",
  Food: "🍔",
  Transport: "🚗",
  Shopping: "🛍️",
  Entertainment: "🎬",
  Health: "🏥",
  Education: "📚",
  Utilities: "💡",
  Rent: "🏠",
  Travel: "✈️",
  "Other Expense": "💸",
};

const TransactionCard = ({ transaction, onDelete }) => {
  const isIncome = transaction.type === "income";
  const emoji = categoryEmojis[transaction.category] || (isIncome ? "💰" : "💸");

  return (
    <div className="transaction-card">
      <div className={`tx-icon ${transaction.type}`}>
        {emoji}
      </div>

      <div className="tx-info">
        <div className="tx-category">{transaction.category}</div>
        <div className="tx-description">
          {transaction.description || (isIncome ? "Income" : "Expense")}
        </div>
        <div className="tx-date">{formatDate(transaction.date)}</div>
      </div>

      <div className={`tx-amount ${transaction.type}`}>
        {isIncome ? "+" : "-"}
        {formatCurrency(transaction.amount)}
      </div>

      {onDelete && (
        <button
          className="tx-delete"
          onClick={() => onDelete(transaction._id)}
          title="Delete transaction"
        >
          <MdDelete />
        </button>
      )}
    </div>
  );
};

export default TransactionCard;
