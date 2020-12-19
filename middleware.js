const {campgroundSchema, reviewSchema} = require('./schemas')
const ExpressError = require('./utils/ExpressError'); // .. significa voltar uma pasta
const Campground = require('./models/campground')
const Review = require('./models/review')

module.exports.isLoggedIn = (req,res,next) => {
    //console.log(req.user) => me devolve um objeto com ._id, username e email do usuario logado, guardado na session
    
    if(!req.isAuthenticated()) { // isAuthenticated  é um method incluido no passport para proteger essa route, só pode criar um novo campground se vc estiver logado
        
        req.flash('error', 'You must be signed in');
        return res.redirect('/login')
    }
    next();
}

module.exports.validateCampground = (req,res,next) => {
    
    const {error} = campgroundSchema.validate(req.body) // isso é o schema do schemas.js, nao tem nada relacionado com o schema do mongoose => validade é do Joi
    if(error){ // lidando com erro no backend, PUT e POST request, previnir que n de pra colocar 
      const msg = error.details.map(el => el.message).join(',')  //pegando apenas a mensagem de erro
      throw new ExpressError(msg, 400)  
    } else{
        next();
    }
}

module.exports.isAuthor = async (req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id)
    if(!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports.validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body)
    if(error){ // lidando com erro no backend, PUT e POST request, previnir que n de pra colocar 
        const msg = error.details.map(el => el.message).join(',')  //pegando apenas a mensagem de erro
        throw new ExpressError(msg, 400)  
      } else{
          next();
        }
}

module.exports.isReviewAuthor = async (req,res,next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId)
    if(!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}