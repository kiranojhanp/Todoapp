const jwt = require("jsonwebtoken");

function verifyUser(req, res, next) {
  let authHeader = req.headers.authorization;
  if (!authHeader) {
    let err = new Error("No authentication information");
    err.status = 401;
    return next(err);
  }

  let token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.SECRET, (err, payload) => {
    if (err) {
      let err = new Error("Token couldn't be verified");
      return next(err);
    }
    req.user = payload;
    next();
  });
}

function verifyManager(req, res, next) {
  console.log(req.user);
  if (!req.user) {
    let err = new Error("No authentication information");
    err.status = 401;
    return next(err);
  } else if (
    req.user.role === "basic" 
  ) {
    let err = new Error("Forbidden");
    err.status = 403;
    return next(err);
  }
  // manager and admin allowed
  next();
}

function verifyAdmin(req, res, next)  {
  console.log(req.user);
  if (!req.user) {
    let err = new Error("No authentication information");
    err.status = 401;
    return next(err);
  }
  // send to next if user role is manager
  if (req.user.role !== "admin") {
    let err = new Error("Forbidden");
    err.status = 403;
    return next(err);
  }
  // Only admin allowed
  next();
};

module.exports = { verifyUser, verifyAdmin, verifyManager };
