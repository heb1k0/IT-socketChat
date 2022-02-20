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
        await result.save()
        console.log(result)
        res.status(200).json(result);

    } catch (err) {
        res.status(500).json({ msj: err.message });
    }
}

exports.RegisterGoogle = async (req, res) => {

    // req profileObj: {
    //     googleId: '111374163267793641055',
    //     imageUrl: 'https://lh3.googleusercontent.com/a-/AOh14Gi-tP_jG_h9A5-tMtqGBlx8kVBocxbMk9n6R_tRBQ=s96-c',
    //     email: 'alejandrozuriguel@gmail.com',
    //     name: 'Alejandro Zuriguel',
    //     givenName: 'Alejandro',
    //     familyName: 'Zuriguel'


    try {
        const user = await User.findOne({ email: req.profileObj.email });

        if (!user) {
            console.log("entro aqui")
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(req.profileObj.email, salt);

            let result = await new User({
                email: req.profileObj.email,
                password: password
            });
            await result.save()
            console.log(result)
            res.status(200).json(result);

        } else {

            const token = jwt.sign({
                name: user.username,
                id: user._id
            }, "secretKey123")

            user.token = token;
            user.save();
            res.status(200).json(user);
        }

    } catch (err) {
        console.log(err.message)
        res.status(500).json({ msj: err.message });
    }
}

exports.Login = async (req, res) => {

    try {

        const user = await User.findOne({ username: req.username });
        if (!user) {
            res.status(404).json({ msj: "Usuario no encontrado" });
        } else {
            const validPass = await bcrypt.compare(req.password, user.password);
            if (!validPass) {
                res.status(401).json({ msj: "Contraseña incorrecta" });
            } else {

                const token = jwt.sign({
                    name: user.username,
                    id: user._id
                }, "secretKey123")

                user.token = token;
                await user.save();

                res.status(200).json({ username: user.username, token: token });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ msj: err.message });
    }
}

exports.CheckToken = async (req, res) => {

    try {


        if(req.token){
            console.log(req.token,"<- token")
        }else{
            console.log("no hay token")
        }
        

        const verified = jwt.verify(req.token, "secretKey123")

        const user = await User.findOne({ token: req.token, _id: verified.id });

        if (user.token == req.token && user._id == verified.id) {
            res.status(200).json(user);
        } else {
            res.status(401).json({ msj: "Token Invalid" });
        }

    } catch (err) {
        console.log(err.message," ERROR ");
        res.status(500).json({ err: err.message });
    }
}
