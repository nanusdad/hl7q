var net = require('net');
var client = new net.Socket();

var ddpdata='{ "listId": "eLZj5uHdR4Wy9HojY", "firstname": "Patient", "middlename": "", "lastname": "One", "patientvisit": "PV1", "unit": "MED/SURG", "floor": 1, "bed": 112, "readings": [{ "name": " SpO₂", "units_short": "%", "units_long": "Percent", "value": "99" }], "createdAt": 1531479951343, "archiveChecked": false }';

client.connect(3300, 'localhost', function() {
	console.log('Connected');
	/* client.write('Hello, server! Love, Client.');
	 client.write(hl7_alert); */
	client.write(ddpdata);
});
var i = 0;
client.on('data', function(data) {
	console.log('Received: ' + data);
	i++;
	if(i==2)
		client.destroy(); 
});
client.on('close', function() {
	console.log('Connection closed');
});
