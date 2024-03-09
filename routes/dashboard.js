const router =require('express').Router();
const {uploadUserImages, uploadPetImages}= require('../config/multer');
const Pet = require('../models/pet')
const User = require('../models/user')
var geohash = require('ngeohash');

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


router.post('/lostfound', loggedIn, uploadPetImages, async (req, res) => {
    console.log("Lostfound page activated");
    
    const { type, pet, petname, gender, colour, breed, age,address, latitude, longitude,size,date,reward,description,petImg } = req.body;
    // console.log(req.body);
    
    // Assuming 'petImages' is an array of image paths from your client-side FormData
    // const petImages = req.body.petImg; 
    const petImages =req.files
    // console.log(typeof petImages);
    // console.log("this is pey",petImages);
    const geohashValue = geohash.encode(latitude, longitude);
    console.log('Encoded Geohash:', geohashValue);
    const location = {
        type: 'Point',
        coordinates: [longitude, latitude] // Note: MongoDB uses [longitude, latitude]
      };

    try {
        // Create a new pet instance with the form data and uploaded image paths
        const newPet = await Pet.create({
            type,
            pet,
            petname,
            gender,
            colour,
            breed,
            age,
            location,
            address,
            size,date,reward,description,
            geohash: geohashValue,
            userId:req.user.id,
            images: petImages.map(image => ({ path: image.path })),
        });

        if (newPet) {
            console.log("Pet saved successfully");
            var data = {
                'title': 'success',
            };
            res.json(data);
        } else {
            console.log("Pet was not saved");
            var data = {
                'title': 'failed',
            };
            res.json(data);
        }
    } catch (error) {
        console.error(error);
        var data = {
            'title': 'failed',
        };
        res.json(data);
    }
});

router.get('/profile',loggedIn, async (req, res) => {
    const petpost= await Pet.find({userId: req.user.id}).sort({ createdAt: -1 })
    // console.log(petpost)
    res.render('dashboard/profile.ejs',{user:req.user, petpost:petpost});
});


router.get('/lostfound/:id/delete', loggedIn, async (req, res) => {
    try {
        console.log(req.params.id);
        const result = await Pet.findByIdAndDelete(req.params.id);
        if (!result) {
            console.log("Post not found");
            return res.status(404).send("Post not found");
        }
        console.log("Post has been deleted");
        res.redirect("back");
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).send("Error deleting post");
    }
});

router.get('/lostfound/update/:id/',loggedIn,async(req, res)=>{
    const Upost = await Pet.find({_id: req.params.id})
    Upost[0].images.forEach(function(image) {
        image.path = image.path.replace(/\\/g, '/');
    });
    // console.log(Upost)
    res.render('dashboard/update-lostfound.ejs',{user:req.user, Upost:Upost})

})

module.exports=router;