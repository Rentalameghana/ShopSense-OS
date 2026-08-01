console.log("transaction.js loaded");

const API_URL = "http://127.0.0.1:8000/transactions";


// Load Transactions
async function loadTransactions() {

    try {

        const response = await fetch(API_URL + "/");

        if (!response.ok) {
            throw new Error("Failed to load transactions");
        }

        const transactions = await response.json();

        let rows = "";

        transactions.forEach(transaction => {

            rows += `
                <tr>
                    <td>${transaction.id}</td>
                    <td>${transaction.customer_name}</td>
                    <td>${transaction.product_name}</td>
                    <td>₹${transaction.amount}</td>
                    <td>${transaction.transaction_date}</td>
                </tr>
            `;

        });

        document.getElementById("transactionTable").innerHTML = rows;

    } catch (error) {

        console.error(error);
        alert("Unable to load transactions.");

    }
}


// Add Transaction
async function addTransaction() {

    const customer_name =
        document.getElementById("customerName").value.trim();

    const product_name =
        document.getElementById("productName").value.trim();

    const amount =
        Number(document.getElementById("amount").value);

    const transaction_date =
        document.getElementById("transactionDate").value;


    if (!customer_name || !product_name || !amount || !transaction_date) {

        alert("Please fill all fields.");
        return;

    }


    try {

        const response = await fetch(API_URL + "/", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                customer_name,
                product_name,
                amount,
                transaction_date
            })

        });


        if (!response.ok) {

            const errorData = await response.text();
            console.error(errorData);

            alert("Failed to add transaction.");
            return;

        }


        alert("Transaction Added Successfully!");

        document.getElementById("customerName").value = "";
        document.getElementById("productName").value = "";
        document.getElementById("amount").value = "";
        document.getElementById("transactionDate").value = "";

        await loadTransactions();

    } catch (error) {

        console.error(error);
        alert("Server Error!");

    }
}


loadTransactions();