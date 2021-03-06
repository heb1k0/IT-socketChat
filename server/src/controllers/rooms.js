const Room = require('../models/rooms');
const bcrypt = require('bcrypt');

exports.createRoom = async (req) =>{

    try{

        let result = await new Room({
            name: req.name,
            users: req.users
        });
        await result.save()
        return result;

    }catch(err){    
        return err.message;
    }

}
exports.listRooms = async () =>{

    
       try{
            return await Room.find();
        }catch(err){    
            return err.message;
        }
    
}