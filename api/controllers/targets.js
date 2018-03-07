const mongoose = require('mongoose');

const Top = require('../models/top');
const Target = require('../models/target');
const Trinaries = require('../shared/trinaries');

exports.targets_get_all_targets = (req, res, next) => {
  const userId = Trinaries.getRequestId(req);
  const type = req.query.type === '4' ? {$gte: 3} : req.query.type;
  Target
    .find({userId, type})
    .select('name deadline description parentTargetId type _id')
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        targets: docs.map(doc => {
          if (doc.deadline) {
            return {
              name: doc.name,
              type: doc.type,
              parentTargetId: doc.parentTargetId,
              description: doc.description,
              deadline: doc.deadline,
              _id: doc._id,
              request: {
                type: 'GET',
                url: `http://localhost:3000/targets/${doc._id}`
              }
            }
          } else {
            return doc
          }
        })
      }
      res.status(200).json(response);
    })
    .catch(err => { console.log(err); res.status(500).json({error: err}) });
};

exports.targets_get_target_children = (req, res, next) => {
  const userId = Trinaries.getRequestId(req);
  Target
    .find({userId, parentTargetId: req.params.parentTargetId})
    .select('name deadline description parentTargetId type _id')
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        targets: docs.map(doc => {
          if (doc.deadline) {
            return {
              name: doc.name,
              type: doc.type,
              parentTargetId: doc.parentTargetId,
              description: doc.description,
              deadline: doc.deadline,
              // deadline: getDeadline(doc.deadline),
              _id: doc._id,
              request: {
                type: 'GET',
                url: `http://localhost:3000/targets/${doc._id}`
              }
            }
          } else {
            return doc
          }
        })
      }
      res.status(200).json(response);
    })
    .catch(err => { console.log(err); res.status(500).json({error: err}) });
};

exports.targets_create_target = (req, res, next) => {
  const target = new Target({
    _id: new mongoose.Types.ObjectId(),
    userId: req.userData.userId,
    name: req.body.name,
    parentTargetId: req.body.parentTargetId,
    deadline: req.body.deadline,
    description: req.body.description,
    type: parseInt(req.body.type)
  });
  target
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Created target successfully',
        createdTarget: {
          name: result.name,
          parentTargetId: result.parentTargetId,
          deadline: result.deadline,
          description: result.description,
          type: result.type,
          _id: result._id,
          request: {
            type: 'GET',
            url: `http://localhost:3000/targets/${result._id}`
          }
        }
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err})
    });
    
};

exports.targets_get_single_target = (req, res, next) => {

  const userId = Trinaries.getRequestId(req);

  const id = req.params.targetId;
  const method = id === 'main' ? 'find' : 'findById';
  const request = id === 'main' ? {userId, type: 0} : id
  Target
    [method](request)
    .select('name description deadline type parentTargetId  _id')
    .exec()
    .then(doc => {
      if ((doc && doc.name) || (doc && id === 'main' && doc[0].name)) {
        doc = id === 'main' ? doc[0] : doc;
        res.status(200).json({
          name: doc.name,
          parentTargetId: doc.parentTargetId,
          type: doc.type,
          description: doc.description,
          deadline: doc.deadline,
          _id: doc._id,
          request: {
            type: 'GET',
            url: `http://localhost:3000/targets/${doc._id}`
          }
        });
      } else {
        res.status(404).json({message: 'No valid entry valid found for provided ID'});
      }
    })
    .catch(err => { console.log(err); res.status(500).json({error: err}); })
};

exports.targets_patch_target = (req, res, next) => {
  const id = req.params.targetId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = /*ops.propName === 'deadline' ? saveDeadline(ops.value) :*/ ops.value;
  }
  Target
    .update({_id: id, userId: req.userData.userId}, { $set: updateOps })  
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Target updated',
        request: {
          type: 'GET',
          url: `http://localhost:3000/targets/${result._id}`
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      })
    })
};

exports.targets_delete_target = (req, res, next) => {
  const id = req.params.targetId;
  Target
    .remove({_id: id})
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Target deleted',
        request: {
          type: 'POST',
          url: `http://localhost:3000/targets`,
          body: {name: '', deadline: '', parentTargetId: null, description: ''}
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    })
};

function checkNumber (num) {
  return num < 10 ? `0${num}` : num;
}
function getDeadline(date) {
  return `${checkNumber(date.getDate())}.${checkNumber(date.getMonth() + 1)}.${date.getFullYear()}`;
}
function saveDeadline(dateString) {
  return new Date(dateString.slice(6,10), (dateString.slice(3,5) - 1), dateString.slice(0,2));
}

exports.targets_get_statistics = (req, res, next) => {
  const query = {userId: req.userData.userId};
  Top
    .find(query)
    .select('targetId targetName periodType _id')
    .exec()
    .then(docs => {
      console.log(docs)
      res.status(200).json(docs.map(doc => {
        return {
          _id: doc._id,
          periodType: doc.periodType,
          target: {
            _id: doc.targetId,
            name: doc.targetName
          }
        }
      }));
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    })
};

