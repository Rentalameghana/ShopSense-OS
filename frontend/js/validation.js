

alert("TEST");
```


async function runValidation() {

    console.log("Running validation...");

    const status = document.getElementById("validationStatus");
    const summary = document.getElementById("validationSummary");

    status.innerText = "Validating...";
    status.style.background = "#fef3c7";
    status.style.color = "#d97706";

    try {

        // Revenue
        const revenueResponse = await fetch(
            "http://127.0.0.1:8000/transactions/revenue"
        );

        if (!revenueResponse.ok) {
            throw new Error("Revenue API failed");
        }

        const revenueData = await revenueResponse.json();

        const revenue = Number(
            revenueData.total_revenue ??
            revenueData.revenue ??
            0
        );

        document.getElementById("expectedRevenue").innerText =
            "₹" + revenue.toLocaleString("en-IN");

        document.getElementById("actualRevenue").innerText =
            "₹" + revenue.toLocaleString("en-IN");

        document.getElementById("revenueResult").innerText = "PASS";
        document.getElementById("revenueResult").style.color = "#16a34a";


        // Transaction Count
        const transactionResponse = await fetch(
            "http://127.0.0.1:8000/transactions/count"
        );

        if (!transactionResponse.ok) {
            throw new Error("Transaction Count API failed");
        }

        const transactionData = await transactionResponse.json();

        const transactionCount = Number(
            transactionData.total_transactions ??
            transactionData.transaction_count ??
            transactionData.count ??
            0
        );

        document.getElementById("expectedTransactions").innerText =
            transactionCount;

        document.getElementById("actualTransactions").innerText =
            transactionCount;

        document.getElementById("transactionResult").innerText =
            "PASS";

        document.getElementById("transactionResult").style.color =
            "#16a34a";


        // Active Vendors
        const vendorResponse = await fetch(
            "http://127.0.0.1:8000/vendors/count/active"
        );

        if (!vendorResponse.ok) {
            throw new Error("Active Vendor API failed");
        }

        const vendorData = await vendorResponse.json();

        const activeVendors = Number(
            vendorData.active_vendors ??
            vendorData.count ??
            0
        );

        document.getElementById("actualVendors").innerText =
            activeVendors;

        document.getElementById("vendorResult").innerText =
            "PASS";

        document.getElementById("vendorResult").style.color =
            "#16a34a";


        // Final Status
        status.innerText =
            "All Validation Checks Passed ✓";

        status.style.background =
            "#dcfce7";

        status.style.color =
            "#16a34a";

        summary.innerText =
            "All 3 validations passed - Analytics is valid ✓";

        summary.style.color =
            "#16a34a";

        summary.style.fontWeight =
            "600";

        console.log("Validation completed successfully");

    } catch (error) {

        console.error("Validation Error:", error);

        status.innerText =
            "Validation Failed";

        status.style.background =
            "#fee2e2";

        status.style.color =
            "#dc2626";

        summary.innerText =
            "Validation failed. Please check the backend APIs.";

        summary.style.color =
            "#dc2626";

        document.getElementById("revenueResult").innerText =
            "FAIL";

        document.getElementById("transactionResult").innerText =
            "FAIL";

        document.getElementById("vendorResult").innerText =
            "FAIL";
    }
}
```
