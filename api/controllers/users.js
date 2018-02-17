const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.users_get_list = (req, res, next) => {
  User
    .find({ _id: { $ne: req.userData.userId }})
    .select('name friends email _id')
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        users: docs.map(doc => {
          return {
            name: doc.name,
            email: doc.email,
            _id: doc._id
          }
        })
      }
      res.status(200).json(response);
    })
    .catch(err => { console.log(err); res.status(500).json({error: err}) });
};
exports.users_get_friends = (req, res, next) => {
  User
    .findById(req.userData.userId)
    .select('friends')
    .exec()
    .then(result => {
      console.log(result);
      const response = result;
      res.status(200).json(response);
    })
    .catch(err => { console.log(err); res.status(500).json({error: err}) });
};

exports.users_login = (req, res, next) => {
  User
    .find({email: req.body.email})
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({ message: 'Auth failed' });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, compareResult) => {
        if (err) {
          return res.status(401).json({ message: 'Auth failed' });
        }
        if (compareResult) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id
            }, 
            process.env.JWT_KEY, 
            {
              expiresIn: "1d"
            }
          )
          return res.status(200).json({
            message: 'Auth successful',
            user: {
              email: user[0].email,
              _id: user[0]._id
            },
            token: token
          })
        }
        return res.status(401).json({ message: 'Auth failed' });
      })
    })
    .catch(err => res.status(500).json({error: err}))
};

exports.users_signup = (req, res, next) => {
  User
    .find({email: req.body.email})
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({message: 'User with this email is already exists'});
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({error: err})
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash
            });
            user
              .save()
              .then(result => {
                res.status(201).json({
                  message: 'User created'
                })
              })
          }
        })
      }
    })
    .catch(err => res.status(500).json({error: err}))
};

exports.users_delete_user = (req, res, next) => {
  User
    .remove({_id: req.params.userId})
    .exec()
    .then(result => {
      res.status(200).json({message: 'user deleted'});
    })
    .catch(err => res.status(500).json({error: err}))
};

exports.users_friendship_request = (req, res, next) => {
  console.log(req.params.type)
  const findExportParams = {_id: req.body._id}
  const exportFriend = {_id: req.userData.userId};
  const findImportParams = {_id: req.userData.userId}
  const importFriend = {_id: req.body._id};
  const setExportParams = {}
  const setImportParams = {}
  switch(req.params.type) {
    case 'request': 
      exportFriend.status = 'new';
      importFriend.status = 'request';
      setExportParams.$push = {friends: exportFriend}
      setImportParams.$push = {friends: importFriend}
      break;
    case 'accept':
      findExportParams["friends._id"] = req.userData.userId;
      findImportParams["friends._id"] = req.body._id;
      setExportParams.$set = {"friends.$.status": 'common'}
      setImportParams.$set = {"friends.$.status": 'common'}
      break;
  }

  if (req.params.type === 'request') {
    User
      .find({_id: req.body._id, "friends._id": req.userData.userId})
      .exec()
      .then(result => {
        console.log(result);
        if (result.length >= 0) {
          return res.status(500).json({message: 'Relationship with this user is already exists'});
        } else {
          User // export friend
            .update(findExportParams, setExportParams)
            .exec()
            .then(result => {
              User // import friend
                .update(findImportParams, setImportParams)
                .exec()
                .then(result => {
                  console.log(result);
                  res.status(200).json({message: `${req.params.type} sended`});
                })
            })
        }
      })
      .catch(err => {
        console.log('--- ERROR ---');
        console.log(err);
        console.log('--- ERROR ---');
        res.status(500).json({error: err});
      });
  }

    
};
