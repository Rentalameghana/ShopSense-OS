console.log("customer.js loaded");

const API_URL = "http://127.0.0.1:8000/customers";


async function loadCustomers() {

    try {

        const response = await fetch(API_URL + "/");

        const customers = await response.json();

        let rows = "";

        customers.forEach(customer => {

            rows += `
                <tr>
                    <td>${customer.id}</td>
                    <td>${customer.customer_name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.phone}</td>
                </tr>
            `;

        });

        document.getElementById("customerTable").innerHTML = rows;

    }

    catch (error) {

        console.error(error);
        alert("Unable to load customers.");

    }

}


async function addCustomer() {

    const customer_name = document.getElementById("customerName").value;
    const email = document.getElementById("customerEmail").value;
    const phone = document.getElementById("customerPhone").value;

    if (!customer_name || !email || !phone) {

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
                email,
                phone
            })

        });

        if (response.ok) {

            alert("Customer Added Successfully!");

            document.getElementById("customerName").value = "";
            document.getElementById("customerEmail").value = "";
            document.getElementById("customerPhone").value = "";

            loadCustomers();

        } else {

            alert("Failed to add customer.");

        }

    }

    catch (error) {

        console.error(error);
        alert("Server Error!");

    }

}


loadCustomers();