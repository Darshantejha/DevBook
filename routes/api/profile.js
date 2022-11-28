const router = require("express").Router();
const Profile = require("../../models/Profile");
const auth = require("../../middleware/auth");
const {check,validationResult} = require("express-validator");

router.get("/me",auth,async(req,res)=>{
    try{
        const userid = req.user.id;
        const profile = await Profile.findOne({user:userid}).populate("user",["name","gravatar"]);
        if(!profile)return res.status(404).json({msg:"No Profile found"});
        return res.send(profile);
    }catch(err){
        console.log(err.message);
        res.status(400).json({msg:"Server Error"});
    }
});

// update or create profile
router.post("/",[auth,[
    check("status","Status id Required").not().isEmpty(),
    check("skills","Skills is Required").not().isEmpty()
]],async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty())return res.json({errors:errors.array()});
    const userid = req.user.id;
    const {
        company,
        location,
        bio,
        status,
        githubusername,
        website,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook,
    } = req.body;
    const profileFields = {};
    profileFields.user = userid;
    if(company)profileFields.company = company;
    if(website)profileFields.website = website;
    if(company)profileFields.location = location;
    if(company)profileFields.bio= bio;
    if(company)profileFields.status = status;
    if(company)profileFields.githubusername = githubusername;
    if(skills){
        profileFields.skills = skills.split(",").map(skill=>skill.trim());
    }
    profileFields.social={};
    if(youtube)profileFields.social.youtube = youtube;
    if(twitter)profileFields.social.twitter = twitter;
    if(facebook)profileFields.social.facebook = facebook;
    if(instagram)profileFields.social.instagram = instagram;
    if(linkedin)profileFields.social.linkedin = linkedin;
    
    try {
        let profile = await Profile.findOne({user:userid});
        if(profile){
            profile = await Profile.findOneAndUpdate(
                {user:userid},
                {$set:profileFields},
                {new:true} 
            );
            return res.send(profile);
        }
        profile = new Profile(profileFields);
        await Profile.save();
        return res.send(profile);
        
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({msg:"Server Error"});
    }
});

//get all profiles

router.get("/",async(req,res)=>{
    try {
        const profiles = await Profile.find().populate("user",["name","avatar"]);
        return res.send(profiles);
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({msg:"Server Error"});
    }
});

// get by id

router.get("/user/:user_id",async(req,res)=>{
    try {
        const profile = await Profile.findOne({user:req.params.user_id}).populate("user",["name","avatar"]);
        if(profile){
            return res.send(profile);
        }
        return res.status(404).json({msg:"Profile not found"});
    } catch (error) {
        console.error(err.message);
        if(err.kind=="ObjectId"){
            return res.status(404).json({msg:'Profile not found'});
        }
        return res.status(500).json({msg:"Server Error"});
    }
});



module.exports = router;