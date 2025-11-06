const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Get token from header
  const token = req.header('Authorization');

  // 2. Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Verify token
  try {
    // The token format is "Bearer YOUR_TOKEN", so we split and take the token part
    const tokenPart = token.split(' ')[1];
    if (!tokenPart) {
      return res.status(401).json({ msg: 'Token format is invalid' });
    }

    const decoded = jwt.verify(tokenPart, process.env.JWT_SECRET);
    
    // 4. Add user from payload to request object
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};