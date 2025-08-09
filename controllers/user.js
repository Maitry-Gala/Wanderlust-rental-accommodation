const User = require("../models/user.js");

module.exports.signup = (req, res) => {
  res.render("users/signup.ejs");
}

module.exports.renderSignupForm = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Email is already registered. Please log in or use a different email.");
      return res.redirect("/signup");
    }
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    //console.log(registeredUser);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });

  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
}

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
}

module.exports.loginForm = async(req,res)=>{
  req.flash("success","Welcome back to Wanderlust!");
  let redirectUrl = res.locals.redirectUrl || "/listings" ;
  res.redirect(redirectUrl);
}

module.exports.logout = (req,res,next) =>{
  req.logout((err) =>{
    if(err){
      return next(err);
    }
    req.flash("success","You are logged out!");
    res.redirect("/listings");
  });
}