const Campground = require('../models/campground')
const Review = require('../models/review')



module.exports.createReview = async (req,res)=> { // como /:id não está definido aqui, e sim no index.js, precisa colocar {mergeParams: true}
const campground = await Campground.findById(req.params.id); // caso contrario, não precisa
const review = new Review(req.body.review)
review.author = req.user._id;
campground.reviews.push(review);
await review.save();
await campground.save();
req.flash('success', 'Created new review!');
res.redirect(`/campgrounds/${campground._id}`);
}


module.exports.deleteReview = async (req,res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}) // acha o campground com esse id, dentro de reviews ele vai achar o reviewId e tirar do array 
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
    
}