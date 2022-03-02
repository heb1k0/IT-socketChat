const Chat = require('../models/chats');

exports.listChats = async (id) =>{

    
       try{
            if(!id )return await Chat.find({idRoom:"general"});

            return await Chat.find({idRoom: id});

    
        }catch(err){    
            console.log(err.message);
            return err.message;
        }
    
}

exports.createChat = async (chat) =>{
    try{
        const newChat = new Chat(chat);
        await newChat.save();
        return newChat;
    }catch(err){
        console.log(err.message);
        return err.message;
    }
}