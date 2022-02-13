const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { connectMongo } = require('./config');
const cors = require('cors');

// Controllers //

const { Register, Login,CheckToken  }= require('./controllers/users');

const io = new Server(server,{
  cors:{
    origin: 'http://139.59.149.58:3000',
    methods:["GET","POST"]
  }
});


app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {

  console.log(socket.id)

  socket.on("send_message", (e) =>{
    socket.broadcast.emit("receive_message",e)
  })

  socket.on("disconnect", () =>{
    console.log("disconnect",socket.id)
  })

  socket.on('forceDisconnect', function(){
    socket.disconnect((e)=>{
      console.log("Desconectado ->",e)
    });
  });

});

app.post('/register', (req, res) => Register(req.body,res));
app.post('/login', (req, res) => Login(req.body,res));
app.post('/checkToken', (req, res) => CheckToken(req.body,res));



server.listen(3002, async() => {
  try{
    await connectMongo();
    console.log("Server Running");
  }catch(e){
    console.log(e);
  }
});

