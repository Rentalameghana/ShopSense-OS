console.log("vendor.js loaded");


const API_URL = "http://127.0.0.1:8000";



// Load Vendors

async function loadVendors() {

    try {

        const response = await fetch(`${API_URL}/vendors/`);

        const vendors = await response.json();


        const table = document.getElementById("vendorTable");


        if(!table){
            return;
        }


        table.innerHTML = "";


        vendors.forEach(vendor => {


            table.innerHTML += `

            <tr>

                <td>${vendor.id}</td>

                <td>${vendor.business_name}</td>

                <td>${vendor.corporate_email}</td>

                <td>${vendor.status}</td>


                <td>

                    <button onclick="updateStatus(${vendor.id}, 'Approved')">
                        Approve
                    </button>


                    <button onclick="updateStatus(${vendor.id}, 'Suspended')">
                        Suspend
                    </button>


                    <button onclick="updateStatus(${vendor.id}, 'Pending')">
                        Pending
                    </button>


                </td>


            </tr>

            `;


        });


    }

    catch(error){

        console.log(error);

        alert("Unable to load vendors");

    }

}





// Add Vendor Button

async function addVendor(){


    const business_name =
    document.getElementById("business_name").value;



    const corporate_email =
    document.getElementById("corporate_email").value;



    if(business_name === "" || corporate_email === ""){


        alert("Please enter vendor details");

        return;

    }




    const vendorData = {


        business_name: business_name,

        corporate_email: corporate_email


    };





    try {


        const response = await fetch(

            `${API_URL}/vendors/`,

            {

                method:"POST",


                headers:{

                    "Content-Type":"application/json"

                },


                body: JSON.stringify(vendorData)


            }

        );




        const data = await response.json();



        console.log(data);



        if(response.ok){


            alert("Vendor Added Successfully");


            document.getElementById("business_name").value = "";

            document.getElementById("corporate_email").value = "";


            loadVendors();


        }

        else{


            alert("Failed to add vendor");


        }



    }


    catch(error){


        console.log(error);

        alert("Backend connection failed");


    }


}







// Update Vendor Status


async function updateStatus(id,status){


    try{


        const response = await fetch(

            `${API_URL}/vendors/${id}/status`,

            {

                method:"PUT",

                headers:{

                    "Content-Type":"application/json"

                },


                body:JSON.stringify({

                    status:status

                })


            }

        );



        if(response.ok){


            alert("Status Updated");


            loadVendors();


        }


    }


    catch(error){

        console.log(error);

    }


}





// Page Load

loadVendors();