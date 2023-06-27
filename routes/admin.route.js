const router = require('express').Router();
const User = require('../models/user.model');
router.get('/users', async (req ,res  , next)=>{
    try {
        
        const allusers = await User.find();
        res.render('userdata'  ,{allusers});
    }
    catch(error){
         next(error)
    }
});

router.get('/user/:id' , async (req , res , next)=>{
    try{
        const {id} = req.params;


        const person = await User.findById(id)
        res.render('profile' ,{person});
    }
    catch(error){
        next(error);
    }
});

router.get('/user' , async (req , res , next)=>{
    try{
        const {search} = req.query;
        // console.log(search);
        const query = {SID : search}
        

        const person = await User.findOne(query);
        res.render('profile' ,{person});
    }
    catch(error){
        next(error);
    }
});

router.get('/filter' , async (req , res , next)=>{
    try{
        const {branch} = req.query;
        console.log(branch);
        const query = {Branch : branch}

        const options = {
            sort : {CGPA : -1},
        }

        const allusers = await User.find(query ,{}, options);
        console.log(allusers);
        
        res.render('userdata' ,{allusers});
    }
    catch(error){
        next(error);
    }
});

// router.get('/branch' , async (req , res , next)=>{
//     try{
        // const {search} = req.query;
        
        // const query = {Branch : search}
        // const options = {
        //     sort : {CGPA : -1},
        // }

//         const allusers = await User.find(query , options);
//         res.render('userdata' ,{allusers});
//     }
//     catch(error){
//         next(error);
//     }
// });


module.exports = router ;