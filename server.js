var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var access = require('./lib/access');
var port = 3000;
var cache = {};

function send404(response) {
    
    response.writeHead(404, {'Content-Type':'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();

}; // end send404()

function sendFile(response, filePath, fileContents) {

    response.writeHead(200, {"Content-Type": mime.lookup(path.basename(filePath))});
    response.end(fileContents);

}; // end sendFile()

function serveStatic(response, cache, absPath) {

    if(cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function(exists) {
            if(exists) {
                fs.readFile(absPath, function(err, data) {
                    if(err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                }); // end fs.readFile()
            } else {
                send404(response);
            }
        }); // end fs.exists()
    }
}; // end serveStatic()

var server = http.createServer(function(request, response) {

	response.setHeader('Access-Control-Allow-Origin', 'https://fathomless-castle-50235.herokuapp.com/');
	response.setHeader('Access-Control-Request-Method', '*');
	response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	response.setHeader('Access-Control-Allow-Headers', '*');

    var filePath = false;
    
    if(request.url == '/access_token') {
    	var access_token = access.getAccessToken();
	  	response.writeHead(200, {"Content-Type": "text/html"});
    	response.write(access_token);
    	response.end();    	
    } else if(request.url == '/') {
        filePath = 'public/index.html';
    } else {
        filePath = 'public' + request.url;
    }

    var absPath = './' + filePath;
    
    if(filePath != false) {
	    serveStatic(response, cache, absPath);
	}

}); // end createServer()

server.listen(port, function() {
    
    console.log(`Server is listening on port ${port}`);

}); // end listen()
