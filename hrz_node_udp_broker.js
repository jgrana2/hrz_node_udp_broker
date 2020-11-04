//Horizon Medical Node UDP Broker

const udp = require('dgram')
const conf = require('./config')
const server = udp.createSocket('udp4')
var ip = require('ip');
var MongoClient = require('mongodb').MongoClient;
const log = require('cllc')();
log.dateFormat('%F %T %z');

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/IoTEKGSignalDb", { useUnifiedTopology: true },function(err, db) {
  if(!err) {
    log.info("DB connected");
  }
});

// On error, log and close server
server.on('error', (error) => {
    log.info("udp_server", "error", error)
    server.close()
})

// On new UDP message, print received data
log.start('Messages received: %s', 0);
server.on('message', (msg,info) => {
    log.step();
    log.info(msg.toString('hex') + ` | Received ${msg.length} bytes from ${info.address}:${info.port}`)

    // Respond
    // let timestp = new Date()
    // const response = {
    //     description: 'UDP PORT TEST',
    //     serverPort: conf.port,
    //     timestamp: timestp.toJSON(),
    //     received: {
    //         message: msg.toString(),
    //         fromIP: info.address,
    //         fromPort: info.port
    //     }
    // }
    // const data = Buffer.from(JSON.stringify(response))
    //
    // server.send(data, info.port, info.address, (error, bytes) => {
    //     if(error){
    //         log.info("udp_server", "error", error)
    //         client.close()
    //     } else {
    //         log.info("udp_server", "info", 'Data sent')
    //     }
    // })
})  // end server.on

//On server ready, print info
server.on('listening', () => {
    const address = server.address()
    const port = address.port
    const family = address.family
    const ipaddr = ip.address()

    log.info('Server is listening at port ' + port)
    log.info('Server ' + family + ' address: ' + ipaddr)
})

//On server close, log info
server.on('close', () => {
    log.stop();
    log.info("udp_server", "info", 'Socket is closed !')
})

//Listen for datagram messages on a named port
server.bind(conf.port)
