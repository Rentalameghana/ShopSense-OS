const API_URL = "http://127.0.0.1:8000";

// ===============================
// GLOBAL DATA
// ===============================

let vendorBenchmarks = [];


// ===============================
// COMMON HELPERS
// ===============================

function getNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function formatNumber(value) {
    return getNumber(value).toLocaleString("en-IN");
}

function formatCurrency(value) {
    return `₹${formatNumber(value)}`;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ===============================
// FETCH JSON
// ===============================

async function fetchJson(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    let data = null;

    try {
        data = await response.json();
    } catch (error) {
        data = null;
    }

    if (!response.ok) {
        console.error("Backend error:", path, data);
        throw new Error(
            data?.detail ||
            data?.message ||
            `Request failed: ${response.status}`
        );
    }

    return data;
}


// ===============================
// CANVAS HELPERS
// ===============================

function setupCanvas(canvas) {
    if (!canvas) return null;

    const container = canvas.parentElement;

    const width = container
        ? Math.max(container.clientWidth, 300)
        : 600;

    const height = container
        ? Math.max(container.clientHeight, 300)
        : 380;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    return {
        ctx,
        width,
        height
    };
}


function clearCanvas(canvas) {
    if (!canvas) return;

    const setup = setupCanvas(canvas);

    if (!setup) return;

    setup.ctx.clearRect(
        0,
        0,
        setup.width,
        setup.height
    );
}


// ===============================
// DRAW EMPTY MESSAGE
// ===============================

function drawEmptyChart(canvas, message = "No data available") {
    if (!canvas) return;

    const setup = setupCanvas(canvas);

    if (!setup) return;

    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#777";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        message,
        width / 2,
        height / 2
    );
}


// ===============================
// SALES OVERVIEW BAR CHART
// ===============================

function renderSalesChart(data) {

    const canvas = document.getElementById("salesChart");

    if (!canvas) return;

    if (!Array.isArray(data) || data.length === 0) {
        drawEmptyChart(canvas, "No sales data available");
        return;
    }

    const setup = setupCanvas(canvas);

    if (!setup) return;

    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);

    // ---------------------------
    // Normalize data
    // ---------------------------

    const grouped = {};

    data.forEach(item => {

        const name =
            item.product ||
            item.product_name ||
            item.name ||
            "Unknown";

        const amount = getNumber(
            item.amount ??
            item.revenue ??
            item.sales ??
            item.total ??
            0
        );

        if (!grouped[name]) {
            grouped[name] = 0;
        }

        grouped[name] += amount;
    });

    const labels = Object.keys(grouped);
    const values = Object.values(grouped);

    if (labels.length === 0) {
        drawEmptyChart(canvas, "No sales data available");
        return;
    }

    // ---------------------------
    // Chart area
    // ---------------------------

    const left = 70;
    const right = 30;
    const top = 30;
    const bottom = 75;

    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;

    const maxValue = Math.max(...values, 1);

    // ---------------------------
    // Background
    // ---------------------------

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // ---------------------------
    // Grid lines
    // ---------------------------

    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;

    const gridCount = 5;

    for (let i = 0; i <= gridCount; i++) {

        const y =
            top +
            (chartHeight / gridCount) * i;

        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(width - right, y);
        ctx.stroke();

        const value =
            maxValue -
            (maxValue / gridCount) * i;

        ctx.fillStyle = "#666";
        ctx.font = "11px Arial";
        ctx.textAlign = "right";

        ctx.fillText(
            formatCurrency(value),
            left - 8,
            y + 4
        );
    }

    // ---------------------------
    // Bars
    // ---------------------------

    const gap = 20;

    const barWidth = Math.max(
        25,
        (chartWidth - gap * (labels.length - 1)) /
        labels.length
    );

    labels.forEach((label, index) => {

        const value = values[index];

        const barHeight =
            (value / maxValue) *
            chartHeight;

        const x =
            left +
            index * (barWidth + gap);

        const y =
            top +
            chartHeight -
            barHeight;

        // Bar
        ctx.fillStyle = "#4f46e5";

        ctx.fillRect(
            x,
            y,
            barWidth,
            barHeight
        );

        // Value
        ctx.fillStyle = "#333";
        ctx.font = "11px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            formatCurrency(value),
            x + barWidth / 2,
            y - 8
        );

        // Label
        ctx.save();

        ctx.translate(
            x + barWidth / 2,
            height - bottom + 20
        );

        ctx.rotate(-Math.PI / 5);

        ctx.fillStyle = "#555";
        ctx.font = "12px Arial";
        ctx.textAlign = "right";

        let shortLabel = label;

        if (shortLabel.length > 14) {
            shortLabel =
                shortLabel.substring(0, 14) + "...";
        }

        ctx.fillText(
            shortLabel,
            0,
            0
        );

        ctx.restore();
    });

    // Axis
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(left, top);
    ctx.lineTo(left, top + chartHeight);
    ctx.lineTo(width - right, top + chartHeight);

    ctx.stroke();
}


