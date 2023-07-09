const express=require('express');

const route=express.Router();

const userController=require('./controllers/userController');
const postController=require('./controllers/postController');

//THESE ARE USER RELATED ROUTES
route.get('/',userController.home)
route.post('/register',userController.register)
route.post('/login',userController.login)
route.post('/logout',userController.logout)

//THESE ARE POST RELATED ROUTES
route.get('/create-post',userController.mustBeLoggedIn,postController.viewCreateScreen)
route.post('/create-post',userController.mustBeLoggedIn,postController.create)
route.get('/post/:id',postController.viewSingle);
route.get('/post/:id/edit',userController.mustBeLoggedIn,postController.viewEditScreen)
route.post('/post/:id/edit',userController.mustBeLoggedIn,postController.edit)
route.post('/post/:id/delete',userController.mustBeLoggedIn,postController.delete)

//PROFILE RELATED ROUTES
route.get('/profile/:username' ,userController.ifUserExists,userController.profilePostsScreen)
module.exports=route;