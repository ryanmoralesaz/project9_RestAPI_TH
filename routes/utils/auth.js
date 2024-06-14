const bcrypt = require('bcryptjs');
const { User } = require('../../models');
const auth = require('basic-auth');
// create a user authentication middle ware
const authenticateUser = async (req, res, next) => {
  let message = null;
  const credentials = auth(req);
  // early return for missing credentials
  // if credentials aren't found, return a 401 with an access denied message
  if (!credentials) {
    message = 'Authorization header not fonud';
    console.warn(message);
    return res.status(401).json({ message: 'Access Denied' });
  }

  const user = await User.findOne({
    where: { emailAddress: credentials.name }
  });
  // early return for user not found
  // if the user is not found send a 401 with an access denied message
  if (!user) {
    message = 'User not found for username: ' + credentials.name;
    console.warn(message);
    return res.status(401).json({ message: 'Access Denied' });
  }

  const authenticated = bcrypt.compareSync(credentials.pass, user.password);
  // early return for failed authentication
  // return 401 message if the authentication failed
  if (!authenticated) {
    message = 'Authentication failure for username: ' + credentials.name;
    console.warn(message);
    return res.status(401).json({ message: 'Access Denied' });
  }
  // if all checks pass set the user on the request object and go to next middle ware route
  req.currentUser = user;
  next();
};

module.exports = authenticateUser;
