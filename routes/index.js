const router =require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user')
const passport = require('passport');
const { authenticateLocal} = require('../passport-config');
const nodemailer = require('nodemailer');

//middleware for checking the user
function isguest(req, res, next){
    if(req.user){
        res.redirect('/dashboard/home');
    }else{
        next()
    }
}

function generateVerificationCode() {
    return Math.floor(Math.random() * 10000).toString();
}

const mailer = {
    pass:process.env.MAILPASS,
    mail: process.env.MAILID,
    URL:process.env.URL
};

// Function to send verification email
async function sendVerificationEmail(email, verificationCode) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'LOGIN',
                user: mailer.mail,
                pass: mailer.pass,
            },
        });

        const mailOptions = {
            from: mailer.mail,
            to: email,
            subject: 'Verification Code',
            text: `Your verification code is: ${verificationCode}`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error; // You can choose to handle or propagate the error as needed
    }
}


router.get('/', (req, res)=>{
    if( req.isAuthenticated()){
        return res.render('home/index.ejs', {auth: true, user: req.user})
    }
    res.render('home/index.ejs', {auth: false})
})

router.get('/login',isguest, (req,res)=>{
    res.render('home/login.ejs',{ auth: false})
})


router.post('/login', isguest, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        // If there is no info or the message is 'no info', return a 'no user' error message.
        if (info != undefined && info.message == 'no info') {
            var data = {
                'title': 'no user',
            };
            console.log("There is no user with the given email address");
            return res.json(data);
        }
        // If user credentials are correct, log in the user.
        if (user) {
            // Check if email verification is true
            if (user.emailVerify) {
                req.logIn(user, (err, info) => {
                    var data = {
                        'title': 'success login',
                        'user': user
                    };
                    res.json(data);
                });
            } else {
                // User email is not verified
                var data = {
                    'title': 'unregistered',
                    'message': 'Email not verified'
                };
                console.log("User email is not verified");
                res.json(data);
            }
        } else {
            // If user credentials are incorrect or invalid, return an error message.
            var data = {
                'title': 'error',
            };
            console.log("Incorrect password");
            res.json(data);
        }
    })(req, res, next);
});

// Route for initiating Google OAuth authentication
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to dashboard or home page
    res.redirect('/dashboard/home');
  },
  (err, req, res, next) => {
    // Log any errors that occurred during authentication
    console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
    console.error(err);
    // Handle the error or redirect to an error page
    res.redirect('/error');
  }
);



router.get('/register', isguest,(req,res)=>{
    res.render('home/register.ejs',{auth: false})
})


router.post('/register', async (req, res) => {
    let email = req.body.email || 'default value';

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // If user exists and email is verified, return UserExist
            if (existingUser.emailVerify) {
                return res.json({ title: 'UserExist' });
            }

            // Update existing user with email not verified
            const hash = await bcrypt.hash(req.body.password, 10);
            const verificationCode = generateVerificationCode();

            existingUser.name = req.body.name;
            existingUser.registerNo = req.body.registerNo;
            existingUser.phoneNumber = req.body.phoneNumber;
            existingUser.country = req.body.country;
            existingUser.password = hash;
            existingUser.verificationCode = verificationCode;

            await existingUser.save();

            await sendVerificationEmail(req.body.email, verificationCode);

            return res.json({ title: 'success',email:req.body.email });
        }

        // Create a new user if doesn't exist
        const hash = await bcrypt.hash(req.body.password, 10);
        const verificationCode = generateVerificationCode();

        const newUser = new User({
            name: req.body.name,
            registerNo: req.body.registerNo,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            country: req.body.country,
            password: hash,
            verificationCode,
        });

        await newUser.save();
        await sendVerificationEmail(req.body.email, verificationCode);

        return res.json({ title: 'success',email:req.body.email });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ title: 'Error' });
    }
});

router.get('/verify', isguest,(req, res)=>{
    console.log(req.query)
    let email = req.query.email
    res.render('home/verify.ejs',{email,auth: false})
})

router.get('/search',(req, res)=>{
    res.render('home/search.ejs',{auth: false})
})


router.post('/verify', async (req, res) => {
    console.log(req.body);
    const email = req.body.email;
    const code = req.body.verificationcode;

    try {
        const user = await User.findOne({ email: email, verificationCode: code });
        if (user) {
            // Update the user to mark email as verified
            await User.updateOne({ email: email }, { $set: { emailVerify: true } });

            console.log('Email verified');
            res.json('Email verified');
        } else {
            console.log('Verification failed');
            res.json('failed');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json('Internal Server Error');
    }
});

router.get('/logout',function(req,res,next){
    req.logout(function(err){
        if(err){
            return next(err);
        }
        res.redirect("/")
    })
})

module.exports = router;