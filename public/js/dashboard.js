
const form = document.getElementById("transactionForm");
const list = document.getElementById("transactionList");

const transactionDateInput =
    document.getElementById("transactionDate");

function getTodayLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

transactionDateInput.value = getTodayLocalDate();

let allTransactions = [];
let currentPage = 1;
const transactionsPerPage = 5;

function displayFilteredTransactions() {
    const search = document
        .getElementById("searchTransaction")
        .value.toLowerCase().trim();

    const type = document
        .getElementById("filterType").value;

    const category = document
        .getElementById("filterCategory").value;

    const filtered = allTransactions.filter(item => {
        const matchesSearch = item.title
            .toLowerCase()
            .includes(search);

        const matchesType =
            type === "all" || item.type === type;

        const matchesCategory =
            category === "all" ||
            item.category === category;

        return matchesSearch &&
               matchesType &&
               matchesCategory;
    });

    const totalPages = Math.max(
        1,
        Math.ceil(filtered.length / transactionsPerPage)
    );

    currentPage = Math.min(
        Math.max(currentPage, 1),
        totalPages
    );

    const start = (currentPage - 1) * transactionsPerPage;

    const pageTransactions = filtered.slice(
        start,
        start + transactionsPerPage
    );

    list.replaceChildren();

    pageTransactions.forEach(item => {
        list.appendChild(createTransactionItem(item));
    });

    if (filtered.length === 0) {
        list.textContent = "No matching transactions found.";
    }

    document.getElementById("transactionCount")
        .textContent =
        `Showing ${pageTransactions.length} of ${filtered.length} matching transactions (${allTransactions.length} total)`;

    document.getElementById("pageInfo")
        .textContent = `Page ${currentPage} of ${totalPages}`;

    document.getElementById("prevPage").disabled =
        currentPage === 1;

    document.getElementById("nextPage").disabled =
        currentPage === totalPages;

    document.getElementById("paginationControls").hidden =
        filtered.length <= transactionsPerPage;
}
 {
    const search = document
        .getElementById("searchTransaction")
        .value.toLowerCase().trim();

    const type = document
        .getElementById("filterType").value;

    const category = document
        .getElementById("filterCategory").value;

    const filtered = allTransactions.filter(item => {
        const matchesSearch = item.title
            .toLowerCase()
            .includes(search);

        const matchesType =
            type === "all" || item.type === type;

        const matchesCategory =
            category === "all" ||
            item.category === category;

        return matchesSearch &&
               matchesType &&
               matchesCategory;
    });

    list.replaceChildren();

    filtered.forEach(item => {
        list.appendChild(createTransactionItem(item));
    });

    if (filtered.length === 0) {
        list.textContent = "No matching transactions found.";
    }

    document.getElementById("transactionCount")
        .textContent =
        `Showing ${filtered.length} of ${allTransactions.length} transactions`;
}

const message = document.getElementById("dashboardMessage");

const money = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
});

async function api(url, options = {}) {
    const response = await fetch(url, {
        credentials: "same-origin",
        ...options
    });

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 401) {
            window.location.replace("/login.html");
        }
        throw new Error(data.message || "Request failed");
    }

    return data;
}

async function loadUser() {
    const data = await api("/api/auth/me");

    document.getElementById("welcomeText").textContent =
        `Welcome, ${data.user.name}!`;
}

function createTransactionItem(item) {
    const row = document.createElement("div");
    row.className = "transaction-item";

    const details = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = item.title;

    
const category = document.createElement("p");

const transactionDate = new Date(item.date);

const formattedDate = transactionDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
});

category.textContent = `${item.category} · ${formattedDate}`;

details.append(title, category);


    const actions = document.createElement("div");
    actions.className = "transaction-actions";

    const amount = document.createElement("strong");
    amount.className =
        item.type === "income" ? "income" : "expense";

    amount.textContent =
        (item.type === "income" ? "+" : "-") +
        money.format(item.amount);

const edit = document.createElement("button");
edit.type = "button";
edit.textContent = "Edit";

edit.addEventListener("click", () => {
    openEditTransaction(item);
});

    const remove = document.createElement("button");
    remove.textContent = "Delete";

    remove.addEventListener("click", async () => {
        if (!confirm("Delete this transaction?")) return;

        try {
            await api(`/api/transactions/${item._id}`, {
                method: "DELETE"
            });
            await loadTransactions();
        } catch (error) {
            message.textContent = error.message;
        }
    });

    actions.append(amount, edit, remove);
    row.append(details, actions);

    return row;
}

