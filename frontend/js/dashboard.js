const API_URL = "http://127.0.0.1:8000";
const LOW_STOCK_THRESHOLD = 10;

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


/* =========================
   TOP BAR
========================= */

function setPopover(button, panel, open) {
    if (!button || !panel) return;

    panel.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
}

function setupTopBarControls() {
    const notification = document.querySelector(".notification");
    const notificationButton = document.getElementById("notificationButton");
    const notificationPanel = document.getElementById("notificationPanel");

    const profile = document.querySelector(".profile");
    const profileButton = document.getElementById("profileButton");
    const profilePanel = document.getElementById("profilePanel");

    if (
        !notification ||
        !notificationButton ||
        !notificationPanel ||
        !profile ||
        !profileButton ||
        !profilePanel
    ) {
        return;
    }

    notificationButton.addEventListener("click", event => {
        event.stopPropagation();

        setPopover(
            notificationButton,
            notificationPanel,
            notificationPanel.hidden
        );

        setPopover(profileButton, profilePanel, false);
    });

    profileButton.addEventListener("click", event => {
        event.stopPropagation();

        setPopover(
            profileButton,
            profilePanel,
            profilePanel.hidden
        );

        setPopover(
            notificationButton,
            notificationPanel,
            false
        );
    });

    document.addEventListener("click", event => {
        if (!notification.contains(event.target)) {
            setPopover(
                notificationButton,
                notificationPanel,
                false
            );
        }

        if (!profile.contains(event.target)) {
            setPopover(
                profileButton,
                profilePanel,
                false
            );
        }
    });
}


/* =========================
   NOTIFICATIONS
========================= */

function updateNotifications(products) {
    const rows = Array.isArray(products) ? products : [];

    const lowStock = rows.filter(
        product =>
            getNumber(product.stock_quantity) <= LOW_STOCK_THRESHOLD
    );

    const badge = document.querySelector(".notification-badge");
    const summary = document.getElementById("notificationSummary");
    const list = document.getElementById("notificationList");

    if (badge) {
        badge.textContent = lowStock.length;
    }

    if (summary) {
        summary.textContent = lowStock.length
            ? `${lowStock.length} low-stock product${lowStock.length === 1 ? "" : "s"} need attention.`
            : "No new notifications.";
    }

    if (list) {
        list.innerHTML = lowStock
            .map(
                product =>
                    `<li>${escapeHtml(
                        product.product_name ?? "Product"
                    )} (${getNumber(
                        product.stock_quantity
                    )} units)</li>`
            )
            .join("");
    }
}


/* =========================
   PROFILE
========================= */

function loadProfileDetails() {
    const email = document.getElementById("profileEmail");
    const profileName = document.querySelector(
        ".profile-info strong"
    );

    try {
        const settings = JSON.parse(
            localStorage.getItem("shopsenseSettings") || "{}"
        );

        if (email && settings.email) {
            email.textContent = settings.email;
        }

        if (profileName && settings.name) {
            profileName.textContent = settings.name;
        }
    } catch {
        // Keep default profile
    }
}


/* =========================
   API
========================= */

async function fetchJson(path) {
    const response = await fetch(`${API_URL}${path}`);

    if (!response.ok) {
        throw new Error(
            `${path} returned ${response.status}`
        );
    }

    return response.json();
}


/* =========================
   CHART MESSAGE
========================= */

function showChartMessage(canvasId, message) {
    const canvas = document.getElementById(canvasId);

    if (!canvas) return;

    const container = canvas.parentElement;

    canvas.style.display = "none";

    const oldMessage = container.querySelector(
        `[data-chart-message="${canvasId}"]`
    );

    if (oldMessage) {
        oldMessage.remove();
    }

    const messageElement = document.createElement("p");

    messageElement.dataset.chartMessage = canvasId;
    messageElement.textContent = message;

    messageElement.style.cssText = `
        display:flex;
        align-items:center;
        justify-content:center;
        height:100%;
        margin:0;
        color:#64748b;
        font-size:14px;
    `;

    container.appendChild(messageElement);
}


/* =========================
   CANVAS SETUP
========================= */

function prepareCanvas(canvas) {
    if (!canvas) return null;

    const container = canvas.parentElement;

    const width =
        container.clientWidth ||
        canvas.clientWidth ||
        500;

    const height =
        container.clientHeight ||
        canvas.clientHeight ||
        300;

    const ratio =
        window.devicePixelRatio || 1;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");

    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    return {
        ctx,
        width,
        height
    };
}


/* =========================
   SALES BAR GRAPH
========================= */