// ===============================
// PRODUCT INSIGHTS CHART
// ===============================

function renderProductChart(data) {

    const canvas = document.getElementById("productChart");

    if (!canvas) return;

    if (!Array.isArray(data) || data.length === 0) {
        drawEmptyChart(canvas, "No product data available");
        return;
    }

    const setup = setupCanvas(canvas);

    if (!setup) return;

    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);

    // ---------------------------
    // Normalize data
    // ---------------------------

    const grouped = {};

    data.forEach(item => {

        const category =
            item.category ||
            item.product_category ||
            item.name ||
            item.product ||
            "Unknown";

        const amount = getNumber(
            item.amount ??
            item.revenue ??
            item.sales ??
            item.total ??
            0
        );

        if (!grouped[category]) {
            grouped[category] = 0;
        }

        grouped[category] += amount;
    });

    const labels = Object.keys(grouped);
    const values = Object.values(grouped);

    if (labels.length === 0) {
        drawEmptyChart(canvas, "No product data available");
        return;
    }

    const total =
        values.reduce(
            (sum, value) => sum + value,
            0
        );

    if (total <= 0) {
        drawEmptyChart(canvas, "No product revenue");
        return;
    }

    // ---------------------------
    // Pie chart dimensions
    // ---------------------------

    const centerX = width * 0.38;
    const centerY = height / 2;

    const radius =
        Math.min(width * 0.28, height * 0.35);

    // ---------------------------
    // Draw pie
    // ---------------------------

    let startAngle = -Math.PI / 2;

    const pieColors = [
        "#4f46e5",
        "#06b6d4",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#ec4899",
        "#14b8a6",
        "#f97316",
        "#6366f1"
    ];

    labels.forEach((label, index) => {

        const value = values[index];

        const slice =
            (value / total) *
            Math.PI *
            2;

        const endAngle =
            startAngle + slice;

        ctx.beginPath();

        ctx.moveTo(
            centerX,
            centerY
        );

        ctx.arc(
            centerX,
            centerY,
            radius,
            startAngle,
            endAngle
        );

        ctx.closePath();

        ctx.fillStyle =
            pieColors[index % pieColors.length];

        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        startAngle = endAngle;
    });

    // ---------------------------
    // Legend
    // ---------------------------

    const legendX = width * 0.65;

    let legendY = 45;

    labels.forEach((label, index) => {

        const value = values[index];

        const percentage =
            ((value / total) * 100).toFixed(1);

        const boxSize = 14;

        ctx.fillStyle =
            pieColors[index % pieColors.length];

        ctx.fillRect(
            legendX,
            legendY - 10,
            boxSize,
            boxSize
        );

        ctx.fillStyle = "#333";
        ctx.font = "12px Arial";
        ctx.textAlign = "left";

        let displayLabel = label;

        if (displayLabel.length > 17) {
            displayLabel =
                displayLabel.substring(0, 17) + "...";
        }

        ctx.fillText(
            `${displayLabel} (${percentage}%)`,
            legendX + 22,
            legendY + 2
        );

        legendY += 28;

        if (legendY > height - 20) {
            return;
        }
    });
}


// ===============================
// REVENUE TREND LINE CHART
// ===============================

