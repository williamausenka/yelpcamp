const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate') //npm i ejs-mate
const mongoose = require('mongoose');
 // const Joi = require('joi') //npm i joi => validar o schema server side => ta definido no schemas.js
const methodOverride = require('method-override')
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const {campgroundSchema, reviewSchema} = require('./schemas')
const Review = require('./models/review')
const Campground = require('./models/campground')
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users')
const session = require('express-session');
const flash = require('connect-flash');
const passport= require('passport'); //npm i passport passport-local passport-local-mongoose
const LocalStrategy = require('passport-local');
const User = require('./models/user')



mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
})


const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}));

app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public'))) //para poder usar os files da pasta public no projeto

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // segurança do cookie
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // cookie expira em 1 semana (é contado em milisegundos a data)
        maxAge: 1000 * 60 * 60 * 24 * 7
    }

}

app.use(session(sessionConfig)); // tem que estar antes do app.use(passport.session());
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // static method add ao pegar o passport, para autenticar

passport.serializeUser(User.serializeUser()); // guardar infos na session
passport.deserializeUser(User.deserializeUser()); // jogar fora as infos na session

app.use((req,res,next) => {
    if(!['/login', '/'].includes(req.originalUrl)) { // originalUrl é a pagina onde o usuario esta. Se ele não vier de /login ou / (campgrounds), colocar a pagina onde ele estava na returnTo
        req.session.returnTo = req.originalUrl;
    }
    console.log(req.originalUrl);
    console.log(req.session); //mostra o que tem na session
    res.locals.currentUser = req.user; // se nao tiver ngm logado, vai devolver undefined, para o resto olhar middleware.js 
    res.locals.success = req.flash('success'); //ordem importa, tem q ser antes das rotas do router
    res.locals.error = req.flash('error'); // como é locals, eu tenho acesso em todos os templates
    next(); // e dps dos app.use session e flash
})

// app.get('/fakeUser', async (req,res) => {
//     const user = new User({ email: 'colt@gmail.com', username: 'colttt'});
//     const newUser = await User.register(user, 'chicken'); // chicken é a senha
//     res.send(newUser);
// })

app.use('/campgrounds', campgroundsRoutes); // usar os routes
app.use('/campgrounds/:id/reviews', reviewsRoutes)
app.use('/', userRoutes);



app.get('/', (req,res) => {
    res.render('home')
})



// REVIEWS ROUTES



app.all('*', (req,res,next) => { //pegando todas as outras rotas e respondendo com isso
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh no, something went wrong!'
    res.status(statusCode).render('error', {err})
    
})


app.listen(3000, () => {
    console.log('serving on port 3000')
})