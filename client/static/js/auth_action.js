function get_location(){
    return window.location.href;
}

var submit = document.getElementById("submit");
var current_url = get_location();
var username = document.getElementById("username");
var password = document.getElementById("password");

if (current_url == "http://localhost:8080/auth?mode=SIGN_UP"){
    console.log("huinq");
    var confirm_password = document.getElementById("confirm-password");
    submit.addEventListener("click", function(){
    
            if(confirm_password.value == password.value){
                localStorage.setItem("USERNAME", username.value);
                localStorage.setItem("PASSWORD", password.value)
                window.location.href = "/auth"
            }
            else {
                alert("Password mismatch");
            }
    })
}

if (current_url == "http://localhost:8080/auth?mode=SIGN_IN" || current_url == "http://localhost:8080/auth"){
    console.log("drug kur")
    submit.addEventListener("click", function(){
        console.log("clicj!")
        if(localStorage.getItem("USERNAME") == username.value && localStorage.getItem("PASSWORD") == password.value){
            window.location.href = "/remind"
        }
        else{
            alert ("Invalid password or username");
        }
    })
}