function renderTrendChart(data) {

    const canvas = document.getElementById("trendChart");

    if (!canvas) return;

    if (!Array.isArray(data) || data.length === 0) {
        drawEmptyChart(canvas, "No revenue trend data");
        return;
    }

    const setup = setupCanvas(canvas);

    if (!setup) return;

    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);

    // ---------------------------
    // Normalize data
    // ---------------------------

    const values = data.map(item =>
        getNumber(
            item.revenue ??
            item.amount ??
            item.sales ??
            0
        )
    );

    const labels = data.map(item =>
        item.date ||
        item.day ||
        item.label ||
        ""
    );

    if (values.length === 0) {
        drawEmptyChart(canvas, "No trend data available");
        return;
    }

    const left = 65;
    const right = 30;
    const top = 30;
    const bottom = 60;

    const chartWidth =
        width - left - right;

    const chartHeight =
        height - top - bottom;

    const maxValue =
        Math.max(...values, 1);

    const minValue =
        Math.min(...values, 0);

    const range =
        Math.max(maxValue - minValue, 1);

    // ---------------------------
    // Grid
    // ---------------------------

    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;

    const gridCount = 5;

    for (let i = 0; i <= gridCount; i++) {

        const y =
            top +
            (chartHeight / gridCount) * i;

        ctx.beginPath();

        ctx.moveTo(left, y);
        ctx.lineTo(width - right, y);

        ctx.stroke();

        const value =
            maxValue -
            (range / gridCount) * i;

        ctx.fillStyle = "#666";
        ctx.font = "11px Arial";
        ctx.textAlign = "right";

        ctx.fillText(
            formatCurrency(value),
            left - 8,
            y + 4
        );
    }

    // ---------------------------
    // Points
    // ---------------------------

    const points = values.map(
        (value, index) => {

            const x =
                values.length === 1
                    ? left + chartWidth / 2
                    : left +
                      (index /
                          (values.length - 1)) *
                          chartWidth;

            const y =
                top +
                chartHeight -
                ((value - minValue) / range) *
                    chartHeight;

            return { x, y, value };
        }
    );

    // ---------------------------
    // Area
    // ---------------------------

    ctx.beginPath();

    points.forEach((point, index) => {

        if (index === 0) {
            ctx.moveTo(
                point.x,
                point.y
            );
        } else {
            ctx.lineTo(
                point.x,
                point.y
            );
        }
    });

    if (points.length > 0) {

        ctx.lineTo(
            points[points.length - 1].x,
            top + chartHeight
        );

        ctx.lineTo(
            points[0].x,
            top + chartHeight
        );

        ctx.closePath();

        ctx.fillStyle =
            "rgba(79, 70, 229, 0.12)";

        ctx.fill();
    }

    // ---------------------------
    // Line
    // ---------------------------

    ctx.beginPath();

    points.forEach((point, index) => {

        if (index === 0) {
            ctx.moveTo(
                point.x,
                point.y
            );
        } else {
            ctx.lineTo(
                point.x,
                point.y
            );
        }
    });

    ctx.strokeStyle = "#4f46e5";
    ctx.lineWidth = 3;

    ctx.stroke();

    // ---------------------------
    // Points + labels
    // ---------------------------

    points.forEach((point, index) => {

        ctx.beginPath();

        ctx.arc(
            point.x,
            point.y,
            5,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#4f46e5";
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // X label
        ctx.fillStyle = "#555";
        ctx.font = "11px Arial";
        ctx.textAlign = "center";

        let dateLabel = String(
            labels[index]
        );

        if (dateLabel.length > 10) {
            dateLabel =
                dateLabel.substring(5, 10);
        }

        ctx.fillText(
            dateLabel,
            point.x,
            height - 25
        );
    });

    // Axis
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(left, top);
    ctx.lineTo(left, top + chartHeight);
    ctx.lineTo(width - right, top + chartHeight);

    ctx.stroke();
}


// ===============================
// LOAD MAIN ANALYTICS
// ===============================

