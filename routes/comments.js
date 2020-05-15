const express = require("express");
const router = express.Router({mergeParams: true});
const Campground = require("../models/campgrounds");
const Comment = require("../models/comments");

// Comments New
router.get("/new", isLoggedIn, function(req, res){
	//find campground by id
	Campground.findById(req.params.id, function(err, campground){ 
		if(err) {
			console.log(err);
		} else {
			res.render("./comments/new", {campground: campground});
		}
	});
});

router.post("/", isLoggedIn, function(req, res){
	// lookup campground using id
	Campground.findById(req.params.id, function(err, campground){
		if(err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			// create new comment
			Comment.create(req.body.comment, function(err,comment){
				if(err){
					console.log(err);
				} else {
					// add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					// save comment
					comment.save();
					// create new comment
					campground.comments.push(comment);
					campground.save();
					// redirect to campgroundshow page
					res.redirect("/campgrounds/" + campground._id);
				}
			})
		}
	});
});


// Comment edit route
router.get("/:comment_id/edit", checkCommentOwnership, function(req, res){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err) {
			res.redirect("back");
		} else {
			res.render("comments/edit", {
				campground_id: req.params.id,
				comment: foundComment
			});
		}
	});
});

// Comment update
router.put("/:comment_id", checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updateComment){
		if(err) {
			res.redirect("back");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//Comment destroy route
router.delete("/:comment_id", checkCommentOwnership, function(req, res){
	//find by id and remove
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err) {
			res.redirect("back");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//middleware
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} 
	res.redirect("/login");
}

function checkCommentOwnership(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err) {
				res.redirect("back");
			} else {
				// does user own the comment?
				if(foundComment.author.id.equals(req.user._id)){
					next();
				} else {
					res.redirect("back");
				}
			}
		});
	} else {
		res.redirect("back");
	}
}

module.exports = router;