function renderSalesChart(salesData) {
    const canvas = document.getElementById(
        "salesChart"
    );

    if (!canvas) return;

    const rows = Array.isArray(salesData)
        ? salesData
        : [];

    const sales = new Map();

    rows.forEach(item => {
        const name = String(
            item.product ?? "Unknown"
        ).trim();

        const key = name.toLowerCase();

        const old = sales.get(key);

        sales.set(key, {
            product: old?.product ?? name,
            amount:
                (old?.amount ?? 0) +
                getNumber(item.amount)
        });
    });

    const values = [...sales.values()];

    if (!values.length) {
        showChartMessage(
            "salesChart",
            "No sales data available"
        );
        return;
    }

    canvas.style.display = "block";

    const result = prepareCanvas(canvas);

    if (!result) return;

    const {
        ctx,
        width,
        height
    } = result;

    const paddingLeft = 65;
    const paddingRight = 25;
    const paddingTop = 25;
    const paddingBottom = 55;

    const chartWidth =
        width -
        paddingLeft -
        paddingRight;

    const chartHeight =
        height -
        paddingTop -
        paddingBottom;

    const maxValue =
        Math.max(
            ...values.map(item =>
                getNumber(item.amount)
            )
        ) || 1;

    /* GRID */

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
        const y =
            paddingTop +
            chartHeight -
            (chartHeight * i) / 4;

        ctx.beginPath();
        ctx.moveTo(
            paddingLeft,
            y
        );
        ctx.lineTo(
            width - paddingRight,
            y
        );
        ctx.stroke();

        const value =
            (maxValue * i) / 4;

        ctx.fillStyle = "#64748b";
        ctx.font = "12px Arial";
        ctx.textAlign = "right";

        ctx.fillText(
            formatCurrency(value),
            paddingLeft - 8,
            y + 4
        );
    }


    /* BARS */

    const gap = 25;

    const barWidth =
        Math.max(
            25,
            (chartWidth -
                gap * (values.length - 1)) /
                values.length
        );

    values.forEach((item, index) => {
        const amount =
            getNumber(item.amount);

        const barHeight =
            (amount / maxValue) *
            chartHeight;

        const x =
            paddingLeft +
            index *
                (barWidth + gap);

        const y =
            paddingTop +
            chartHeight -
            barHeight;

        /* BAR */

        ctx.fillStyle = "#4f46e5";

        ctx.beginPath();

        ctx.roundRect(
            x,
            y,
            barWidth,
            barHeight,
            6
        );

        ctx.fill();


        /* VALUE */

        ctx.fillStyle = "#1e293b";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            formatCurrency(amount),
            x + barWidth / 2,
            Math.max(
                y - 8,
                15
            )
        );


        /* LABEL */

        ctx.fillStyle = "#475569";

        let label = item.product;

        if (label.length > 12) {
            label =
                label.substring(0, 12) +
                "...";
        }

        ctx.fillText(
            label,
            x + barWidth / 2,
            height - 20
        );
    });
}


/* =========================
   PRODUCT PIE GRAPH
========================= */

function renderProductChart(productData) {
    const canvas = document.getElementById(
        "productChart"
    );

    if (!canvas) return;

    const products = Array.isArray(productData)
        ? productData
        : [];

    const counts = new Map();

    products.forEach(item => {
        const name = String(
            item.product ?? ""
        ).trim();

        if (!name) return;

        const key = name.toLowerCase();

        counts.set(
            key,
            {
                name:
                    counts.get(key)?.name ??
                    name,

                value:
                    (counts.get(key)?.value ??
                        0) + 1
            }
        );
    });

    const values = [...counts.values()];

    if (!values.length) {
        showChartMessage(
            "productChart",
            "No product data available"
        );
        return;
    }

    canvas.style.display = "block";

    const result = prepareCanvas(canvas);

    if (!result) return;

    const {
        ctx,
        width,
        height
    } = result;

    const centerX =
        width * 0.5;

    const centerY =
        height * 0.43;

    const radius =
        Math.min(
            width * 0.30,
            height * 0.30
        );

    const total =
        values.reduce(
            (sum, item) =>
                sum + item.value,
            0
        );

    const colors = [
        "#4f46e5",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#0ea5e9",
        "#8b5cf6",
        "#14b8a6",
        "#f97316"
    ];

    let startAngle =
        -Math.PI / 2;

    values.forEach(
        (item, index) => {
            const slice =
                (item.value / total) *
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
                colors[
                    index %
                        colors.length
                ];

            ctx.fill();

            ctx.strokeStyle =
                "#ffffff";

            ctx.lineWidth = 2;

            ctx.stroke();

            startAngle = endAngle;
        }
    );


    /* LEGEND */

    let legendX = 20;
    let legendY =
        height - 35;

    values.forEach(
        (item, index) => {
            const color =
                colors[
                    index %
                        colors.length
                ];

            ctx.fillStyle = color;

            ctx.fillRect(
                legendX,
                legendY - 10,
                10,
                10
            );

            ctx.fillStyle =
                "#475569";

            ctx.font =
                "12px Arial";

            ctx.textAlign =
                "left";

            let label = item.name;

            if (label.length > 15) {
                label =
                    label.substring(
                        0,
                        15
                    ) + "...";
            }

            ctx.fillText(
                label,
                legendX + 15,
                legendY
            );

            legendX += 100;

            if (
                legendX >
                width - 100
            ) {
                legendX = 20;
                legendY -= 22;
            }
        }
    );
}


