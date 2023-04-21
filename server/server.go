package main

import (
	"fmt"
	"log"
	"net/http"

    socketio "github.com/googollee/go-socket.io"
)

func getIndex(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/home" {
		http.Error(w, "404 not found.", http.StatusNotFound)
		return
	}

	if r.Method != "GET" {
        http.Error(w, "Method is not supported.", http.StatusNotFound)
        return
    }

	http.ServeFile(w, r, "../client/html/home.html")
}

func getAuth(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/auth" {
        http.Error(w, "404 not found.", http.StatusNotFound)
        return
    }

	if r.Method != "GET" {
        http.Error(w, "Method is not supported.", http.StatusNotFound)
        return
    }

	http.ServeFile(w, r, "../client/html/auth.html")
}

func getRemind(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/remind" {
        http.Error(w, "404 not found.", http.StatusNotFound)
        return
    }

	if r.Method != "GET" {
        http.Error(w, "Method is not supported.", http.StatusNotFound)
        return
    }

	http.ServeFile(w, r, "../client/html/reminder.html")
}

func handleEsp(io socketio.Server, acc string) {
    io.OnEvent("/" + acc, "newReminder", func (socket socketio.Conn) {
        log.Println("paca")
    })

}

func main() {
	port := "8080"
	static := http.FileServer(http.Dir("../client/static"))
	http.Handle("/", static);

	http.HandleFunc("/home", getIndex) 
	http.HandleFunc("/auth", getAuth) 
	http.HandleFunc("/remind", getRemind) 

    io := socketio.NewServer(nil);

    /*
    io.OnEvent("/", "connection", func (socket socketio.Socket) {
        log.Println("a device connected")

        // socket.On("getNotifications", func ()
        socket.OnEvent("/", "connectAccount" func (
    })
    */

    io.OnConnect("/", func (socket socketio.Conn) error {
        log.Println("a device connected: ", socket.ID()) 
        return nil
    })

    io.OnError("/", func (socket socketio.Conn, e error) {
        log.Println("encountered error: ", e)
    })

    io.OnDisconnect("/", func (socket socketio.Conn, reason string) {
        log.Println("device disconnected: ", socket.ID())
    })

    io.OnEvent("/", "paca", func (socket socketio.Conn, acc string) {
       	fmt.Printf("paca") 
    });

	go func() {
        log.Fatal(io.Serve())
    }()

	fmt.Printf("Starting server at port: " + port + "\n")
    if err := http.ListenAndServe(":" + port, nil); err != nil {
        log.Fatal(err)
    }
}
