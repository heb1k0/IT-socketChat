const { createRoom, listRooms } = require("./rooms");
const { listChats, createChat } = require("./chats");
const { Register, RegisterGoogle, Login, CheckToken } = require("./users")

const Chat = require('../models/chats');
const jwt = require('jsonwebtoken');
const User = require("../models/users");
var RoomsChat = [];
var UsersOnline = [];


module.exports.respond = function (socket) {

    let UserInterface;

    socket.on("chat:refresh", async () => {


        try {
            let chats = await listChats();
            let room = await listRooms();
            socket.emit("chat:list", { chats, room });

        } catch (e) {
            console.log(e.message)
        }
    });


    // socket.on("user:connect", (user) => {
    //     let id;
    //     // console.log("Nuevo user", user)
    //     if (!user.isGoogle) {
    //         id = user.idMongo;
    //     } else {
    //         var verified = jwt.verify(user.tokenUser, "secretKey123")
    //         id = verified.id
    //     }

    //     console.log("UsersOnline", UsersOnline)

    //     // Comprobar si exist el user en el array de users
    //     if (!UsersOnline.find((userOnline) => userOnline.idUser === user.idUser)) {
    //         console.log("No existeee")
    //         user.room = { id: 0, name: "General" };
    //         user.id = socket.id;
    //         UsersOnline.push(user);
    //     }else{
    //        console.log("existeeee")
    //     }
    //     UserInterface = user;
    //     UserInterface.idMongo = id;
    //     socket.emit("user:connectRES", UsersOnline);
    // });

    socket.on("rooms", async (e) => {
        try {
            socket.emit("roomsRES", RoomsChat);

        } catch (e) {
            console.log(e.message);
        }
    });



    socket.on("send_message", async (e) => {

        let idRoom;
        if (!e.room || e.room.room === "general") {
            idRoom = "general";
            socket.broadcast.emit("receive_message", { mensaje: e.mensaje, user: UserInterface });
        } else {
            //enviar socket room
            idRoom = e.room.room;
            socket.broadcast.to(e.room.room).emit("receive_message", { mensaje: e.mensaje, user: UserInterface });
        }

        createChat({ username: UserInterface.username, idUser: UserInterface.idMongo, idRoom, mensaje: e.mensaje })
    });

    socket.on("room:join", (e) => {
        //Buscar usaurio en UsersOnline y actualizar la room
        var user = UsersOnline.find((userOnline) => userOnline.idSocket === socket.id);

        if (user) {

            if (e.exit) {
                socket.leave(user.room.room)
                if (user) user.room = { room: e.room, name: e.name };
            } else {
                if (user) user.room = { room: e.room, name: e.name };
                user.room ? socket.join(user.room.room) : console.log("No hay room")
                console.log(UserInterface)
            }

        }
        e.exit ? socket.levave : socket.join(e.room)
        socket.emit("room:joinRES", user);
        socket.broadcast.emit("room:joinRES", user);
        socket.emit("user:connectRES", UsersOnline);

    })


    socket.on("newRoom", async (e) => {
        let Room = {
            name: e.sala,
            users: [],
        };
        try {
            let newRoom = await createRoom(Room);
            RoomsChat.push(newRoom);
            socket.emit("newRoomRES", newRoom);
            socket.broadcast.emit("newRoomRES", newRoom);
            // console.log(Room);
        } catch (e) {
            console.log(e.message);
        }
    });

    socket.on("disconnect", () => {

        if (UsersOnline.length == 0) return UsersOnline = []
        UsersOnline.forEach((user, index) => {
            if (user.idSocket === socket.id) {
                UsersOnline.splice(index, 1);
            }

        });

        console.log(UsersOnline)
        socket.broadcast.emit("user:disconnect", UsersOnline);
    });

    socket.on("forceDisconnect", function () {
        socket.disconnect((e) => {
            console.log("Desconectado ->", e);
        });
    });

    socket.on("chat:changeRoom", async (data) => {
        console.log("datas",data.userRoom.room);
        let chats = await listChats(data.userRoom.room)
        if(chats){
            console.log("chats", chats);
        }else{
            console.log("chats", "no hay chats");
        }

        socket.emit("chat:changeRoom", { chats })
    })

    socket.on("user:logout", (e) => {
        //borrar objeto de UsersOnline
        let user = UsersOnline.find((userOnline) => userOnline.idSocket === socket.id);
        // console.log("Array users", UsersOnline)
        if (user) {
            let index = UsersOnline.indexOf(user);
            UsersOnline.splice(index, 1);
            console.log("Acaba", UsersOnline)
        }
        // console.log("emitimos", UsersOnline)
        socket.broadcast.emit("user:LogoutRES", UsersOnline);
        // console.log("emit")

    })

    socket.on("user:loginGoogle", async (req) => {

        try {
            let user = await RegisterGoogle(req);
            socket.emit("user:loginGoogleRES", { user })
            console.log("UserGoogle", user)
            if (UsersOnline.find(userOnline => userOnline.email === user.email)) {
                //Lo borramos
                let index = UsersOnline.indexOf(user);
                UsersOnline.splice(index, 1);

            }
            newOnlineUser(user);
        } catch (err) {
            console.log(err.message)
        }
    })


    socket.on("user:register", async (req) => {
        try {

            let User = await Register(req);
            socket.emit("user:RegisterRES", User)
            newOnlineUser(User);

        } catch (err) {
            console.log(err.message)
        }

    });

    socket.on("user:Login", async (req) => {
        try {

            let User = await Login(req);
            if (User.msj) {
                return socket.emit("user:LoginRES", { error: true })
            } else {
                socket.emit("user:LoginRES", User)
                newOnlineUser(User);
            }


        } catch (err) {
            console.log(err.message)
            socket.emit("user:LoginRES", { error: true, cath: true })
        }
    })

    socket.on("user:checkToken", async (req) => {
        try {
            let user = await CheckToken(req.token);
            if (req.isGoogle) user.isGoogle = true
            socket.emit("user:checkTokenRES", user)
            newOnlineUser(user);
        } catch (err) {
            console.log(err.message)
        }
    })

    var newOnlineUser = (user) => {

        let copy = user._doc ? user._doc : user;
        let room = { room: "general", name: "General" };
        UserInterface = { idSocket: socket.id, room, ...copy };
        if (UsersOnline.push(UserInterface)) console.log("Push user IF", UserInterface)
        socket.emit("user:connectRES", UsersOnline);
        socket.broadcast.emit("user:connectRES", UsersOnline);

    }

    return socket;
};