async function loadAnalytics() {

    const requests = [
        [
            "revenue",
            fetchJson("/transactions/revenue")
        ],
        [
            "transactions",
            fetchJson("/transactions/count")
        ],
        [
            "customers",
            fetchJson("/customers/count")
        ],
        [
            "sales",
            fetchJson("/analytics/revenue-by-product")
        ],
        [
            "products",
            fetchJson("/analytics/revenue-by-category")
        ],
        [
            "trend",
            fetchJson("/analytics/revenue-trend")
        ]
    ];

    const results =
        await Promise.allSettled(
            requests.map(item => item[1])
        );

    // ---------------------------
    // Revenue
    // ---------------------------

    const revenueResult = results[0];

    if (revenueResult.status === "fulfilled") {

        const data = revenueResult.value;

        let revenue = 0;

        if (typeof data === "number") {
            revenue = data;
        } else if (typeof data === "object") {

            revenue =
                data.revenue ??
                data.total_revenue ??
                data.amount ??
                data.total ??
                0;
        }

        const element =
            document.getElementById(
                "totalRevenue"
            );

        if (element) {
            element.textContent =
                formatCurrency(revenue);
        }
    }

    // ---------------------------
    // Transactions
    // ---------------------------

    const transactionResult =
        results[1];

    if (
        transactionResult.status ===
        "fulfilled"
    ) {

        const data =
            transactionResult.value;

        let count = 0;

        if (typeof data === "number") {
            count = data;
        } else if (typeof data === "object") {

            count =
                data.count ??
                data.total_transactions ??
                data.transactions ??
                data.total ??
                0;
        }

        const element =
            document.getElementById(
                "totalTransactions"
            );

        if (element) {
            element.textContent =
                formatNumber(count);
        }
    }

    // ---------------------------
    // Customers
    // ---------------------------

    const customerResult =
        results[2];

    if (
        customerResult.status ===
        "fulfilled"
    ) {

        const data =
            customerResult.value;

        let count = 0;

        if (typeof data === "number") {
            count = data;
        } else if (typeof data === "object") {

            count =
                data.count ??
                data.total_customers ??
                data.customers ??
                data.total ??
                0;
        }

        const element =
            document.getElementById(
                "totalCustomers"
            );

        if (element) {
            element.textContent =
                formatNumber(count);
        }
    }

    // ---------------------------
    // Sales Chart
    // ---------------------------

    if (results[3].status === "fulfilled") {

        renderSalesChart(
            results[3].value
        );

    } else {

        console.error(
            "Sales chart error:",
            results[3].reason
        );

        drawEmptyChart(
            document.getElementById("salesChart"),
            "Unable to load sales"
        );
    }

    // ---------------------------
    // Product Chart
    // ---------------------------

    if (results[4].status === "fulfilled") {

        renderProductChart(
            results[4].value
        );

    } else {

        console.error(
            "Product chart error:",
            results[4].reason
        );

        drawEmptyChart(
            document.getElementById("productChart"),
            "Unable to load products"
        );
    }

    // ---------------------------
    // Revenue Trend
    // ---------------------------

    if (results[5].status === "fulfilled") {

        renderTrendChart(
            results[5].value
        );

    } else {

        console.error(
            "Trend chart error:",
            results[5].reason
        );

        drawEmptyChart(
            document.getElementById("trendChart"),
            "Unable to load revenue trend"
        );
    }
}


// ===============================
// VENDOR BENCHMARK
// ===============================

async function loadVendorBenchmarks() {

    try {

        const data =
            await fetchJson(
                "/analytics/vendor-benchmark"
            );

        vendorBenchmarks =
            Array.isArray(data)
                ? data
                : [];

        const select =
            document.getElementById(
                "vendorBenchmarkSelect"
            );

        if (!select) return;

        select.innerHTML =
            `<option value="">All Vendors</option>`;

        vendorBenchmarks.forEach(
            (vendor, index) => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    vendor.vendor_id ??
                    vendor.id ??
                    index;

                option.textContent =
                    vendor.vendor_name ??
                    vendor.name ??
                    `Vendor ${index + 1}`;

                select.appendChild(option);
            }
        );

        renderVendorBenchmarkTable();

        updateSelectedVendorBenchmark();

    } catch (error) {

        console.error(
            "Vendor benchmark error:",
            error
        );
    }
}


// ===============================
// VENDOR TABLE
// ===============================

