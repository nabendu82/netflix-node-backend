const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async(req, res) => {
    const userData = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString(),
    })

    try {
        const user = await userData.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json(err);
    }
})

//LOGIN
router.post("/login", async(req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        !user && res.status(401).json("Wrong password or username");

        const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
        const origPassword = bytes.toString(CryptoJS.enc.Utf8);

        origPassword !== req.body.password && res.status(401).json("Wrong password or username");

        const accessToken = jwt.sign(
            {id: user._id, isAdmin: user.isAdmin},
            process.env.SECRET_KEY,
            {expiresIn: "5d"}
        )

        const { password, ...other } = user._doc;
        res.status(200).json({...other, accessToken});
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;