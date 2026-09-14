const API_URL = "http://127.0.0.1:8000";

function setVendorMessage(message, type = "") {
    const element = document.getElementById("vendorMessage");

    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = `vendor-message ${type}`.trim();
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

function renderVendors(vendors) {
    const table = document.getElementById("vendorTable");

    if (!table) {
        throw new Error("Vendor table was not found");
    }

    if (!Array.isArray(vendors) || vendors.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5">No vendors registered yet.</td>
            </tr>
        `;
        return;
    }

    table.innerHTML = vendors.map(vendor => `
        <tr>
            <td>${escapeHtml(vendor.id)}</td>
            <td>${escapeHtml(vendor.business_name)}</td>
            <td>${escapeHtml(vendor.corporate_email)}</td>
            <td>${escapeHtml(vendor.status || "Pending")}</td>
            <td>
                <button type="button" onclick="updateStatus(${Number(vendor.id)}, 'Approved')">Approve</button>
                <button type="button" onclick="updateStatus(${Number(vendor.id)}, 'Suspended')">Suspend</button>
                <button type="button" onclick="updateStatus(${Number(vendor.id)}, 'Pending')">Pending</button>
            </td>
        </tr>
    `).join("");
}

async function loadVendors() {
    const table = document.getElementById("vendorTable");

    if (table) {
        table.innerHTML = `
            <tr>
                <td colspan="5">Loading vendors...</td>
            </tr>
        `;
    }

    try {
        const vendors = await fetchJson("/vendors/");
        renderVendors(vendors);
        setVendorMessage("Vendor directory updated.", "success");
    } catch (error) {
        console.error("Load vendors error:", error);

        if (table) {
            table.innerHTML = `
                <tr>
                    <td colspan="5">Unable to load vendors. Please try again.</td>
                </tr>
            `;
        }

        setVendorMessage(error.message || "Unable to load vendors.", "error");
    }
}

async function addVendor() {
    const businessInput = document.getElementById("business_name");
    const emailInput = document.getElementById("corporate_email");
    const businessName = businessInput?.value.trim();
    const corporateEmail = emailInput?.value.trim();

    setVendorMessage("");

    if (!businessName || !corporateEmail) {
        setVendorMessage("Please enter the business name and corporate email.", "error");
        return;
    }

    if (!emailInput.checkValidity()) {
        setVendorMessage("Please enter a valid corporate email.", "error");
        return;
    }

    try {
        await fetchJson("/vendors/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                business_name: businessName,
                corporate_email: corporateEmail
            })
        });

        businessInput.value = "";
        emailInput.value = "";
        setVendorMessage("Vendor added successfully with Pending status.", "success");
        await loadVendors();
    } catch (error) {
        console.error("Add vendor error:", error);
        setVendorMessage(error.message || "Unable to add vendor.", "error");
    }
}

async function updateStatus(id, status) {
    if (!Number.isInteger(id) || id <= 0) {
        setVendorMessage("Invalid vendor selected.", "error");
        return;
    }

    try {
        await fetchJson(`/vendors/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });

        setVendorMessage(`Vendor status changed to ${status}.`, "success");
        await loadVendors();
    } catch (error) {
        console.error("Update vendor status error:", error);
        setVendorMessage(error.message || "Unable to update vendor status.", "error");
    }
}

document.addEventListener("DOMContentLoaded", loadVendors);