function renderVendorBenchmarkTable() {

    const table =
        document.getElementById(
            "benchmarkTable"
        );

    if (!table) return;

    if (vendorBenchmarks.length === 0) {

        table.innerHTML =
            `<tr>
                <td colspan="5">
                    No vendor benchmark data available
                </td>
            </tr>`;

        return;
    }

    table.innerHTML = `
        <thead>
            <tr>
                <th>Vendor</th>
                <th>Revenue</th>
                <th>Average Revenue</th>
                <th>Difference</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${vendorBenchmarks.map(vendor => {

                const name =
                    vendor.vendor_name ??
                    vendor.name ??
                    "Unknown";

                const revenue =
                    getNumber(
                        vendor.vendor_revenue ??
                        vendor.revenue ??
                        0
                    );

                const average =
                    getNumber(
                        vendor.marketplace_average_revenue ??
                        vendor.average_revenue ??
                        vendor.average ??
                        0
                    );

                const difference =
                    revenue - average;

                let status = "Average";

                if (difference > 0) {
                    status = "Above Average";
                } else if (difference < 0) {
                    status = "Below Average";
                }

                return `
                    <tr>
                        <td>${escapeHtml(name)}</td>
                        <td>${formatCurrency(revenue)}</td>
                        <td>${formatCurrency(average)}</td>
                        <td>${formatCurrency(difference)}</td>
                        <td>${status}</td>
                    </tr>
                `;

            }).join("")}
        </tbody>
    `;
}


// ===============================
// SELECTED VENDOR BENCHMARK
// ===============================

function updateSelectedVendorBenchmark() {

    const select =
        document.getElementById(
            "vendorBenchmarkSelect"
        );

    if (!select) return;

    const selectedValue =
        select.value;

    // ---------------------------
    // ALL VENDORS
    // ---------------------------

    if (!selectedValue) {

        const totalRevenue =
            vendorBenchmarks.reduce(
                (sum, vendor) =>
                    sum +
                    getNumber(
                        vendor.vendor_revenue ??
                        vendor.revenue ??
                        0
                    ),
                0
            );

        const average =
            vendorBenchmarks.length > 0
                ? getNumber(
                    vendorBenchmarks[0]
                        .marketplace_average_revenue ??
                    vendorBenchmarks[0]
                        .average_revenue ??
                    vendorBenchmarks[0]
                        .average ??
                    0
                )
                : 0;

        setBenchmarkValue(
            "benchmarkVendorRevenue",
            formatCurrency(totalRevenue)
        );

        setBenchmarkValue(
            "benchmarkAverageRevenue",
            formatCurrency(average)
        );

        setBenchmarkValue(
            "benchmarkDifference",
            "—"
        );

        setBenchmarkValue(
            "benchmarkPercentage",
            "—"
        );

        setBenchmarkValue(
            "benchmarkStatus",
            "All Vendors"
        );

        return;
    }

    // ---------------------------
    // SELECTED VENDOR
    // ---------------------------

    const vendor =
        vendorBenchmarks.find(
            (item, index) =>
                String(
                    item.vendor_id ??
                    item.id ??
                    index
                ) === String(selectedValue)
        );

    if (!vendor) return;

    const revenue =
        getNumber(
            vendor.vendor_revenue ??
            vendor.revenue ??
            0
        );

    const average =
        getNumber(
            vendor.marketplace_average_revenue ??
            vendor.average_revenue ??
            vendor.average ??
            0
        );

    const difference =
        revenue - average;

    const percentage =
        average !== 0
            ? (difference / average) * 100
            : 0;

    let status = "Average";

    if (difference > 0) {
        status = "Above Average";
    } else if (difference < 0) {
        status = "Below Average";
    }

    setBenchmarkValue(
        "benchmarkVendorRevenue",
        formatCurrency(revenue)
    );

    setBenchmarkValue(
        "benchmarkAverageRevenue",
        formatCurrency(average)
    );

    setBenchmarkValue(
        "benchmarkDifference",
        formatCurrency(difference)
    );

    setBenchmarkValue(
        "benchmarkPercentage",
        `${percentage.toFixed(2)}%`
    );

    setBenchmarkValue(
        "benchmarkStatus",
        status
    );
}


