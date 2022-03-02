const User = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.Register = async (req, res) => {

    try {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.password, salt);

        let result = await new User({
            username: req.username,
            email: req.email,
            password: password
        });
        const token = jwt.sign({
            name:result.username,
            id:result._id
        }, "secretKey123")

        result.token = token;
        await result.save();
        return result;

    } catch (err) {
        return { error:true };
    }
}

exports.RegisterGoogle = async (req) => {

    try {
        const user = await User.findOne({ email: req.email});

        if (!user) {
        
            console.log("entro aqui", req)
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(req.email, salt);

            let result = await new User({
                username: req.username,
                email: req.email,
                password: password
            });
            await result.save()
            console.log(result)
            return result;

        } else {

            const token = jwt.sign({
                name: user.username,
                id: user._id
            }, "secretKey123")

            console.log(token)

            user.token = token;
            user.save();
            return user;
        }

    } catch (err) {
        console.log("error",err.message)
        return { msj: err.message };
    }
}

exports.Login = async (req, res) => {

    try {
        const user = await User.findOne({ username: req.username });
        if (!user) {
            return { msj: "Usuario no encontrado" };
        } else {
            const validPass = await bcrypt.compare(req.password, user.password);
            if (!validPass) {
                return { msj: "Contraseña incorrecta" };
            } else {

                const token = jwt.sign({
                    name: user.username,
                    id: user._id
                }, "secretKey123")

                user.token = token;
                await user.save();

                console.log(token)

                return { username: user.username, token: token };
            }
        }
    } catch (err) {
        return { msj: err.message };
    }
}

exports.CheckToken = async (req, res) => {

    try {
        console.log(req)

        if(req){
            console.log(req,"<- token")
        }else{
            console.log("no hay token")
        }
        

        const verified = jwt.verify(req, "secretKey123")

        console.log(verified,"<- verified")

        const user = await User.findOne({ token:req , _id: verified.id });
        console.log(user,"<- user")

        if (user.token == req && user._id == verified.id) {
            return user
        } else {
            return {errj: "Token Invalid" };
        }

    } catch (err) {
        console.log(err.message," ERROR ");
        return { err: err.message };
    }
}
