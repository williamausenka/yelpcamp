const User = require('../models/user');


module.exports.renderRegister = (req,res) => {
    res.render('users/register');
}

module.exports.register = async (req,res) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password); // passport save automaticamente na db 
        console.log(registeredUser);
        req.login(registeredUser, err => { //middleware para logar o usuario qndo ele fizer o cadastro
            if(err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds')
        });
 
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }
}

module.exports.renderLogin = (req,res) => {
    res.render('users/login');
}


module.exports.login = (req,res) => {
    req.flash('success', 'Welcome back');
    const redirectUrl = req.session.returnTo || '/campgrounds'; // returnTo guarda na session onde o usuario estava, se n tiver nada é undefined e vai dar /campgrounds
    // delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req,res) => {
    req.logout();
    req.flash('success', 'Goodbye');
    res.redirect('/campgrounds');
}