/* =========================
   DASHBOARD DATA
========================= */

async function loadDashboard() {
    const requests = [
        [
            "products",
            fetchJson("/products/")
        ],

        [
            "revenue",
            fetchJson(
                "/transactions/revenue"
            )
        ],

        [
            "transactions",
            fetchJson(
                "/transactions/count"
            )
        ],

        [
            "sales",
            fetchJson(
                "/analytics/sales"
            )
        ],

        [
            "productOverview",
            fetchJson(
                "/analytics/products"
            )
        ]
    ];

    const results =
        await Promise.allSettled(
            requests.map(
                ([, request]) =>
                    request
            )
        );

    results.forEach(
        (result, index) => {
            const [name] =
                requests[index];

            if (
                result.status ===
                "rejected"
            ) {
                console.error(
                    `${name} failed:`,
                    result.reason
                );

                if (
                    name === "sales"
                ) {
                    showChartMessage(
                        "salesChart",
                        "Unable to load sales data"
                    );
                }

                if (
                    name ===
                    "productOverview"
                ) {
                    showChartMessage(
                        "productChart",
                        "Unable to load product data"
                    );
                }

                return;
            }


            /* PRODUCTS */

            if (
                name ===
                "products"
            ) {
                const productRows =
                    Array.isArray(
                        result.value
                    )
                        ? result.value
                        : [];

                updateNotifications(
                    productRows
                );

                const totalStock =
                    productRows.reduce(
                        (total, product) =>
                            total +
                            getNumber(
                                product.stock_quantity
                            ),
                        0
                    );

                const lowStockCount =
                    productRows.filter(
                        product =>
                            getNumber(
                                product.stock_quantity
                            ) <=
                            LOW_STOCK_THRESHOLD
                    ).length;

                const totalStockElement =
                    document.getElementById(
                        "totalStock"
                    );

                const lowStockElement =
                    document.getElementById(
                        "lowStock"
                    );

                if (
                    totalStockElement
                ) {
                    totalStockElement.textContent =
                        formatNumber(
                            totalStock
                        );
                }

                if (
                    lowStockElement
                ) {
                    lowStockElement.textContent =
                        formatNumber(
                            lowStockCount
                        );
                }
            }


            /* REVENUE */

            else if (
                name ===
                "revenue"
            ) {
                const revenueElement =
                    document.getElementById(
                        "revenue"
                    );

                if (
                    revenueElement
                ) {
                    revenueElement.textContent =
                        formatCurrency(
                            result.value
                                ?.total_revenue ??
                            result.value
                                ?.revenue ??
                            result.value
                        );
                }
            }


            /* TRANSACTIONS */

            else if (
                name ===
                "transactions"
            ) {
                const transactionElement =
                    document.getElementById(
                        "totalTransactions"
                    );

                if (
                    transactionElement
                ) {
                    transactionElement.textContent =
                        formatNumber(
                            result.value
                                ?.total_transactions ??
                            result.value
                                ?.count ??
                            result.value
                        );
                }
            }


            /* SALES GRAPH */

            else if (
                name ===
                "sales"
            ) {
                renderSalesChart(
                    result.value
                );
            }


            /* PRODUCT GRAPH */

            else if (
                name ===
                "productOverview"
            ) {
                renderProductChart(
                    result.value
                );
            }
        }
    );
}


/* =========================
   WINDOW RESIZE
========================= */

let resizeTimer;

window.addEventListener(
    "resize",
    () => {
        clearTimeout(
            resizeTimer
        );

        resizeTimer =
            setTimeout(
                () => {
                    loadDashboard();
                },
                300
            );
    }
);


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        setupTopBarControls();
        loadProfileDetails();
        loadDashboard();
    }
);