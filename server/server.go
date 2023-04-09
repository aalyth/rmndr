package main

import (
	"fmt"
	"log"
	"net/http"
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

func main() {
	static := http.FileServer(http.Dir("../client/static"))
	http.Handle("/", static);

	http.HandleFunc("/home", getIndex) 
	http.HandleFunc("/auth", getAuth) 
	http.HandleFunc("/remind", getRemind) 

	fmt.Printf("Starting server at port 80\n")
    if err := http.ListenAndServe(":80", nil); err != nil {
        log.Fatal(err)
    }
}
