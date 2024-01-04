const password = document.querySelector('#password');
const confirmPassword = document.querySelector('#confirmpassword');
const showPassword1 = document.querySelector('#show-password-1');
const showPassword2 = document.querySelector('#show-password-2');

function showPassword() {
    if (password.type === 'password') {
        password.type = 'text';
        showPassword1.src = "/image/visibility.png"
    } else {
        password.type = 'password';
        showPassword1.src = "/image/eye.png"
    }
}

function showConfirmPassword() {
    if (confirmPassword.type === 'password') {
        confirmPassword.type = 'text';
        showPassword2.src = "/image/visibility.png"
    } else {
        confirmPassword.type = 'password';
        showPassword2.src = "/image/eye.png"
    }
}

showPassword1.addEventListener('click', showPassword);
showPassword2.addEventListener('click', showConfirmPassword);
