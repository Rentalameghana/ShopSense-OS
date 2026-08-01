console.log("product.js loaded");


const API_URL = "http://127.0.0.1:8000/products";


// Load Products

async function loadProducts(){

    try{

        const response = await fetch(API_URL + "/");

        const products = await response.json();


        let rows = "";


        products.forEach(product => {

            rows += `

            <tr>

                <td>${product.id}</td>

                <td>${product.product_name}</td>

                <td>${product.category}</td>

                <td>₹${product.price}</td>

            </tr>

            `;

        });


        document.getElementById("productTable").innerHTML = rows;


    }

    catch(error){

        console.error(error);

        alert("Unable to load products.");

    }

}





// Add Product

async function addProduct(){


    const product_name =
    document.getElementById("product_name").value;


    const category =
    document.getElementById("category").value;


    const price =
    document.getElementById("price").value;



    if(!product_name || !category || !price){

        alert("Please fill all fields.");

        return;

    }



    try{


        const response = await fetch(API_URL + "/", {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },


            body:JSON.stringify({

                product_name: product_name,

                category: category,

                price: Number(price)

            })


        });



        if(response.ok){


            alert("Product Added Successfully!");


            document.getElementById("product_name").value="";
            document.getElementById("category").value="";
            document.getElementById("price").value="";


            loadProducts();


        }

        else{


            alert("Failed to add product.");

        }


    }


    catch(error){


        console.error(error);

        alert("Server Error!");

    }


}





loadProducts();