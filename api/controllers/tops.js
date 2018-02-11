const mongoose = require('mongoose');

const Top = require('../models/top');
const Target = require('../models/target');

exports.tops_get_all = (req, res, next) => {
  const query = {};

  if (req.query.periodType) { query.periodType = req.query.periodType; } 
  if (req.query.date) { query.date = req.query.date; } 
  if (req.query.startDate && req.query.endDate) {
    query.date = {$gte: req.query.startDate, $lte: req.query.endDate}
  } 

  Top
    .find(query)
    .select('name targetId price targetName description date periodType type _id')
    .exec()
    .then(docs => {
      res.status(200).json(docs.map(doc => {
        return {
          _id: doc._id,
          type: doc.type,
          periodType: doc.periodType,
          name: doc.name,
          description: doc.description,
          price: doc.price,
          date: doc.date,
          target: {
            _id: doc.targetId,
            name: doc.targetName
          },
          request: {
            type: 'GET',
            url: `http://localhost:3000/targets/${doc._id}`
          }
        }
      }));
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    })
};

exports.tops_create = (req, res, next) => {
  Target
    .findById(req.body.target._id)
    .then(target => {
      if (!target) {
        return res.status(404).json({message: 'Target not found'});
      }
      const top = new Top({
        _id: mongoose.Types.ObjectId(),
        userId: req.userData.userId,
        description: req.body.description,
        type: req.body.type,
        periodType: req.body.periodType,
        price: req.body.price,
        name: req.body.name,
        date: req.body.date,
        targetId: req.body.target._id,
        targetName: req.body.target.name,
      })
      return top
        .save()
    })
    .then(result => {
      res.status(201).json({
        message: 'Created top successfully',
        createdTop: {
          name: result.name,
          description: result.description,
          type: result.type,
          price: result.price,
          date: result.date,
          target: {
            _id: result.targetId,
            name: result.targetName,
          },
          _id: result._id,
          request: {
            type: 'GET',
            url: `http://localhost:3000/tops/${result._id}`
          }
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({error: err})
    });
};

exports.tops_get_single = (req, res, next) => {
  Top.findById(req.params.topId)
    .exec()
    .then(result => {
      if (!result) {
        return res.status(404).json({
          message: 'Top not found'
        })
      }      
      res.status(200).json({
        top: {
          _id: result._id,
          name: result.name,
          price: result.price,
          type: result.type,
          periodType: result.periodType,
          date: result.date,
          targetId: result.targetId,
          targetName: result.targetName
        },
        request:  {
          type: 'GET',
          url: 'http://localhost:3000/tops'
        }
      })
    })
    .catch(err => res.status(500).json({error: err}));
}

exports.tops_patch = (req, res, next) => {
  const id = req.params.topId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Top
    .update({_id: id}, { $set: updateOps })  
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Top updated',
        request: {
          type: 'GET',
          url: `http://localhost:3000/tops/${result._id}`
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      })
    })
}

exports.tops_delete = (req, res, next) => {
  const id = req.params.topId;
  Top
    .remove({_id: id})
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Top deleted',
        request: {
          type: 'POST',
          url: `http://localhost:3000/tops`,
          body: {name: '', price: ''}
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    })
}
