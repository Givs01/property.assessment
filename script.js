const baseURL = 'https://script.google.com/macros/s/AKfycbzlmfk85RpZZXwYPzHwMSFtoeYwNoQce30pTuZUhNiHFLv8jfamkkhefOn4RPvRB8Ln/exec';

function login() {
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('loader1').style.display = 'flex';
    document.getElementById('errorMsg').textContent = '';
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch(`${baseURL}?action=verifyLogin&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`)
        .then(response => response.text())
        .then(text => {
            if (text.trim() === 'success') {
                sessionStorage.setItem('username', username);
                window.location.href = 'form.html';
            } else {
                document.getElementById('loader1').style.display = 'none';
                document.getElementById('errorMsg').textContent = 'Incorrect username or password, please enter the correct one.';
                document.getElementById('login-btn').style.display = 'flex';
                document.getElementById('username').value = '';
                document.getElementById('password').value = '';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('loader1').style.display = 'none';
            document.getElementById('errorMsg').textContent = 'An error occurred. Please try again later.';
            document.getElementById('login-btn').style.display = 'flex';
        });
}

// Function to handle logout
function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}


// Function to initialize the signature pad and form submission
function initializeSignaturePad() {
    const canvas = document.getElementById('signature-pad');
    const signaturePad = new SignaturePad(canvas);

    document.getElementById('clear-btn').addEventListener('click', function() {
        signaturePad.clear();
    });

    document.getElementById('form').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);

        document.getElementById('submitPopup').classList.add('is-active');

        saveSignature(signaturePad, formData);
    });

    document.querySelector('#successPopup .box .button.is-dark').addEventListener('click', function() {
        document.getElementById('successPopup').classList.remove('is-active');
    });
}

// Function to save the signature and form data
function saveSignature(signaturePad, formData) {
    if (signaturePad.isEmpty()) {
        document.getElementById('canvasPopup').classList.add('is-active');
        document.querySelector('#canvasPopup .button').addEventListener('click', function() {
            document.getElementById('canvasPopup').classList.remove('is-active');
        });
        // Hide the submitting popup if it's active
        document.getElementById('submitPopup').classList.remove('is-active');
        // Throw an error
        throw new Error('Signature is required.');
    } else {
        const signatureData = signaturePad.toDataURL();
        sendData(signatureData, formData, signaturePad);
    }
}

// Function to send data to the server
function sendData(signatureData, formData, signaturePad) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', baseURL);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                document.getElementById('submitPopup').classList.remove('is-active');
                document.getElementById('successPopup').classList.add('is-active');
                signaturePad.clear();  // Clear the signature pad
                document.getElementById('form').reset();  // Reset the form
            } else {
                alert('Error in submitting form. Please try again.');
                document.getElementById('submitPopup').classList.remove('is-active');
            }
        }
    };
    xhr.onerror = function() {
        alert('Network error. Please check your connection and try again.');
        document.getElementById('submitPopup').classList.remove('is-active');
        return
    };
    let combinedData = 'action=submitForm&signatureData=' + encodeURIComponent(signatureData);
    for (let pair of formData.entries()) {
        combinedData += '&' + encodeURIComponent(pair[0]) + '=' + encodeURIComponent(pair[1]);
    }
    xhr.send(combinedData);
}








// Timer variables
let logoutTimer;
let alertTimer;

// Function to start the logout countdown
function startLogoutCountdown() {
    if (window.location.pathname.endsWith('form.html')) {
    logoutTimer = setTimeout(logout, 600000); // Logout after 10 minutes (600000 milliseconds)
    alertTimer = setTimeout(() => {
        alert("You will be logged out in 1 minute due to inactivity.");
    }, 540000); // Alert after 2 minutes (120000 milliseconds)
}}

// Function to reset the logout countdown
function resetLogoutCountdown() {
    clearTimeout(logoutTimer);
    clearTimeout(alertTimer);
    startLogoutCountdown();
}



// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.endsWith('form.html')) {
        const username = sessionStorage.getItem('username');

        if (username) {
            document.getElementById('usernameDisplay').textContent = username;
            document.getElementById('username').value = username;
            initializeSignaturePad();
            startLogoutCountdown(); // Start the logout countdown when the page loads
        } else {
            console.log('No user found in sessionStorage. Redirecting to login.');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }
});

// Event listener to reset the logout countdown on any user interaction
document.addEventListener('mousemove', resetLogoutCountdown);
document.addEventListener('keypress', resetLogoutCountdown);
