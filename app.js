const express=require('express');
const session=require('express-session');
const MongoStore=require('connect-mongo');
const flash=require('connect-flash');
const markdown=require('marked');
const sanitizeHTML=require('sanitize-html')
const app=express();

let sessionOptions=session({
    secret:"JavaScript is so cool",
    store:MongoStore.create({
        client:require('./db')
    }),
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:1000*60*60*24,
        httpOnly:true
    }
})

app.use(sessionOptions)
app.use(flash());

app.use(function(req,res,next){
    //make our markdown function available from within our ejs template
    res.locals.filterUserHTML=function(content)
    {
        return sanitizeHTML(markdown.parse(content),{allowedTags:['p','br','ul','ol','li','strong','bold','i','em','h1','h2','h3','h4','h5','h6'],allowedAttributes:{}})
    }
    //make all error and success flash messages available from all
    res.locals.errors=req.flash("errors")
    res.locals.success=req.flash("success")
    //make current user id available on the req object
    if(req.session.user) {req.visitorId=req.session.user._id} else{req.visitorId=0}
    //make user session data available from within view templates
    res.locals.user=req.session.user
    next()
})

const router=require('./router.js');

app.use(express.static('public'))

//ACCESSING FORM DATA IN EXPRESS
app.use(express.urlencoded({extended:false}));

//ACCESSING FORM DATA IN EXPRESS
app.use(express.json());

app.set('views','views');
app.set('view engine','ejs')

app.use('/',router);

module.exports=app;