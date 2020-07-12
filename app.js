const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const dishesRouter = require('./routes/dishesRouter');
const promotionsRouter = require('./routes/promotionsRouter');
const leadersRouter = require('./routes/leadersRouter')
const uploadRouter = require('./routes/uploadRouter')
const usersRouter = require('./routes/usersRouter')
const favoritesRouter = require('./routes/favoritesRouter')
const passport = require('passport')
const authenticate = require('./authenticate')
const Dish = require('./models/dishes')
const config= require('./config')
const app = express();


app.all('*',(req,res,next)=>{
    if(req.secure) {
        return next();
    }else {
        res.redirect(307,'https://'+req.hostname+':'+app.get('secPort')+req.url);
    }
})
/// setting up the db 

const url = config.mongoUrl
const connect = mongoose.connect(url);

connect.then(db => {
    console.log('Connected correctly to the server')
}, (err)=>{
    console.log(err)
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('123456-8794697-afea-acaegagae'));
// app.use(session({
//     name : 'session-id',
//     secret : '123456-8794697-afea-acaegagae',
//     saveUninitialized : false,
//     resave : false,
//     store : new FileStore()
// }))
/// Authentication middleware that uses BASIC authentication

app.use(passport.initialize())
// app.use(passport.session())
function auth(req,res,next){
    if(!req.user){
        let err = new Error('You are not authenticated')
        res.setHeader('WWW-Authenticate','Basic');
        err.status = 403;
        next(err)
    }
    else {
        next();
    }
   
}

app.use(express.static(path.join(__dirname, 'public')));
app.use('/users',usersRouter)
app.use('/dishes', dishesRouter);
app.use('/promotions', promotionsRouter);
app.use('/leaders', leadersRouter);
app.use('/imageUpload',uploadRouter);
app.use('/favorites',favoritesRouter)
app.on('close', ()=>{
    console.log('Closing server');
    
    mongoose.connection.close()
})

/// to close mongoose connextion
process.on('beforeExit',()=>{
    console.log("Stopping server")
    mongoose.connection.close()
})
module.exports = app;
