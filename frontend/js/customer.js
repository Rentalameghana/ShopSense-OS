const API_URL = "http://127.0.0.1:8000/customers";

function setCustomerMessage(message, type = "") {
    const element = document.getElementById("customerMessage");

    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = `customer-message ${type}`.trim();
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
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
        const detail = data?.detail || `Request failed with status ${response.status}`;
        throw new Error(detail);
    }

    return data;
}

function renderCustomers(customers) {
    const table = document.getElementById("customerTable");

    if (!table) {
        throw new Error("Customer table was not found");
    }

    if (!Array.isArray(customers) || customers.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6">No customers registered yet.</td>
            </tr>
        `;
        return;
    }

    table.innerHTML = customers.map(customer => `
        <tr>
            <td>${escapeHtml(customer.id)}</td>
            <td>${escapeHtml(customer.customer_name)}</td>
            <td>${escapeHtml(customer.email)}</td>
            <td>${escapeHtml(customer.phone)}</td>
            <td>₹${getNumber(customer.total_spending).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            <td><span class="segment-badge ${getSegmentClass(customer.segment)}">${escapeHtml(customer.segment || "Low Spender")}</span></td>
        </tr>
    `).join("");
}

function getNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function getSegmentClass(segment) {
    if (segment === "High Spender") {
        return "segment-high";
    }
    if (segment === "Medium Spender") {
        return "segment-medium";
    }
    return "segment-low";
}

async function loadCustomers() {
    const table = document.getElementById("customerTable");

    if (table) {
        table.innerHTML = `
            <tr>
                <td colspan="6">Loading customers...</td>
            </tr>
        `;
    }

    try {
        const customers = await fetchJson("/segments");
        renderCustomers(customers);
        setCustomerMessage("Customer list updated.", "success");
    } catch (error) {
        if (table) {
            table.innerHTML = `
                <tr>
                    <td colspan="6">Unable to load customer segments. Please try again.</td>
                </tr>
            `;
        }

        setCustomerMessage(error.message || "Unable to load customers.", "error");
    }
}

async function addCustomer() {
    const nameInput = document.getElementById("customerName");
    const emailInput = document.getElementById("customerEmail");
    const phoneInput = document.getElementById("customerPhone");
    const customerName = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    setCustomerMessage("");

    if (!customerName || !email || !phone) {
        setCustomerMessage("Please fill in the customer name, email, and phone number.", "error");
        return;
    }

    if (customerName.length < 2) {
        setCustomerMessage("Customer name must contain at least 2 characters.", "error");
        return;
    }

    if (!emailInput.checkValidity()) {
        setCustomerMessage("Please enter a valid email address.", "error");
        return;
    }

    if (phone.length < 10 || phone.length > 15) {
        setCustomerMessage("Phone number must contain 10 to 15 characters.", "error");
        return;
    }

    try {
        await fetchJson("/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                customer_name: customerName,
                email,
                phone
            })
        });

        nameInput.value = "";
        emailInput.value = "";
        phoneInput.value = "";
        setCustomerMessage("Customer added successfully.", "success");
        await loadCustomers();
    } catch (error) {
        setCustomerMessage(error.message || "Unable to add customer.", "error");
    }
}

document.addEventListener("DOMContentLoaded", loadCustomers);