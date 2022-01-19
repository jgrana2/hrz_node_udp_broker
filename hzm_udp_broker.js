/* Copyright HORIZON MEDICAL S.A.S 2020 www.horizonmedical.co */
// Horizon Medical Node UDP Broker

// UDP Server
const hzm_udp = require('dgram')
const hzm_conf = require('./config')
const hzm_udp_server = hzm_udp.createSocket('udp4')
const hzm_channel_buffer_size = 169 // 1 byte for channel number and 84 bytes of 16-bit samples

// Get IP Address
var ip = require('ip')

// Database
const {
  MongoClient
} = require("mongodb")
const hzm_url = "mongodb://localhost:27017/?useUnifiedTopology=true"
const hzm_db_name = 'IoTEKGSignalDb'
const hzm_device_id = "device1"
const hzm_collection_name = hzm_device_id

// Socket.io broadcast server
const io = require("socket.io")();
io.listen(hzm_conf.socket_io_port);

// Welcome new socket clients
io.on("connection", socket => {
  log.info("Socket client", socket.id, "connected")
})

// Logger
const log = require('cllc')()
log.dateFormat('%F %T %z')

// Application global variables
var hzm_preaggregate_counter = 0
var hzm_preaggregate_factor = 30
var hzm_preaggregate_channel_1_buffer = Buffer.alloc(hzm_preaggregate_factor * hzm_channel_buffer_size - hzm_preaggregate_factor);
var hzm_preaggregate_channel_2_buffer = Buffer.alloc(hzm_preaggregate_factor * hzm_channel_buffer_size - hzm_preaggregate_factor);
var hzm_preaggregate_channel_3_buffer = Buffer.alloc(hzm_preaggregate_factor * hzm_channel_buffer_size - hzm_preaggregate_factor);
var hzm_preaggregate_channel_4_buffer = Buffer.alloc(hzm_preaggregate_factor * hzm_channel_buffer_size - hzm_preaggregate_factor);
var hzm_preaggregate_channel_5_buffer = Buffer.alloc(hzm_preaggregate_factor * hzm_channel_buffer_size - hzm_preaggregate_factor);
var hzm_preaggregate_channel_6_buffer = Buffer.alloc(hzm_preaggregate_factor * hzm_channel_buffer_size - hzm_preaggregate_factor);
var hzm_preaggregate_channel_7_buffer = Buffer.alloc(hzm_preaggregate_factor * hzm_channel_buffer_size - hzm_preaggregate_factor);
var hzm_preaggregate_channel_8_buffer = Buffer.alloc(hzm_preaggregate_factor * hzm_channel_buffer_size - hzm_preaggregate_factor);
var db_available = false;

// Create a new mongodb client
const hzm_mongo_client = new MongoClient(hzm_url);

// Connect to the database
async function connect_to_db() {
  try {
    await hzm_mongo_client.connect();
    await hzm_mongo_client.db(hzm_db_name).command({
      ping: 1
    });
    log.info("Connected successfully to database server")
    db_available = true
  } catch (error) {
    log.error("Couldn't connect to MongoDB")
    log.error(error.message)
    await hzm_mongo_client.close()
    db_available = false
  }
}

// On error, log and close server
hzm_udp_server.on('error', (error) => {
  log.info("udp_server", "error", error)
  hzm_udp_server.close()
})

// On new UDP message, print received data
log.start('Messages received: %s', 0)

// On message received, preaggregate and save in database
hzm_udp_server.on('message', (msg, info) => {
  // Log number of messages received
  log.step()

  // Parse UDP message received
  let hzm_channel_1_buffer = msg.slice(hzm_channel_buffer_size * 0, hzm_channel_buffer_size * 1)
  let hzm_channel_2_buffer = msg.slice(hzm_channel_buffer_size * 1, hzm_channel_buffer_size * 2)
  let hzm_channel_3_buffer = msg.slice(hzm_channel_buffer_size * 2, hzm_channel_buffer_size * 3)
  let hzm_channel_4_buffer = msg.slice(hzm_channel_buffer_size * 3, hzm_channel_buffer_size * 4)
  let hzm_channel_5_buffer = msg.slice(hzm_channel_buffer_size * 4, hzm_channel_buffer_size * 5)
  let hzm_channel_6_buffer = msg.slice(hzm_channel_buffer_size * 5, hzm_channel_buffer_size * 6)
  let hzm_channel_7_buffer = msg.slice(hzm_channel_buffer_size * 6, hzm_channel_buffer_size * 7)
  let hzm_channel_8_buffer = msg.slice(hzm_channel_buffer_size * 7, hzm_channel_buffer_size * 8)

  // Preaggregate channel buffers
  hzm_channel_1_buffer.copy(hzm_preaggregate_channel_1_buffer, hzm_preaggregate_counter * hzm_channel_buffer_size, 1)
  hzm_channel_2_buffer.copy(hzm_preaggregate_channel_2_buffer, hzm_preaggregate_counter * hzm_channel_buffer_size, 1)
  hzm_channel_3_buffer.copy(hzm_preaggregate_channel_3_buffer, hzm_preaggregate_counter * hzm_channel_buffer_size, 1)
  hzm_channel_4_buffer.copy(hzm_preaggregate_channel_4_buffer, hzm_preaggregate_counter * hzm_channel_buffer_size, 1)
  hzm_channel_5_buffer.copy(hzm_preaggregate_channel_5_buffer, hzm_preaggregate_counter * hzm_channel_buffer_size, 1)
  hzm_channel_6_buffer.copy(hzm_preaggregate_channel_6_buffer, hzm_preaggregate_counter * hzm_channel_buffer_size, 1)
  hzm_channel_7_buffer.copy(hzm_preaggregate_channel_7_buffer, hzm_preaggregate_counter * hzm_channel_buffer_size, 1)
  hzm_channel_8_buffer.copy(hzm_preaggregate_channel_8_buffer, hzm_preaggregate_counter * hzm_channel_buffer_size, 1)
  hzm_preaggregate_counter++

  // Save in database
  if (hzm_preaggregate_counter >= hzm_preaggregate_factor) {
    // Make document
    let doc = {}
    doc.ts = new Date()
    doc.channel1 = hzm_preaggregate_channel_1_buffer
    doc.channel2 = hzm_preaggregate_channel_2_buffer
    doc.channel3 = hzm_preaggregate_channel_3_buffer
    doc.channel4 = hzm_preaggregate_channel_4_buffer
    doc.channel5 = hzm_preaggregate_channel_5_buffer
    doc.channel6 = hzm_preaggregate_channel_6_buffer
    doc.channel7 = hzm_preaggregate_channel_7_buffer
    doc.channel8 = hzm_preaggregate_channel_8_buffer
    log.info(doc)

    // Insert document into DB
    if (db_available == true) {
      try {
        hzm_mongo_client.db(hzm_db_name).collection("device1").insertOne(doc, function (err, res) {
          if (err) throw err
          log.info("Document inserted")
        });
      } catch (e) {
        log.error(e)
      }
    }
    hzm_preaggregate_counter = 0
  }

  // Broadcast to socket clients
  io.sockets.emit("data", msg)
})

// On server ready, print info
hzm_udp_server.on('listening', () => {
  const address = hzm_udp_server.address()
  log.info('UDP Server is listening at port ' + address.port)
  log.info('UDP Server ' + address.family + ' address: ' + ip.address())
})

// On server close, log info
hzm_udp_server.on('close', () => {
  log.stop();
  log.info("udp_server", "info", 'Socket closed')
})

// Listen for datagram messages on a defined port
hzm_udp_server.bind(hzm_conf.udp_port)
