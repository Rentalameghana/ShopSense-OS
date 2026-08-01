console.log("analytics.js loaded");


async function loadAnalytics() {

    try {

        // Total Revenue
        const revenueResponse = await fetch(
            "http://127.0.0.1:8000/transactions/revenue"
        );

        const revenueData = await revenueResponse.json();

        document.getElementById("totalRevenue").innerText =
            "₹" + revenueData.total_revenue;



        // Total Transactions
        const transactionResponse = await fetch(
            "http://127.0.0.1:8000/transactions/count"
        );

        const transactionData = await transactionResponse.json();

        document.getElementById("totalTransactions").innerText =
            transactionData.total_transactions;



        // Total Customers
        const customerResponse = await fetch(
            "http://127.0.0.1:8000/customers/count"
        );

        const customerData = await customerResponse.json();

        document.getElementById("totalCustomers").innerText =
            customerData.total_customers;



        // Sales Chart
        const salesResponse = await fetch(
            "http://127.0.0.1:8000/analytics/sales"
        );

        const salesData = await salesResponse.json();


        new Chart(
            document.getElementById("salesChart"),
            {
                type: "bar",

                data: {

                    labels: salesData.map(
                        item => item.product
                    ),

                    datasets: [
                        {
                            label: "Sales Amount",

                            data: salesData.map(
                                item => item.amount
                            )
                        }
                    ]

                }

            }
        );



        // Product Chart
        const productResponse = await fetch(
            "http://127.0.0.1:8000/analytics/products"
        );


        const productData = await productResponse.json();



        new Chart(
            document.getElementById("productChart"),
            {

                type: "pie",

                data: {

                    labels: productData.map(
                        item => item.product
                    ),

                    datasets: [
                        {
                            label: "Products",

                            data: productData.map(
                                item => 1
                            )
                        }
                    ]

                }

            }
        );


    }

    catch(error) {

        console.log(error);

        alert("Unable to load analytics");

    }

}



loadAnalytics();