function setBenchmarkValue(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


// ===============================
// FORECAST PRODUCTS
// ===============================

async function loadForecastProducts() {

    const select =
        document.getElementById(
            "forecastProduct"
        );

    if (!select) return;

    try {

        const products =
            await fetchJson("/products/");

        const uniqueNames = [];

        const seen = new Set();

        if (Array.isArray(products)) {

            products.forEach(product => {

                const name =
                    product.product_name ??
                    product.name;

                if (
                    name &&
                    !seen.has(name)
                ) {

                    seen.add(name);

                    uniqueNames.push(name);
                }
            });
        }

        select.innerHTML =
            `<option value="">
                Select Product
            </option>`;

        uniqueNames.forEach(name => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = name;
            option.textContent = name;

            select.appendChild(option);
        });

        if (uniqueNames.length > 0) {
            select.value =
                uniqueNames[0];
        }

    } catch (error) {

        console.error(
            "Forecast products error:",
            error
        );
    }
}


// ===============================
// RUN FORECAST
// ===============================

async function loadForecast() {

    const productSelect =
        document.getElementById(
            "forecastProduct"
        );

    const daysSelect =
        document.getElementById(
            "forecastDays"
        );

    const message =
        document.getElementById(
            "forecastMessage"
        );

    const interpretation =
        document.getElementById(
            "forecastInterpretation"
        );

    const table =
        document.getElementById(
            "forecastTable"
        );

    if (!productSelect) return;

    const productName =
        productSelect.value;

    const forecastDays =
        daysSelect
            ? Number(daysSelect.value || 7)
            : 7;

    if (!productName) {

        if (message) {
            message.textContent =
                "Please select a product.";
        }

        return;
    }

    try {

        if (message) {
            message.textContent =
                "Loading forecast...";
        }

        const url =
            `/analytics/forecast?product_name=${encodeURIComponent(
                productName
            )}&forecast_days=${forecastDays}`;

        const data =
            await fetchJson(url);

        if (message) {
            message.textContent =
                "Forecast generated successfully.";
        }

        renderForecast(
            data,
            productName,
            interpretation,
            table
        );

    } catch (error) {

        console.error(
            "Forecast error:",
            error
        );

        if (message) {
            message.textContent =
                error.message ||
                "Unable to generate forecast.";
        }

        if (interpretation) {
            interpretation.textContent = "";
        }

        if (table) {
            table.innerHTML = "";
        }
    }
}


// ===============================
// RENDER FORECAST
// ===============================

function renderForecast(
    data,
    productName,
    interpretationElement,
    tableElement
) {

    let forecast = [];

    if (Array.isArray(data)) {
        forecast = data;
    } else if (Array.isArray(data?.forecast)) {
        forecast = data.forecast;
    } else if (Array.isArray(data?.predictions)) {
        forecast = data.predictions;
    }

    if (forecast.length === 0) {

        if (interpretationElement) {
            interpretationElement.textContent =
                `No forecast values available for ${productName}.`;
        }

        if (tableElement) {
            tableElement.innerHTML = "";
        }

        return;
    }

    // ---------------------------
    // Interpretation
    // ---------------------------

    const forecastValues =
        forecast.map(item =>
            getNumber(
                item.predicted_sales ??
                item.predicted_revenue ??
                item.forecast ??
                item.prediction ??
                item.value ??
                item.sales ??
                0
            )
        );

    const average =
        forecastValues.reduce(
            (sum, value) =>
                sum + value,
            0
        ) /
        forecastValues.length;

    if (interpretationElement) {

        interpretationElement.textContent =
            `Expected average for ${escapeHtml(
                productName
            )}: ${formatNumber(
                average
            )}`;
    }

    // ---------------------------
    // Table
    // ---------------------------

    if (!tableElement) return;

    tableElement.innerHTML = `
        <thead>
            <tr>
                <th>Date</th>
                <th>Predicted Sales</th>
            </tr>
        </thead>

        <tbody>
            ${forecast.map(item => {

                const date =
                    item.date ??
                    item.forecast_date ??
                    item.day ??
                    "";

                const value =
                    item.predicted_sales ??
                    item.predicted_revenue ??
                    item.forecast ??
                    item.prediction ??
                    item.value ??
                    item.sales ??
                    0;

                return `
                    <tr>
                        <td>${escapeHtml(date)}</td>
                        <td>${formatNumber(value)}</td>
                    </tr>
                `;

            }).join("")}
        </tbody>
    `;
}


