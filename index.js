var net = require('net');
const parser = require('@rimiti/hl7-object-parser');
const s12Mapping = require('./s12.json');
var textChunk = "";

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

var server = net.createServer(function (socket) {
    socket.write('Echo server\r\n');
    socket.on('data', function (data) {
        textChunk += data.toString('utf8'); // Add string on the end of the variable 'textChunk'   		
        d_index = textChunk.indexOf(''); // Find the delimiter '\u001C () file seperator or \u000b (♂) male'       
        // While loop to keep going until no delimiter can be found
        while (d_index > -1) {
            try {
                subTextChunk = textChunk.substring(0, d_index); // Create string up until the delimiter                
                if (subTextChunk) {
                    const parsed_json_data = parser.decode(subTextChunk, s12Mapping);
                    // var msh = 'MSH|^~\&|' + parsed_json_data.MSH.C + '|' + parsed_json_data.MSH.D + '|' + parsed_json_data.MSH.E + '|' + parsed_json_data.MSH.F + '|' + parsed_json_data.MSH.G + '|' + parsed_json_data.MSH.H + '|ACK^R40^ACK|' + parsed_json_data.MSH.J + '|' + parsed_json_data.MSH.K + '|' + parsed_json_data.MSH.L + '|' + parsed_json_data.MSH.M + '|' + parsed_json_data.MSH.N + '|' + parsed_json_data.MSH.O + '|' + parsed_json_data.MSH.P + '|' + parsed_json_data.MSH.Q + '|' + parsed_json_data.MSH.R + '|' + parsed_json_data.MSH.S + '|' + parsed_json_data.MSH.T + '|' + parsed_json_data.MSH.Ua + '^' + parsed_json_data.MSH.Ub + '^' + parsed_json_data.MSH.Uc + '^' + parsed_json_data.MSH.Ud;
                    // var msa = 'MSA|AA|' + parsed_json_data.MSH.J;
                    // var message_ack = msh + "\n" + msa;
                    //console.log(message_ack);
                    //socket.write(message_ack);

                    //console.log('----------------------------PARSED JSON DATA START------------------------------');
                    //console.log(parsed_json_data);
                    //console.log('\n----------------------------PARSED JSON DATA END------------------------------\n');
                    if (parsed_json_data.PV1 && parsed_json_data.OBX3 && parsed_json_data.OBX4) {
                        if (parsed_json_data.PV1.point_of_care && parsed_json_data.PV1.room && parsed_json_data.PV1.bed && parsed_json_data.PV1.floor && parsed_json_data.OBX3.parameter_name) {
                            if ((parsed_json_data.OBX4.value_type == 'NM') && (parsed_json_data.OBX4.value)) {
                                callDDP('addAlert', parsed_json_data);
                            } else if (parsed_json_data.OBX4.value_type == 'CWE') {
                                parsed_json_data.OBX4.value = '';
                                callDDP('addAlert', parsed_json_data);
                            }
                        }
                    }
                }
            } catch (ex) {
                console.log(ex);
            }

            textChunk = textChunk.substring(d_index + 1); // Cuts off the processed textChunk
            d_index = textChunk.indexOf(''); //  Find the delimiter '\u001C () file seperator or \u000b (♂) male'
        }
    });
});
//server.listen(3300, '127.0.0.1');     //localhost
//server.listen(3300, '104.236.118.123');   //One Health server IP to be set in SafetyNet
server.listen(3300, '10.1.40.152');   //One Health laptop IP set in Masimo's SafetyNet

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

        setTimeout(function () {
            /* Call a Meteor Method */
            ddpclient.call(
                methodname, // name of Meteor Method being called
                [parameters], // parameters to send to Meteor Method
                function (err, result) { // callback which returns the method call results
                    console.log('called method ' + methodname);
                },
                function () { // callback which fires when server has finished
                    console.log('updated'); // sending any updated documents as a result of
                    ddpclient.close();
                }
            );
        }, 0);
    });
}
