const hide = document.getElementById('hide');
const password = document.getElementById('password');

function showPassword() {
    if(password.type === 'password') {
        password.type  = 'text';
        hide.src = "/image/visibility.png"
    }
    else {
            password.type  = 'password';
            hide.src = "/image/eye.png"
        }
}

hide.addEventListener('click',showPassword);