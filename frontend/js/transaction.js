const API_URL = "http://127.0.0.1:8000";

function setTransactionMessage(message, type = "") {
    const element = document.getElementById("transactionMessage");

    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = `transaction-message ${type}`.trim();
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

async function fetchJson(path, options) {
    const response = await fetch(`${API_URL}${path}`, options);
    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error(`Invalid response from ${path}`);
        }
    }

    if (!response.ok) {
        throw new Error(
            data?.detail || `Request failed with status ${response.status}`
        );
    }

    return data;
}

function setSelectOptions(
    selectId,
    items,
    valueField,
    labelField,
    emptyLabel
) {
    const select = document.getElementById(selectId);

    if (!select) {
        return;
    }

    select.innerHTML = `<option value="">${emptyLabel}</option>`;

    if (!Array.isArray(items)) {
        return;
    }

    // Prevent duplicate names in dropdown
    const seen = new Set();

    items.forEach(item => {
        const value = item[valueField];
        const label = item[labelField];

        if (
            value !== undefined &&
            label &&
            !seen.has(label)
        ) {
            seen.add(label);

            const option = document.createElement("option");
            option.value = value;
            option.textContent = label;

            select.appendChild(option);
        }
    });
}

function renderTransactions(transactions) {
    const table = document.getElementById("transactionTable");

    if (!table) {
        throw new Error("Transaction table was not found");
    }

    if (!Array.isArray(transactions) || transactions.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5">No transactions recorded yet.</td>
            </tr>
        `;
        return;
    }

    table.innerHTML = transactions.map(transaction => `
        <tr>
            <td>${escapeHtml(transaction.id)}</td>
            <td>${escapeHtml(transaction.customer_name)}</td>
            <td>${escapeHtml(transaction.product_name)}</td>
            <td>
                ₹${getNumber(transaction.amount).toLocaleString(
                    "en-IN",
                    { minimumFractionDigits: 2 }
                )}
            </td>
            <td>${escapeHtml(transaction.transaction_date)}</td>
        </tr>
    `).join("");
}

async function loadTransactions() {
    const table = document.getElementById("transactionTable");

    if (table) {
        table.innerHTML = `
            <tr>
                <td colspan="5">Loading transactions...</td>
            </tr>
        `;
    }

    try {
        const transactions = await fetchJson("/transactions/");
        renderTransactions(transactions);
    } catch (error) {
        if (table) {
            table.innerHTML = `
                <tr>
                    <td colspan="5">
                        Unable to load transactions. Please try again.
                    </td>
                </tr>
            `;
        }

        setTransactionMessage(
            error.message || "Unable to load transactions.",
            "error"
        );
    }
}

async function loadTransactionReferences() {
    const [productsResult, vendorsResult] = await Promise.allSettled([
        fetchJson("/products/"),
        fetchJson("/vendors/")
    ]);

    const failures = [];

    if (productsResult.status === "fulfilled") {
        setSelectOptions(
            "productName",
            productsResult.value,
            "product_name",
            "product_name",
            "Select Product"
        );
    } else {
        failures.push("products");
    }

    if (vendorsResult.status === "fulfilled") {
        setSelectOptions(
            "vendorId",
            vendorsResult.value,
            "id",
            "business_name",
            "Select Vendor"
        );
    } else {
        failures.push("vendors");
    }

    if (failures.length) {
        setTransactionMessage(
            `Unable to load ${failures.join(
                " and "
            )} for the transaction form.`,
            "error"
        );
    }
}

async function addTransaction() {
    const customerInput = document.getElementById("customerName");
    const productInput = document.getElementById("productName");
    const amountInput = document.getElementById("amount");
    const dateInput = document.getElementById("transactionDate");
    const vendorInput = document.getElementById("vendorId");

    const customerName = customerInput.value.trim();
    const productName = productInput.value;
    const amount = Number(amountInput.value);
    const transactionDate = dateInput.value;
    const vendorId = Number(vendorInput.value);

    setTransactionMessage("");

    if (
        !customerName ||
        !productName ||
        !amountInput.value ||
        !transactionDate ||
        !vendorInput.value
    ) {
        setTransactionMessage(
            "Please complete customer, product, amount, date, and vendor fields.",
            "error"
        );
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        setTransactionMessage(
            "Amount must be greater than zero.",
            "error"
        );
        return;
    }

    if (!Number.isInteger(vendorId) || vendorId <= 0) {
        setTransactionMessage(
            "Please select a valid vendor.",
            "error"
        );
        return;
    }

    try {
        await fetchJson("/transactions/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customer_name: customerName,
                product_name: productName,
                amount,
                transaction_date: transactionDate,
                vendor_id: vendorId
            })
        });

        customerInput.value = "";
        productInput.value = "";
        amountInput.value = "";
        dateInput.value = "";
        vendorInput.value = "";

        setTransactionMessage(
            "Transaction added successfully.",
            "success"
        );

        await loadTransactions();

    } catch (error) {
        setTransactionMessage(
            error.message || "Unable to add transaction.",
            "error"
        );
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadTransactions();
    loadTransactionReferences();
});