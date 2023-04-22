var sign_out = document.getElementById("sign_out");
var home = document.getElementById("home");
var remind = document.getElementById("remind");
var socket = io();

var isSignedIn = !!localStorage.getItem('USER');

sign_out.addEventListener("click", async () => {
    
    localStorage.removeItem('USER');
    socket.emit('changeRoom', ' ');

})


