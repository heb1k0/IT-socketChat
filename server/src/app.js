const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { connectMongo } = require('./config');
const cors = require('cors');

// Controllers //

;
const { Register, Login, CheckToken, RegisterGoogle } = require('./controllers/users')
var controller = require('./controllers/sockets');

const io = new Server(server, {
  cors: {
    origin: 'http://127.0.0.1:3000',
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


server.listen(3002, async () => {
  try {
    await connectMongo();
    console.log("Server Running");
  } catch (e) {
    console.log(e);
  }
});

