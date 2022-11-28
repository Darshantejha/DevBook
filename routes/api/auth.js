const router = require("express").Router();
const User = require("../../models/Users");
const bycrypt = require("bcryptjs");
const config = require("config");
const {check,validationResult} = require("express-validator");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");

router.get("/",auth, async(req,res)=>{
    const user = await User.findById(req.user.id).select("-password");
    return res.json(user);
});
// login
router.post("/",[
    check("email","Please enter a valid email").isEmail(),
    check("password","Password required").not().isEmpty()
],async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const {email,password} = req.body;
    try {
        // check if user exists or not
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({msg:"Invalid Credentials"});
        }
        // checking passwords match or not
        const isMatch = await bycrypt.compare(password,user.password);
        if(!isMatch) return res.status(400).json({msg:"Invalid Credentials"});
        const payload = {
            user:{
                id:user.id
            }
        }
        // sending jwt token
        jwt.sign(payload,config.get("jwtSecret"),{expiresIn:3600},(err,token)=>{
            if(err)throw err;
            return res.json({token});
        });
    }catch (err) {
        console.error(err.message);
        return res.status(500).json({msg:"Server error"});
    }
});

module.exports = router;