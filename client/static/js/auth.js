const MODE = window.location.search.includes('SIGN_UP') ? 'SIGN_UP' : 'SIGN_IN';

const change = document.querySelector('.auth-change');
const changeLink = document.querySelector('.auth-change > a');

const authTitle = document.querySelector('.auth-title');
const confirmPasswordLabel = document.querySelector('.confirm-password-field');
const confirmPasswordInput = document.querySelector('#confirm-password');

if (MODE === 'SIGN_IN') {
    change.innerText = "Don't have an account? ";

    changeLink.innerText = "Sign up";
    changeLink.href = "/auth?mode=SIGN_UP";

    change.appendChild(changeLink);

    authTitle.innerText = "Sign in";

    confirmPasswordLabel.remove();
    confirmPasswordInput.remove();
} 


