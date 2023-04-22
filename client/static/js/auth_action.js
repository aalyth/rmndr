if (!!localStorage.getItem('USER')){
    console.log("item")
    window.location.href = '/';	
}

function get_location(){
    return window.location.href;
}

var submit = document.getElementById("submit");
var current_url = get_location();
var socket = io();

var username = document.getElementById("username");
var password = document.getElementById("password");


if (MODE == 'SIGN_UP'){
    
    var confirm_password = document.getElementById("confirm-password");

    submit.addEventListener('click', async function(){

        console.log('click');
        var username_value = username.value;
        var password_value = password.value;
        var confirm_password_value = confirm_password.value;
    
        console.log(username_value, password_value, confirm_password_value);
    
        let res = await validate('register', username_value, password_value, confirm_password_value);
    
        if(!res){
            clear_form();
            return;
        }
    
        res = await authenticate(socket, 'register', username_value, password_value);
    
        if(!res){
            clear_form();
            return;
        }
    
    });
}

if (MODE == 'SIGN_IN'){
    
    submit.addEventListener('click', async function(){
        var username_value = username.value;
        var password_value = password.value;
    
        let res = await validate('login', username_value, password_value);
    
        if(!res){
            clear_form();
            return;
        }
    
        res = await authenticate(socket, 'login', username_value, password_value);
    
        if(!res){
            clear_form();
            return;
        }
    });
}
