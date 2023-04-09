var submit = document.getElementById("submit");
var description = document.getElementById("desc");

submit.addEventListener("click", function(){
    localStorage.setItem("NOTIFICATION", description.value);
    window.location.href = "/home"
})