const router =require('express').Router();
const {uploaduserImages, uploadPetImages}= require('../config/multer');
const Pet = require('../models/pet')
const User = require('../models/user')
var geohash = require('ngeohash');
const bcrypt = require('bcrypt');

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

router.get('/settings',loggedIn, async (req, res) => {
    //console.log(req.user.id)
    res.render('dashboard/settings.ejs',{user:req.user});
});

//Update account
router.post('/user/settings/account', loggedIn, uploaduserImages, async (req, res) => {
    try {
        const { name, phoneNumber, email, address, description } = req.body;
        console.log(req.body); // Check the received data in the console

        const profileImg =
        req.files && req.files.profile ? req.files.profile[0].path : null;
        // Assuming you have access to userId from the loggedIn middleware
        const userId = req.user.id;

        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user settings
        existingUser.name = name;
        existingUser.phoneNumber = phoneNumber;
        existingUser.email = email;
        existingUser.address = address;
        existingUser.description = description; // Assuming 'description' field exists in the User model


        if (profileImg) {
            existingUser.profileImage ="/"+profileImg ;
        }
        // Save the updated user settings
        await existingUser.save();

        var data = {
            title: 'success',
            message: 'User account updated successfully!',
        };
        return res.json(data);
    } catch (error) {
        console.error(error);
        var data = {
            title: 'error',
        };
        return res.json(data);
    }
});

router.post('/user/settings/security', loggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const match = await bcrypt.compare(req.body.oldpassword, user.password);

        if (match) {
            console.log(req.body);
            const hash = await bcrypt.hash(req.body.newpassword, 10);

            await User.findByIdAndUpdate(
                req.user.id,
                { password: hash }
            );

            console.log('Updated password successfully');
            var data = {
                title: 'success',
                message: 'User account updated successfully!',
            };
            return res.json(data);
            // return res.json('changesuccess');
        } else {
            var data = {
                title: 'Wrgpass',
                message: 'User account updated successfully!',
            };
            return res.json(data);
            // return res.json('Wrgpass');
        }
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
})

router.post('/user/settings/socialMedia', loggedIn, async (req, res) => {
    try {
        const { facebook, instagram, youtube, linkedin, twitter } = req.body;

        const userId = req.user.id;

        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user Social Media
        existingUser.facebook = facebook;
        existingUser.instagram = instagram;
        existingUser.youtube = youtube;
        existingUser.linkedin = linkedin;
        existingUser.twitter = twitter;

        // Save the updated user social media
        await existingUser.save();

        const data = {
            title: 'success',
            message: 'Social Media updated successfully!',
        };
        return res.json(data);
    } catch (error) {
        console.error(error);
        const data = {
            title: 'error',
        };
        return res.status(500).json(data);
    }
});


module.exports=router;