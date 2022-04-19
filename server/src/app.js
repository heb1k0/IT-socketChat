const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { connectMongo } = require('./config');
const cors = require('cors');
require('dotenv').config()


// Controllers //

;
const { Register, Login, CheckToken, RegisterGoogle } = require('./controllers/users')
var controller = require('./controllers/sockets');

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

io.on('connection', controller.respond);
app.post('/register', (req, res) => Register(req.body, res));
app.post('/login', (req, res) => Login(req.body, res));
app.post('/checkToken', (req, res) => CheckToken(req.body, res));
app.post('/registergoogle', (req, res) => RegisterGoogle(req.body, res))


server.listen(process.env.PORT, async () => {
  try {
    await connectMongo();
    console.log("Server Running");
  } catch (e) {
    console.log(e);
  }
});