function openEditTransaction(item) {
    const panel = document.getElementById("editTransactionPanel");

    document.getElementById("editTransactionId").value = item._id;
    document.getElementById("editTitle").value = item.title;
    document.getElementById("editAmount").value = item.amount;
    document.getElementById("editType").value = item.type;
    document.getElementById("editCategory").value = item.category;

    // The date is stored as an ISO string in MongoDB.
    document.getElementById("editDate").value =
        new Date(item.date).toISOString().slice(0, 10);

    document.getElementById("editMessage").textContent = "";

    panel.hidden = false;
    panel.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

document.getElementById("cancelEdit")
    .addEventListener("click", () => {
        document.getElementById("editTransactionPanel").hidden = true;
    });

document.getElementById("editTransactionForm")
    .addEventListener("submit", async event => {
        event.preventDefault();

        const id = document.getElementById("editTransactionId").value;
        const editMessage = document.getElementById("editMessage");

        const updatedTransaction = {
            title: document.getElementById("editTitle").value,
            amount: Number(document.getElementById("editAmount").value),
            type: document.getElementById("editType").value,
            category: document.getElementById("editCategory").value,
            date: document.getElementById("editDate").value
        };

        try {
            await api(`/api/transactions/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedTransaction)
            });

            document.getElementById("editTransactionPanel").hidden = true;

            await loadTransactions();
            await loadBudget();

            message.textContent = "Transaction updated successfully!";

        } catch (error) {
            editMessage.textContent = error.message;
        }
    });

async function loadTransactions() {
    const transactions = await api("/api/transactions");
    allTransactions = transactions;
updateExpenseChart(transactions);
updateMonthlyChart(transactions);
    let income = 0;
    let expenses = 0;

    
transactions.forEach(item => {
    if (item.type === "income") {
        income += item.amount;
    } else {
        expenses += item.amount;
    }
});

displayFilteredTransactions();


    document.getElementById("income").textContent =
        money.format(income);

    document.getElementById("expenses").textContent =
        money.format(expenses);

    document.getElementById("balance").textContent =
        money.format(income - expenses);

}

form.addEventListener("submit", async event => {
    event.preventDefault();
    message.textContent = "";

    

const transaction = {
    title: document.getElementById("title").value,
    amount: Number(document.getElementById("amount").value),
    type: document.getElementById("type").value,
    category: document.getElementById("category").value,
    date: transactionDateInput.value
};



    try {
        await api("/api/transactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(transaction)
        });

        
form.reset();
transactionDateInput.value = getTodayLocalDate();

message.textContent = "Transaction saved!";

await loadTransactions();
await loadBudget();


    } catch (error) {
        message.textContent = error.message;
    }
});

document.getElementById("logoutBtn")
    .addEventListener("click", async () => {
        try {
            await api("/api/auth/logout", {
                method: "POST"
            });

            window.location.replace("/login.html");
        } catch (error) {
            message.textContent = error.message;
        }
    });

async function initialize() {
    try {
        await loadUser();
        await loadTransactions();
        await loadBudget();
    } catch (error) {
        message.textContent = error.message;
    }
}

initialize();

let expenseChart = null;

function updateExpenseChart(transactions) {
    const totals = {};

    transactions
        .filter(item => item.type === "expense")
        .forEach(item => {
            totals[item.category] =
                (totals[item.category] || 0) + item.amount;
        });

    const categories = Object.keys(totals);
    const amounts = Object.values(totals);

    const emptyMessage =
        document.getElementById("chartEmptyMessage");

    if (expenseChart) {
        expenseChart.destroy();
        expenseChart = null;
    }

    if (categories.length === 0) {
        emptyMessage.textContent =
            "Add an expense to see your chart.";
        return;
    }

    emptyMessage.textContent = "";

    if (typeof Chart === "undefined") {
        emptyMessage.textContent =
            "Chart library could not load.";
        return;
    }

    const canvas = document.getElementById("expenseChart");

    expenseChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: [
                    "#22c55e",
                    "#3b82f6",
                    "#f59e0b",
                    "#a855f7",
                    "#ef4444",
                    "#06b6d4",
                    "#ec4899"
                ],
                borderColor: "#151e30",
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "#f8fafc",
                        padding: 16
                    }
                }
            }
        }
    });
}

let monthlyChart = null;

function updateMonthlyChart(transactions) {
    const now = new Date();

    const months = [];
    const incomeData = Array(6).fill(0);
    const expenseData = Array(6).fill(0);

    for (let i = 5; i >= 0; i--) {
        const date = new Date(
            now.getFullYear(),
            now.getMonth() - i,
            1
        );

        months.push(date);
    }

    transactions.forEach(item => {
        const date = new Date(item.date);

        const index = months.findIndex(month =>
            month.getFullYear() === date.getFullYear() &&
            month.getMonth() === date.getMonth()
        );

        if (index === -1) return;

        if (item.type === "income") {
            incomeData[index] += item.amount;
        } else {
            expenseData[index] += item.amount;
        }
    });

    const labels = months.map(date =>
        date.toLocaleDateString("en-IN", {
            month: "short",
            year: "2-digit"
        })
    );

    if (monthlyChart) {
        monthlyChart.destroy();
    }

    if (typeof Chart === "undefined") {
        return;
    }

    monthlyChart = new Chart(
        document.getElementById("monthlyChart"),
        {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: "Income",
                        data: incomeData,
                        backgroundColor: "#22c55e",
                        borderRadius: 6
                    },
                    {
                        label: "Expenses",
                        data: expenseData,
                        backgroundColor: "#fb7185",
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: { color: "#94a3b8" },
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: "#94a3b8",
                            callback: value => "₹" + value
                        },
                        grid: {
                            color: "#334155"
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: "#f8fafc"
                        }
                    }
                }
            }
        }
    );
}

async function loadBudget() {
    try {
        const data = await api("/api/budget");

        const limit = data.limit;
        const spent = data.spent;

        const percentage = limit > 0
            ? (spent / limit) * 100
            : 0;

        document.getElementById("budgetAmount")
            .textContent =
            `${money.format(spent)} / ${money.format(limit)}`;

        document.getElementById("budgetPercentage")
            .textContent =
            limit > 0
                ? `${percentage.toFixed(1)}% used`
                : "No budget set";

        const bar = document.getElementById(
            "budgetProgressBar"
        );

        bar.style.width =
            `${Math.min(percentage, 100)}%`;

        const status = document.getElementById(
            "budgetStatus"
        );

        if (limit === 0) {
            bar.style.background = "#22c55e";
            status.textContent = "Set your monthly budget.";
        } else if (percentage >= 100) {
            bar.style.background = "#ef4444";
            status.textContent = "Budget limit reached!";
        } else if (percentage >= 80) {
            bar.style.background = "#f59e0b";
            status.textContent =
                "Warning: You're close to your budget limit.";
        } else {
            bar.style.background = "#22c55e";
            status.textContent =
                `${money.format(limit - spent)} remaining`;
        }
    } catch (error) {
        document.getElementById("budgetStatus")
            .textContent = error.message;
    }
}

document.getElementById("budgetForm")
    .addEventListener("submit", async event => {
        event.preventDefault();

        const monthlyLimit = Number(
            document.getElementById("budgetInput").value
        );

        try {
            await api("/api/budget", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ monthlyLimit })
            });

            await loadBudget();
        } catch (error) {
            document.getElementById("budgetStatus")
                .textContent = error.message;
        }
    });

document.getElementById("searchTransaction")
    .addEventListener("input", () => {
        currentPage = 1;
        displayFilteredTransactions();
    });


document.getElementById("filterType")
    .addEventListener("change", () => {
        currentPage = 1;
        displayFilteredTransactions();
    });

document.getElementById("filterCategory")
    .addEventListener("change", () => {
        currentPage = 1;
        displayFilteredTransactions();
    });


document.getElementById("clearFilters")
    .addEventListener("click", () => {

        document.getElementById("searchTransaction").value = "";

        document.getElementById("filterType").value = "all";

        document.getElementById("filterCategory").value = "all";

        displayFilteredTransactions();
    });

function escapeCSV(value) {
    let text = String(value ?? "");

    // Prevent spreadsheet formula execution.
    if (/^[\s]*[=+\-@\t\r]/.test(text)) {
        text = "'" + text;
    }

    return '"' + text.replace(/"/g, '""') + '"';
}

function exportTransactionsCSV() {
    if (allTransactions.length === 0) {
        alert("No transactions available to export.");
        return;
    }

    const headers = [
        "Date",
        "Title",
        "Type",
        "Category",
        "Amount (INR)"
    ];

    const rows = allTransactions.map(item => [
        new Date(item.date).toLocaleDateString("en-CA"),
        item.title,
        item.type,
        item.category,
        item.amount
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(escapeCSV).join(","))
        .join("\r\n");

    // UTF-8 BOM helps Excel display ₹ and other Unicode text.
    const blob = new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "SpendWise_Transactions.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

document.getElementById("exportCSV")
    .addEventListener("click", exportTransactionsCSV);

document.getElementById("prevPage")
    .addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            displayFilteredTransactions();
        }
    });

document.getElementById("nextPage")
    .addEventListener("click", () => {
        currentPage++;
        displayFilteredTransactions();
    });
