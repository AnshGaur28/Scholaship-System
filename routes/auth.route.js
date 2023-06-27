const router = require('express').Router();
// const connection = require('../server');
const User = require('../models/user.model');
const { body , validationResult} = require('express-validator');
const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');

router.get('/login' ,connectEnsureLogin.ensureLoggedOut({redirectTo : '/'}) , async(req , res , next)=>{
    res.render('login')
});
//  Passport has inbuilt functionality to store the user in req object ...
router.post('/login',connectEnsureLogin.ensureLoggedOut({redirectTo : '/'}) , passport.authenticate('local', { /*successRedirect : '/user/profile'*/  successReturnToOrRedirect : '/' ,failureRedirect: '/auth/login' , failureFlash :true }) );


router.get('/register' ,connectEnsureLogin.ensureLoggedOut({redirectTo : '/'}), async(req , res , next)=>{
    // req.flash('error' , "Some Error Occured")
    // req.flash('info' , "Already Registered")
    // req.flash('warning' , "Short Password")
    // req.flash('success' , "Registered")
    // const messages = req.flash();
    res.render('register' )
});

router.post('/register' ,connectEnsureLogin.ensureLoggedOut({redirectTo : '/'}) ,[
    body('email').trim().isEmail().withMessage('Email must be a Valid Email').normalizeEmail().toLowerCase(),
    body('password').trim().isLength(5 , 30).withMessage('Invalid Format - Too short','Invalid Format - Too Long'),
    body('password2').trim().custom((value , {req} )=>{
        if(value!==req.body.password){
            throw new Error('Passwords do not match')
        }
        return true;
    })
] , async(req , res , next)=>{
    const {email} = req.body ;
    const doesExist = await User.findOne(
        {email});
    if(doesExist){
        res.render('login')
        return 
    }
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            // console.log(errors)
            errors.array().forEach((error)=>{
                req.flash('error' , error.msg)
            })
            res.render('register', {messages : req.flash()})
            return
        }
        //  Saving user to request body...
        const user = new User(req.body);
        await user.save()
        req.flash('success' , 'User successfully registered')
        res.redirect('/auth/login')
        // res.send(user)
    }catch(error){
        next(error);
    }
});

router.get('/logout', connectEnsureLogin.ensureLoggedIn({redirectTo : '/'}) ,function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });


module.exports = router;


// function ensureNOTAuthenticated(req, res, next){
//     if(req.isAuthenticated()){
//       res.redirect('back')
//     }
//     else{
//         next();
//     }
// }

// function ensureAuthenticated(req, res, next){
//     if(req.isAuthenticated()){
//       next()
//     }
//     else{
//       res.redirect('/auth/login')
//     }
//   }
