const jwt = require("jsonwebtoken");
const config = require("config");
const auth =  (req,res,next) => {
    // getting token from the header
    const token = req.header("x-auth-token");
    if(!token){
        return res.status(401).json({msg:"No token,authorization denied"});
    }
    // checking whether it is a valid token or not
    try {
       const decoded =  jwt.verify(token,config.get("jwtSecret")); // returns payload
       req.user = decoded.user;
       next();
    } catch (error) {
        console.error(error.message);
        return res.status(401).json({msg:"Invalid token"});
    }
}

module.exports = auth;