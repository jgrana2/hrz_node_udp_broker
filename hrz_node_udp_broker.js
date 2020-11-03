//Horizon Medical Node UDP Broker

const udp = require('dgram')
const conf = require('./config')
const server = udp.createSocket('udp4')

// On error, log and close server
server.on('error', (error) => {
    console.log("udp_server", "error", error)
    server.close()
})

// On new UDP message, print received data
server.on('message', (msg,info) => {
    console.log("udp_server", "info", msg.toString('hex') + ` | Received ${msg.length} bytes from ${info.address}:${info.port}`)

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
    //         console.log("udp_server", "error", error)
    //         client.close()
    //     } else {
    //         console.log("udp_server", "info", 'Data sent')
    //     }
    // })
})  // end server.on

//On server ready, print info
server.on('listening', () => {
    const address = server.address()
    const port = address.port
    const family = address.family
    const ipaddr = address.address

    console.log("udp_server", "info", 'Server is listening at port ' + port)
    console.log("udp_server", "info", 'Server ip :' + ipaddr)
    console.log("udp_server", "info", 'Server is IP4/IP6 : ' + family)
})

//On server close, log info
server.on('close', () => {
    console.log("udp_server", "info", 'Socket is closed !')
})

//Listen for datagram messages on a named port
server.bind(conf.port)
