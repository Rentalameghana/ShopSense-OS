console.log("dashboard.js loaded");


async function loadDashboard() {

    try {

        // Active Vendors
        const activeResponse = await fetch(
            "http://127.0.0.1:8000/vendors/count/active"
        );

        const activeData = await activeResponse.json();

        document.getElementById("activeVendors").innerText =
            activeData.active_vendors;


        // Total Vendors
        const vendorResponse = await fetch(
            "http://127.0.0.1:8000/vendors/"
        );

        const vendors = await vendorResponse.json();

        document.getElementById("totalVendors").innerText =
            vendors.length;


        // Total Products
        const productResponse = await fetch(
            "http://127.0.0.1:8000/products/count"
        );

        const productData = await productResponse.json();

        document.getElementById("totalProducts").innerText =
            productData.total_products;

    }

    catch (error) {

        console.log(error);

        alert("Unable to load dashboard.");

    }

}


loadDashboard();