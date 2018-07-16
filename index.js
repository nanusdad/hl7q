var net = require('net');
var textChunk = '';

var DDPClient = require("ddp");

var ddpclient = new DDPClient({
	// All properties optional, defaults shown
	host: "localhost",
	port: 3000,
	ssl: false,
	autoReconnect: true,
	autoReconnectTimer: 500,
	maintainCollections: true,
	ddpVersion: '1', // ['1', 'pre2', 'pre1'] available
	// uses the SockJs protocol to create the connection
	// this still uses websockets, but allows to get the benefits
	// from projects like meteorhacks:cluster
	// (for load balancing and service discovery)
	// do not use `path` option when you are using useSockJs
	useSockJs: true
	// Use a full url instead of a set of `host`, `port` and `ssl`
	// do not set `useSockJs` option if `url` is used
	//url: 'wss://example.com/websocket'
});

var server = net.createServer(function(socket) {
	socket.write('Echo server\r\n');
	socket.on('data', function(data){
		console.log(data);
		textChunk = data.toString('utf8');
		console.log(textChunk);
		socket.write(textChunk);
		var ddpdata = JSON.parse(textChunk);
		callDDP('addAlert', ddpdata);
	});
});
server.listen(3300, '127.0.0.1');


function callDDP(methodname, parameters) {
	ddpclient.connect(function (error, wasReconnect) {
		// If autoReconnect is true, this callback will be invoked each time
		// a server connection is re-established
		if (error) {
			console.log('DDP connection error!');
			return;
		} else {
			console.log('DDP connection success!');
		}

		if (wasReconnect) {
			console.log('Reestablishment of a connection.');
		}

		console.log('connected!');

		console.log(methodname, parameters);

		setTimeout(function () {
			/*
			 * Call a Meteor Method
			 */
			ddpclient.call(
				methodname, // name of Meteor Method being called
				[parameters], // parameters to send to Meteor Method
				function (err, result) { // callback which returns the method call results
					console.log('called method ' + methodname + ' result: ' + result);
				},
				function () { // callback which fires when server has finished
					console.log('updated'); // sending any updated documents as a result of
					ddpclient.close();
				}
			);
		}, 3000);
	});
}
