const
    io = require("socket.io-client"),
    ioClient = io.connect("http://localhost:33300");

ioClient.on("data", (msg) => console.info(msg));