// ===============================
// CSV EXPORT
// ===============================

async function exportAnalyticsCsv() {

    try {

        const response =
            await fetch(
                `${API_URL}/analytics/export/csv`
            );

        if (!response.ok) {
            throw new Error(
                "CSV export failed"
            );
        }

        const blob =
            await response.blob();

        const url =
            window.URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "shopsense_analytics.csv";

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

    } catch (error) {

        console.error(
            "CSV export error:",
            error
        );

        alert(
            "Unable to export analytics CSV."
        );
    }
}


// ===============================
// AI QUERY
// ===============================

async function askAI() {

    const questionInput =
        document.getElementById(
            "aiQuestion"
        );

    const result =
        document.getElementById(
            "aiResult"
        );

    const answer =
        document.getElementById(
            "aiAnswer"
        );

    const resultHead =
        document.getElementById(
            "aiResultHead"
        );

    const resultMeta =
        document.getElementById(
            "aiResultMeta"
        );

    if (!questionInput) return;

    const question =
        questionInput.value.trim();

    if (!question) {

        if (answer) {
            answer.textContent =
                "Please enter a question.";
        }

        if (result) {
            result.style.display = "block";
        }

        return;
    }

    try {

        if (result) {
            result.style.display = "block";
        }

        if (resultHead) {
            resultHead.textContent =
                "AI Analysis";
        }

        if (resultMeta) {
            resultMeta.textContent =
                "Processing...";
        }

        if (answer) {
            answer.textContent =
                "Please wait...";
        }

        const data =
            await fetchJson(
                "/analytics/ai/query",
                {
                    method: "POST",
                    body: JSON.stringify({
                        question: question
                    })
                }
            );

        if (resultMeta) {
            resultMeta.textContent =
                "Analysis completed";
        }

        const aiAnswer =
            data?.answer ??
            data?.response ??
            data?.result ??
            data?.message ??
            "No answer returned.";

        if (answer) {
            answer.textContent =
                aiAnswer;
        }

    } catch (error) {

        console.error(
            "AI query error:",
            error
        );

        if (resultMeta) {
            resultMeta.textContent =
                "Error";
        }

        if (answer) {
            answer.textContent =
                error.message ||
                "Unable to get AI response.";
        }
    }
}


// ===============================
// AI EXAMPLE BUTTONS
// ===============================

function setupAiExamples() {

    const examples =
        document.querySelectorAll(
            ".ai-example"
        );

    const input =
        document.getElementById(
            "aiQuestion"
        );

    if (!input) return;

    examples.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const text =
                    button.textContent.trim();

                input.value = text;
            }
        );
    });
}


// ===============================
// WINDOW RESIZE
// ===============================

let resizeTimer;

window.addEventListener(
    "resize",
    () => {

        clearTimeout(resizeTimer);

        resizeTimer =
            setTimeout(() => {

                loadAnalytics();

            }, 250);
    }
);


// ===============================
// PAGE INITIALIZATION
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "ShopSense Analytics loaded"
        );

        // Main analytics
        loadAnalytics();

        // Forecast
        loadForecastProducts();

        const runForecastButton =
            document.getElementById(
                "runForecast"
            );

        if (runForecastButton) {

            runForecastButton.addEventListener(
                "click",
                loadForecast
            );
        }

        // Vendor benchmark
        loadVendorBenchmarks();

        const vendorSelect =
            document.getElementById(
                "vendorBenchmarkSelect"
            );

        if (vendorSelect) {

            vendorSelect.addEventListener(
                "change",
                updateSelectedVendorBenchmark
            );
        }

        // CSV
        const exportButton =
            document.getElementById(
                "exportCsv"
            );

        if (exportButton) {

            exportButton.addEventListener(
                "click",
                exportAnalyticsCsv
            );
        }

        // AI
        const askButton =
            document.getElementById(
                "askAi"
            );

        if (askButton) {

            askButton.addEventListener(
                "click",
                askAI
            );
        }

        setupAiExamples();
    }
);