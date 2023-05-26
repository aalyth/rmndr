if (!localStorage.getItem('USER')){
    console.log("item")
    window.location.href = '/auth';	
}


var socket = io();
var submit = document.getElementById("submit");
var description = document.getElementById("desc");
var date = document.getElementById("date")
var user = localStorage.getItem('USER');

submit.addEventListener("click", async function(){
    var options = { hour12: false };
    var dateValue = new Date(date.value).toLocaleString('en-US', options);
    dateValue = dateValue.slice(0, -3)
    socket.emit("postNotification", user, dateValue, description.value);
    document.getElementsByClassName("reminder-content")[0].reset();
    window.location.href = '/';
})
