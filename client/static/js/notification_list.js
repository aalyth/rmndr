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
var intervalId; // to hold the interval id

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
        console.log('notification = ' + res[0].content);
        console.log('time = ' + notification_date.toLocaleTimeString());
        socket.emit('esp_notification', res[0].content, notification_date.toLocaleTimeString());

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
        
        // var notification = {
        //     curr_time : new Date().getTime(),
        //     curr_notif : new Date(res[0].time),
        //     curr_notif_time : curr_notif.getTime(),
        //     interval : curr_notif_time - curr_time
        // }
        // // // calculate the interval
        // // var curr_time = new Date().getTime();
        // // var curr_notif = new Date(res[0].time);
        // // var curr_notif_time = curr_notif.getTime();
        // // var interval = curr_notif_time - curr_time;
        // socket.emit('notify', notification, user)
        // // set up the interval to switch the upcoming notification
        // socket.emit('has_notifications', user);
        // socket.on('notifications_fetch_result',  async (res) => {
        //     if(res) {
        //         setTimeout(() => {
        //             socket.emit('delete_notification', user, curr_notif.toISOString());
        //             location.reload();
        //         }, interval);
        //     }
        // })
    })
}


window.onload = async function () {

    if (!localStorage.getItem('USER')){
        console.log("item")
        window.location.href = '/auth';	
    }

	socket.on('refresh_list', () => {
		location.reload();
		console.log('les goo');
	});

    load_messages();

    /*
    list.addEventListener("scroll", async function () {
        if(list.scrollTop == 0){
            var pre_load_height = list.offsetHeight;
            await load_messages();
            var diff = list.offsetHeight - pre_load_height;
            if (diff > 0) list.scrollTop = diff;
        }
    })
    */
}
