const router =require('express').Router();
const {uploadUserImages, uploadPetImages}= require('../config/multer');

function loggedIn(req,res,next){
    if(req.user){
        return next()
    }else{
        res.redirect('/login')
        console.log("to the login page")
    }
}

router.get('/home',loggedIn, async (req, res) => {
    res.render('dashboard/home.ejs',{user:req.user});
});

router.get('/lostfound',loggedIn, async (req, res) => {
    res.render('dashboard/lostfound.ejs',{user:req.user});
});

router.post('/lostfound',loggedIn,uploadPetImages, async (req, res)=>{
    console.log("lost page")
    const {type,pet,petname,gender,colour,breed,age,latitude,longitude} = req.body
    console.log(req.body.type)
    console.log(req.body)

    const petImages = req.files.petImg;
    console.log("0000000000000",petImages)

    // Assuming you want to log file information
    if (petImages) {
        petImages.forEach((image) => {
            console.log("File Information:");
            console.log("Fieldname:", image.fieldname);
            console.log("Originalname:", image.originalname);
            console.log("Encoding:", image.encoding);
            console.log("Mimetype:", image.mimetype);
            console.log("Size:", image.size);
            console.log("Path:", image.path);
            console.log("-----------------------");
        });
    }
})

module.exports=router;