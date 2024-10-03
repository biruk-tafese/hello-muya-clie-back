// const IsAuth = (req, res, next) => {
//     try {
//       if (req.session && req.session.isAuth) {
//         next();
//       } else {
//         res.redirect("/");
//       }
//     } catch (error) {
//       console.error('Authentication error:', error);
//       res.redirect('/login');
//     }
//   };
  
//   module.exports = IsAuth;
const IsAuth = (req, res, next) => {
  try {
    if (req.session && req.session.user && req.session.user.isAuth) {
      next();
    } else {
      res.status(401).send('Unauthorized');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = IsAuth;