const router = require('express').Router();
const express = require('express');
const multer = require('multer');
// Configure Multer to store uploaded files in a folder on your server
const User = require('../models/user.model');
const upload = multer({ dest: 'uploads/' });
const File = require('../models/file.model');
const bodyParser = require("body-parser")
const path = require('path');
const { default: mongoose } = require('mongoose');


router.use(bodyParser.urlencoded({ extended: true }));
router.get('/profile',ensureAuthenticated , async (req, res, next) => {
  // console.log(req.user._id);
  res.render('profile', { person : req.user });
});

router.get('/Users' ,ensureAuthenticated , async(req, res , next)=>{
  const users = await User.find();
  const userArray = [] ;
  users.forEach(user => {
    userArray.push(user);
  });
  // console.log(userArray );
  res.render('Users'  , {userArray});
})

router.get('/apply' ,ensureAuthenticated , async(req, res , next)=>{
  res.render('application');

})


// Multer --- Just stores the data on the server but not on database 

router.post('/upload', upload.single('file'), async (req, res ) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const file = req.file;
  const id = new mongoose.Types.ObjectId();
  const user = await User.findById(req.user.id);
  const uploadFile = new File({
    user : user.id,
    name : file.originalname,
    path: file.path,
    size: file.size,
    type : file.type,
  });
  await uploadFile.save();
  // Return a response to the client
  res.send('File uploaded successfully');
});


//  For storing on database we will use GridFS and formidable.....


module.exports = router;



// protecting routes
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    next()
  }
  else{
    res.redirect('/auth/login')
  }
}