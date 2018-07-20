var net = require('net');
var client = new net.Socket();

//var ddpdata='{ "listId": "PiJayFp9Yi6Wr93vi", "firstname": "Patient", "middlename": "", "lastname": "One", "patientvisit": "PV1", "unit": "MED/SURG", "floor": 1, "bed": 112, "readings": [{ "name": " SpO₂", "units_short": "%", "units_long": "Percent", "value": "99" }], "createdAt": 1531479951343, "archiveChecked": false, "assignee" : "" }';

var ddpdata='♂MSH|^~\&|PSN|PSN|EMR|EMR|20180717051637.8010-0700||ORU^R40^ORU_R40|2ca4f8b3-0866-4060-b57a-63fb554c\rOBR|1|c1b7c69d-d8ec-402b-951e-5045f036d035^^dc4a3effff61e11f^EUI-64|619a0d17-7943-4134-8136-28aed3999c28^^dc4a3effff61e11f^EUI-64|196616^MDC_EVT_ALARM^MDC|||20180717051637.8011-0700||||||||||||||||||||||^6bb8a383-8a42-4c74-ad2e-98d0aab5cb9b&&dc4a3effff61e11f&EUI-64|||||||||||||||252465000^Pulse oxim\rOBX|1|ST|69965^MDC_DEV_MON_PHYSIO_MULTI_PARAM_MDS^MDC|1.0.0.0|||||||X|||||||2000009264^Eagle^masimo.\rOBX|3|ST|196674^MDC_EVT_LO_VAL_LT_LIM^MDC|1.1.0.1.1|SPO2 LOW|||L~SP|||R|||20180717051637.790-0700|||\rOBX|4|NM|150456^MDC_PULS_OXIM_SAT_O2^MDC|1.1.0.1.2|98|262688^MDC_DIM_PERCENT^MDC|>98||||R|||20180717\r∟BX|7|ST|68483^MDC_ATTR_ALARM_INACTIVATION_STATE^MDC|1.1.0.1.5|enabled||||||R';

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
