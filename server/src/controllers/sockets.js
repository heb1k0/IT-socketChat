const { createRoom, listRooms } = require("./rooms");
const { listChats, createChat } = require("./chats");
const { Register, RegisterGoogle, Login, CheckToken } = require("./users")

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

    socket.on("rooms", async (e) => {
        try {
            socket.emit("roomsRES", RoomsChat);

        } catch (e) {
            console.log(e.message);
        }
    });



    socket.on("send_message", async (e) => {

        let idRoom;
        console.log("mensaje",e)
        idRoom = e.room.room;
        socket.broadcast.to(e.room.room).emit("receive_message", { mensaje: e.mensaje, user: UserInterface });

        createChat({ username: UserInterface.username, idUser: UserInterface.idMongo, idRoom, mensaje: e.mensaje })
    });

    socket.on("room:join", (e) => {
        //Buscar usaurio en UsersOnline y actualizar la room
        var user = UsersOnline.find((userOnline) => userOnline.idSocket === socket.id);

        console.log("JOIN ROOM llega", e)

        if (user) {


            if (e.exit) {

                socket.leave(user.room.room)
                if (user) user.room = { room: "General", name: "General"};
                socket.join("General");
            } else {
                if (user) user.room = { room: e.room, name: e.name };
                socket.leave("General");
                socket.join(e.room)

            }

            

        }

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

        socket.broadcast.emit("user:disconnect", UsersOnline);
    });

    socket.on("forceDisconnect", function () {
        socket.disconnect((e) => {
            console.log("Desconectado ->", e);
        });
    });

    socket.on("chat:changeRoom", async (data) => {
        let chats = await listChats(data.userRoom.room)
        socket.emit("chat:changeRoom", { chats })
    })

    socket.on("user:logout", (e) => {
        //borrar objeto de UsersOnline
        let user = UsersOnline.find((userOnline) => userOnline.idSocket === socket.id);
        if (user) {
            let index = UsersOnline.indexOf(user);
            UsersOnline.splice(index, 1);
            console.log("Acaba", UsersOnline)
        }
        socket.broadcast.emit("user:LogoutRES", UsersOnline);

    })

    socket.on("user:loginGoogle", async (req) => {

        try {
            let user = await RegisterGoogle(req);
            socket.emit("user:loginGoogleRES", { user })
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
                socket.join("General");
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
        let room = { room: "General", name: "General" };
        UserInterface = { idSocket: socket.id, room, ...copy };
        if (UsersOnline.push(UserInterface)) console.log("Push user IF", UserInterface)
        socket.emit("user:connectRES", UsersOnline);
        socket.join("General");
        socket.broadcast.emit("user:connectRES", UsersOnline);

    }

    return socket;
};
