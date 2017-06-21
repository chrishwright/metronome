// content of index.js
var http = require('http')
var request = require('request')
var port = 3000

var access_token = ""

var headers = {
     'Authorization' : 'Basic your_code_here' 
}

// Configure the request
var options = {
    url: 'https://accounts.spotify.com/api/token',
    method: 'POST',
    headers: headers,
    form: { 'grant_type' : 'client_credentials' }
}

// Start the request
request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var json = JSON.parse(body);
        access_token = json["access_token"];
    }
})

var requestHandler = (request, response) => {  
  console.log(request.url)
  response.end(access_token)
}

var server = http.createServer(function(request, response) {
	response.setHeader('Access-Control-Allow-Origin', 'http://www.metronome.com');
	response.setHeader('Access-Control-Request-Method', '*');
	response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	response.setHeader('Access-Control-Allow-Headers', '*');
  	response.writeHead(200, {"Content-Type": "text/html"});
    response.write(access_token);
    response.end();
});

server.listen(port, (err) => {  
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})