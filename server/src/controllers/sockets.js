const { createRoom, listRooms } = require("./rooms");

const RoomsChat = [];

const UsersOnline = [];

const makeRandomID = (
    length,
    dict = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
) =>
    Array.from({ length }, (_) => dict[~~(Math.random() * dict.length)]).join("");

module.exports.respond = function (socket) {

    let UserInterface;

    socket.on("user:connect", (user) => {
        // Comprobar si exist el user en el array de users
        if (!UsersOnline.find((userOnline) => userOnline.idUser === user.idUser)) {
            user.room = {id:0, name:"General"};
            user.id = socket.id;
            UsersOnline.push(user);
        }
        UserInterface = user;
        socket.emit("user:connectRES", UsersOnline);
        socket.broadcast.emit("user:connectRES", UsersOnline);
    });

    socket.on("rooms", async (e) => {
        try {
            socket.emit("roomsRES", RoomsChat);
            console.log("send", RoomsChat);
        } catch (e) {
            console.log(e.message);
        }
    });

    

    socket.on("send_message", (e) => {
        if(!e.room){
            console.log("Se envia al general",e)
            socket.broadcast.emit("receive_message", {mensaje: e.mensaje, user: UserInterface});
        }else{
            //enviar socket room
            console.log("Se envia a la room", e)
            socket.broadcast.to(e.room.room).emit("receive_message", {mensaje: e.mensaje, user: UserInterface});
        }
    });

    socket.on("room:join", (e) => {
        //Buscar usaurio en UsersOnline y actualizar la room

        var user = UsersOnline.find((userOnline) => userOnline.id === socket.id);

        if(user) user.room = {id:e.room, name:e.name};

        console.log(`${UserInterface.User} se ha unido a la sala ${e.name}`);
        socket.join(e.room)
        socket.emit("room:joinRES", user);
        socket.broadcast.emit("room:joinRES", user);

        socket.emit("user:connectRES", UsersOnline);
        socket.broadcast.emit("user:connectRES", UsersOnline);

    })


    socket.on("newRoom", async (e) => {
        let Room = {
            name: e.sala,
            users: [],
            _id: makeRandomID(10),
        };
        try {
            RoomsChat.push(Room);
            socket.emit("newRoomRES", Room);
            socket.broadcast.emit("newRoomRES", Room);
            console.log(Room);
        } catch (e) {
            console.log(e.message);
        }
    });

    socket.on("disconnect", () => {
        console.log("disconnect", socket.id);
        UsersOnline.forEach((user, index) => {
            if (user.id === socket.id) {
                UsersOnline.splice(index, 1);
            }
        });
        socket.broadcast.emit("user:disconnect", UsersOnline);
    });

    socket.on("forceDisconnect", function () {
        socket.disconnect((e) => {
            console.log("Desconectado ->", e);
        });
    });

    return socket;
};
