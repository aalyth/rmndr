var sign_out = document.getElementById("sign_out");
var home = document.getElementById("home");
var remind = document.getElementById("remind");
var socket = io();

var isSignedIn = !!localStorage.getItem('UUID');

sign_out.addEventListener("click", async () => {
    
    localStorage.removeItem('UUID');
    socket.emit('changeRoom', ' ');

})


