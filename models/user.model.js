const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const createHttpError = require('http-errors');
const {roles} = require('../utils/constants')
const UserSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    CGPA : {
      type : Number
    },
    Branch : {
      type : String
    },
    SID : {
      type : Number
    },
    role : {
      type: String ,
      enum : [roles.Admin , roles.Student , roles.Mod],
      default : roles.Student
    }
  
});
  UserSchema.pre('save' , async function(next){
    try{
        if(this.isNew){
            const salt =  await  bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(this.password , salt);
            this.password = hashedPassword
            // console.log(this.password);
            if(this.email == process.env.ADMIN_EMAIL.toLowerCase()){
                this.role = roles.Admin;       
            }
            
        }
       
        next();
    }
    catch(error){
        next(error);
    }
  })

  UserSchema.methods.isValidPassword = async function (password) {
    try {
      console.log(password ,this.password);
      return await bcrypt.compare(password ,this.password );
    } catch (error) {
      throw createHttpError.InternalServerError(error.message);
    }
  };


  



const User = mongoose.model('user', UserSchema);
module.exports = User;