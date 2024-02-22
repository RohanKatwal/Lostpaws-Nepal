const router =require('express').Router();
const {uploadUserImages, uploadPetImages}= require('../config/multer');
const Pet = require('../models/pet')
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

// router.post('/lostfound',loggedIn,uploadPetImages, async (req, res)=>{
//     console.log("lost page")
//     const {type,pet,petname,gender,colour,breed,age,latitude,longitude,size,date,reward,description} = req.body
//     console.log(req.body.type)
//     console.log(req.body)

//     const petImages = req.files.petImg;
//     console.log("0000000000000",petImages)

//     // Assuming you want to log file information
//     if (petImages) {
//         petImages.forEach((image) => {
//             console.log("File Information:");
//             console.log("Fieldname:", image.fieldname);
//             console.log("Originalname:", image.originalname);
//             console.log("Encoding:", image.encoding);
//             console.log("Mimetype:", image.mimetype);
//             console.log("Size:", image.size);
//             console.log("Path:", image.path);
//             console.log("-----------------------");
//         });
//     }
// })

router.post('/lostfound', loggedIn, uploadPetImages, async (req, res) => {
    console.log("Lostfound page activated");
    
    const { type, pet, petname, gender, colour, breed, age,address, latitude, longitude,size,date,reward,description } = req.body;
    // console.log(req.body);
    
    // Assuming 'petImages' is an array of image paths from your client-side FormData
    const petImages = req.files; 
    console.log(petImages);
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

module.exports=router;