const Room = require('../models/rooms');
const bcrypt = require('bcrypt');

exports.createRoom = async (req) =>{

    try{

        let result = await new Room({
            name: req.sala
        });
        await result.save()
        return result;

    }catch(err){    
        console.log(err.message);
        return err.message;
    }

}
exports.listRooms = async () =>{

    console.log("goo")
    
       try{
            return await Room.find();
    
        }catch(err){    
            console.log(err.message);
            return err.message;
        }
    
}