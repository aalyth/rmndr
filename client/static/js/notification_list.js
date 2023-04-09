var notifications = document.getElementsByClassName("notification");


if(!!localStorage.getItem("NOTIFICATION")){


    notifications[0].innerHTML = (
        "<h2> "+localStorage.getItem("NOTIFICATION")+" </h2>" +
        "<h3> at 09.04.2023-17:45 </h3>"
    );

    notifications[1].innerHTML = (
        "<h2> "+localStorage.getItem("NOTIFICATION")+" </h2>" +
        "<h3> at 09.04.2023-17:45 </h3>"
    );
    notifications[1].style.display = "inline-block";
}
