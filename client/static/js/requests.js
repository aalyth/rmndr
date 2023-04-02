async function getFromRoute(route, method = "GET"){
    
    var response = await fetch(route, {
        method : method,
        mode : 'no-cors'
    })

    if(response.ok){
        return response.json();
    }

    return null;
}

async function sendToRoute(data, route){

    var response = await fetch(route, {
        method : "POST",
        body : JSON.stringify(data),
        mode : 'no-cors'

    })

    return response;
}