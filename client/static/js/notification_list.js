if (!localStorage.getItem('USER')){
    console.log("item")
    window.location.href = '/auth';	
}

var list = document.getElementsByClassName("notification-list")[0];
var upcoming = document.getElementsByClassName("upcoming-notification")[0];
var user = localStorage.getItem('USER');
var socket = io();
var upper = 30;
var lower = 0;

async function load_messages(){

    console.log(user);
    socket.emit('get_notifications',  user, lower, upper);
    socket.on('post_notifications', async (res) => {


        //spi mi se

        var notification_date = new Date(res[0].time);

        upcoming.innerHTML = ( 
            "<div class='upcoming-notification'>" + 
            "<h1> Upcoming reminder </h1>" +
            "<div class = 'notification'>" + 
            "<h2>" + res[0].content + "</h2>" +
            "<h3>at " + notification_date.toLocaleDateString() + 
            ", " + notification_date.toLocaleTimeString() + 
            "</h3>" + "</div>" +"</div>"
        )


         for (notification of res){

            var newNotification = document.createElement("div");
            newNotification.className = "notification";
            newNotification.setAttribute("id", notification.time);
            var notification_date = new Date(notification.time);
            newNotification.innerHTML = ("<h2>" + notification.content + "</h2>" +
                "<h3>at " + notification_date.toLocaleDateString() + ", " + notification_date.toLocaleTimeString() + "</h3>"
            );

            list.appendChild(newNotification);
            lower+=1;
         }

         upper+=30;
     })

}


window.onload = async function () {

    if (!localStorage.getItem('USER')){
        console.log("item")
        window.location.href = '/auth';	
    }

    if(list.scrollTop == 0){
        load_messages();
    }

   // var curr_time = new Date().getTime();
    //var curr_notif_time = new Date(document.getElementsByClassName("notification")[1].id);
    //var interval = (curr_noti_time - curr_time) * 1000
   

    list.addEventListener("scroll", async function () {
        if(list.scrollTop == 0){
			var pre_load_height = list.offsetHeight;
            await load_messages();
			var diff = list.offsetHeight - pre_load_height;
			if (diff > 0) list.scrollTop = diff;
        }
    })
}


