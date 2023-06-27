const express = require('express');
const session = require('express-session')
const connectflash = require('connect-flash')
const createHttpError = require('http-errors');
// const connectMongo = require('connect-mongo')(session)
const morgan = require('morgan');
// const mysql = require('mysql');
const mongoose = require('mongoose');
const passport = require('passport');
// const bodyParser = require('body-parser');
const connectEnsureLogin = require('connect-ensure-login');
require('dotenv').config();
const {roles} = require('./utils/constants');
//  Morgan is used to check routes....
const app =  express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('dev'))
app.use(express.static('public'))

// const mongoStore = connectMongo(session);
// init session
app.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false ,
    cookie : {
        // secure : true
        httpOnly : true
    },
    // store : new mongoStore({mongooseConnection : mongoose.connection}),
}))

app.use(passport.initialize());
app.use(passport.session());

require('./utils/passport.auth')
//  after validation we store the user in res so we can use it in our templates
app.use((req, res , next)=>{
  res.locals.user = req.user;
  next();

})

// Routes

app.use(connectflash());
app.use((req,res,next)=>{
    res.locals.messages = req.flash()
    next();
})
app.use('/' , require('./routes/index.route'));
app.use('/auth' , require('./routes/auth.route'));
app.use('/user' ,connectEnsureLogin.ensureLoggedIn({redirectTo : '/auth/login'}) , require('./routes/user.route'));
app.use('/admin',connectEnsureLogin.ensureLoggedIn({redirectTo : '/auth/login'}) , ensureAdmin , require('./routes/admin.route'));
app.set('view engine' , 'ejs')



// Error Handling 
app.use('*' ,(req , res , next)=>{
    next(createHttpError.NotFound())
});
app.use((error , req, res , next)=>{
    error.status = error.status || 500
    res.status(error.status)
    res.render('error_40x' ,{error})
})

const Port = process.env.Port || 300
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('💾 connected...');
    // Listening for connections on the defined PORT
    app.listen(Port, () => console.log(`🚀 @ http://localhost:${Port}`));
  })
  .catch((err) => console.log(err.message));


  // function ensureAuthenticated(req, res, next){
  //   if(req.isAuthenticated()){
  //     next()
  //   }
  //   else{
  //     res.redirect('/auth/login')
  //   }
  // }

  function ensureAdmin(req,res, next){
    if(req.user.role === roles.Admin){
      next();
    }
    else{
      req.flash('warning' ,'Not authorized');
      res.redirect('/')
    }
  }

  
  function ensureMod(req,res, next){
    if(req.user.role === roles.Mod){
      next();
    }
    else{
      req.flash('warning' ,'Not authorized');
      res.redirect('/')
    }
  }



