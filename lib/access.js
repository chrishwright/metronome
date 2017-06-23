var request = require('request');
var access_key = require('../.env');

var headers = {
     'Authorization' : 'Basic ' + process.env.ENCRYPTED_KEY + ''
};

// Configure the request
var options = {
    url: 'https://accounts.spotify.com/api/token',
    method: 'POST',
    headers: headers,
    form: { 'grant_type' : 'client_credentials' }
};

// Start the request
request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var json = JSON.parse(body);
        access_token = json["access_token"];
    }
});

exports.getAccessToken = function() {
	return access_token;
};