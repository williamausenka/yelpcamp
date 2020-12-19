const express = require('express');
const router = express.Router({mergeParams: true}); // para passar os parametros do ro
const Review = require('../models/review')
const Campground = require('../models/campground')
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schemas');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews');






router.post('/',isLoggedIn, validateReview, catchAsync(reviews.createReview));


router.delete('/:reviewId',isLoggedIn,isReviewAuthor, catchAsync(reviews.deleteReview));


module.exports = router;