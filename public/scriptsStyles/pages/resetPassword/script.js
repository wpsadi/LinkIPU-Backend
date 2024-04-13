
const update_btn = document.getElementById('update_btn');
const card = document.getElementById('user_card');

const pw_rules = document.getElementById("pw-rules")

const resetBtn = document.getElementById('reset_btn');

const password = document.getElementById('password');

const toast = document.getElementById('toast');
const toastErr = document.getElementById('toast-danger');

toast.classList.add("hidden");
toastErr.classList.add("hidden");

async function fetchData() {
    try {
        const response = await fetch('/v1/user/password-instructions');
        const data = await response.json();


        return data;

    } catch (error) {
        throw new Error("Error while fetching Instructions")
    }
}

async function checkPass(password) {
    try {
        const response = await fetch('/v1/user/check-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        const data = await response.json();


        return data.response;

    } catch (error) {
        throw new Error("Error while fetching Instructions")
    }
}

async function submitRequest(password) {
    // Get the query string from the URL
    const queryString = window.location.search;

    // Create a URLSearchParams object from the query string
    const urlParams = new URLSearchParams(queryString);

    // Get the value of a specific query parameter by its name
    const requestID = urlParams.get('requestID');

    try {
        console.log(password)
        const response = await fetch('/v1/user/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password, requestID })
        });
        const data = await response.json();

        
        return data.success;

    } catch (error) {
        return false
    }
}



// console.log(pw_rules);

update_btn.addEventListener('click', async () => {
    update_btn.classList.toggle("hidden");
    card.classList.toggle("hidden");
    card.classList.toggle("flex");

    const data = await fetchData();
    let arr = data.response

    arr.map((instruction) => {
        pw_rules.innerHTML += ` <li class="flex items-center mb-1 pw-rule">${instruction}</li>`
    })

});

resetBtn.addEventListener('click', async (event) => {
    event.preventDefault()
    toast.classList.add("hidden");
    toastErr.classList.add("hidden");


    if (password.value.length < 8) {
        toast.classList.remove("hidden");
        return
    }
    const check = await checkPass(password.value);

    if (check) {
        toast.classList.add("hidden");

    }
    else {
        toast.classList.remove("hidden");
    }

    //Save Password
    let success = await submitRequest(password.value)



    if (success === true) {
        document.getElementById("destroy").innerHTML = ""
        document.getElementById("status").innerText = "Successfull"
        document.getElementById("status-desc").innerText = "Password Changed!"
    }
    else {
        toastErr.classList.remove("hidden");
    }
})