const router =require('express').Router();

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

module.exports=router;