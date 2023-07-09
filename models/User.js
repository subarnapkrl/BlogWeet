const validator=require('validator');
const bcrypt=require("bcryptjs")
const usersCollection=require('../db').db().collection("users");
const md5=require('md5');


let User=function(data,getAvatar)
{
    this.data=data;
    this.errors=[];
    if(getAvatar==undefined){getAvatar=false}
    if(getAvatar){this.getAvatar()}
}
User.prototype.validate=function()
{
    return new Promise(async (resolve,reject)=>
    {
        if(this.data.username==""){this.errors.push("You must provide a username.")};
        if(this.data.username !="" && !validator.isAlphanumeric(this.data.username)){this.errors.push("Username must contain alphanumeric characters only")}
        if(!validator.isEmail(this.data.email)){this.errors.push("You must provide a valid email.")};
        if(this.data.password==""){this.errors.push("You must provide a password.")};
    
        if(this.data.password.length>0 && this.data.password<8){
            this.errors.push("Password must be at least 8 characters")
        }
        if(this.data.password.length>15){this.errors.push("Password should not exceed 15 characters.")}
        if(this.data.username.length>0 && this.data.username.length<4){this.errors.push("Username cannot be less than 3 characters.")}
        if(this.data.username.length>15){this.errors.push("Username cannot exceed more than 15 characters.")}
    
        //ONLY IF USERNAME IS VALID THEN CHECK TO SEE IF IT'S ALREADY TAKEN
        if(this.data.username.length >2 && this.data.username.length<31 && validator.isAlphanumeric(this.data.username)){
            let usernameExists=await usersCollection.findOne({username:this.data.username})
    
            if(usernameExists){
                this.errors.push("That username is already taken.")
            }
        }
    
        //ONLY IF Email IS VALID THEN CHECK TO SEE IF IT'S ALREADY TAKEN
        if(validator.isEmail(this.data.email)){
            let emailExists=await usersCollection.findOne({email:this.data.email})
    
            if(emailExists){
                this.errors.push("That email is already in use.")
            }
        }
        resolve()
    })
}
User.prototype.cleanUp=function()
{
    if(typeof(this.data.username)!="string")
    {
        this.data.username="";
    }

    if(typeof(this.data.email)!="string")
    {
        this.data.email="";
    }

    if(typeof(this.data.password)!="string")
    {
        this.data.password="";
    }

    //GET RID OF ANY BOGUS PROPERTIES
    this.data={
        username:this.data.username.trim().toLowerCase(),
        email:this.data.email.trim().toLowerCase(),
        password:this.data.password
    }
}

User.prototype.register=function()
{
    return new Promise(async (resolve,reject)=>
    {
        //STEP#1: VALIDATE USER DATA
        this.cleanUp();
        await this.validate(); 
    
        //STEP#2:ONLY IF THERE ARE NO VALIDATION ERRORS THEN SAVE THE USER DATA INTO A DATABASE
        if(!this.errors.length){
            //HASH USER PASSWORD
            let salt=bcrypt.genSaltSync(10);
            this.data.password=bcrypt.hashSync(this.data.password,salt);
            await usersCollection.insertOne(this.data);
           
            this.getAvatar()
            resolve()
        }else{
            reject(this.errors)
        }
    
    })
}

User.prototype.login=  function()
{
   return new Promise(async (resolve,reject)=>{
    this.cleanUp();
    const attemptedUser=await usersCollection.findOne({username:this.data.username});
    
    if(attemptedUser && bcrypt.compareSync(this.data.password,attemptedUser.password)){
        this.data=attemptedUser;
        this.getAvatar()
        resolve("Congrats");
    }else{
        reject("Invalid Username/Password")
    }
   })
}

User.prototype.getAvatar=function ()
{
    this.avatar=`https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}


User.findByUsername=function(username){
    return new Promise(async function(resolve,reject){
        if(typeof(username) != "string"){
            reject()
            return
        }

        await usersCollection.findOne({username:username}).then(function(userDoc){
            if(userDoc){
                userDoc=new User(userDoc,true)
                userDoc={
                    _id:userDoc.data._id,
                    username:userDoc.data.username,
                    avatar:userDoc.avatar
                }
                console.log(userDoc._id)
                console.log(userDoc.username)
                console.log(userDoc.avatar)
                resolve(userDoc)
            }
        }).catch(function()
        {
            reject()
        })
    })
}

module.exports=User;