const express= require("express");
const connectDB = require("./config/db");
const users = require("./routes/api/users");
const auth = require("./routes/api/auth");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");
const app = express();



app.use(express.json());

// mongoDB connection
connectDB();



//routes

app.use("/api/users",users);
app.use("/api/auth",auth);
app.use("/api/profile",profile);
app.use("/api/posts",posts);






const PORT = process.env.PORT||5000;



app.get("/",(req,res)=>{
    res.send("hello brother");
})




app.listen(PORT,()=>{
    console.log(`Server running on PORT ${PORT}`);
})