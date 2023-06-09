if (!localStorage.getItem('UUID')){
    console.log("item")
    window.location.href = '/auth';	
}

const today = new Date();// get local current date
const dateToday = today.toLocaleString("EN-CA").slice(0,10);
const timeNow = "T"+today.toLocaleTimeString("EN-GB").slice(0,5);
document.querySelectorAll('input[type="datetime-local"]').forEach(el=>{
    el.min = el.value = dateToday+timeNow;
})

var socket = io();
var submit = document.getElementById("submit");
var description = document.getElementById("desc");
var date = document.getElementById("date")
var user = localStorage.getItem('UUID');
socket.emit('changeRoom', user);

submit.addEventListener("click", async function(){
    var options = { hour12: false };
    var dateValue = new Date(date.value).toLocaleString('en-Gb', options);
    dateValue = dateValue.slice(0, -3);
    var dateRaw = dateValue.split('/');
    dateValue = dateRaw[1] + '/' + dateRaw[0] + '/' + dateRaw[2];
    socket.emit("postNotification", user, dateValue, description.value);
    document.getElementsByClassName("reminder-content")[0].reset();
    window.location.href = '/';
})
