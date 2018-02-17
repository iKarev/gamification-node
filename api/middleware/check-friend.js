const User = require('../models/user');

module.exports = (req, res, next) => {
  try {
    if (!req.query.friendId) {
      next();
    } else {
      User
        .findOne({_id: req.query.friendId, "friends._id": req.userData.userId})
        .select('name email _id friends')
        .exec()
        .then(doc => {
          const exists = doc.friends.findIndex((item) => (item.status === 'common' || item.status === 'request'));
          if (exists > -1) {
            next();
          } else {
            return res.status(500).json({ message: 'No access to user info' });
          }
        });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Something went wrong' });
  }
};
