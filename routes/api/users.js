const router = require("express").Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../../models/Users");
const {check,validationResult} = require("express-validator");

// signup
router.post("/",[
    check("name","Name is required").not().isEmpty(),
    check("email","Enter a Valid Email").isEmail(),
    check("password","Please enter a password of 6 or more characters").isLength({min:6})
], async (req,res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    try {
        const {name,email,password} = req.body;

        //check if user already exists
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({errors:[{msg:"User already exists"}]});
        }
        // getting user's gravatar
        const avatar = gravatar.url(email,{
            s:"200", // size of the image
            r:"pg",  // rated 
            d:"mm"   // default icon we can also write 404 in the place of mm
        });
        user = new User({
            name,
            email,
            password,
            avatar
        });
        // encrypting the users password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password,salt);
        // saving user into the database
        await user.save();
        //send back jwt token with payload in it
        const payload = {
            user:{
                id:user.id
            }
        };
        jwt.sign(payload,config.get("jwtSecret"),{expiresIn:3600},(err,token)=>{
            if(err)throw err;
            return res.json({token});
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({errors:[{msg:"Server error"}]});
    }
    
});


module.exports = router;