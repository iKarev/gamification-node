const mongoose = require('mongoose');

const Doing = require('../models/doing');
const Trinaries = require('../shared/trinaries');

exports.doings_get_list_of_type = (req, res, next) => {
  const query = {userId: Trinaries.getRequestId(req)};
  if (req.query.periodType) { query.periodType = req.query.periodType; }
  let props = 'name type price description implements multiplier _id';
  if (!query.periodType) props += ' periodType';
  Doing
    .find(query)
    .select(props)
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        doings: docs.map(doc => {
          const response = {
            name: doc.name,
            type: doc.type,
            price: doc.price,
            description: doc.description,
            multiplier: doc.multiplier,
            _id: doc._id,
            request: {
              type: 'GET',
              url: `http://localhost:3000/doings/${doc._id}`
            }
          }
          if (!query.periodType) {
            response.periodType = doc.periodType
          }
          if (req.query.startDate && req.query.endDate) {
            response.implements = doc.implements.filter((item) => {
              return item && (item.date >= req.query.startDate && item.date <= req.query.endDate)
            })
          } else {
            response.implements = doc.implements
          }
          return response;
        })
      }
      res.status(200).json(response);
    })
    .catch(err => { console.log(err); res.status(500).json({error: err}) });
};
 
exports.doings_get_doings_of_date = (req, res, next) => {
  const query = {userId: Trinaries.getRequestId(req)};
  if (req.params.periodType) { query.periodType = req.params.periodType; }
  Doing
    .find(query)
    .select('name type price description implements multiplier _id')
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        doings: docs.map(doc => {
          if (req.params && req.params.date) {
            return {
              name: doc.name,
              type: doc.type,
              price: doc.price,
              description: doc.description,
              multiplier: doc.multiplier,
              value: getValue(doc.implements),
              _id: doc._id,
              request: {
                type: 'GET',
                url: `http://localhost:3000/doings/${doc._id}`
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

    function getValue(implements) {
      const implement = implements.filter((i) => {
        if (i && i.date) {
          return i.date === req.params.date
        }
      })
      if (implement && implement.length) {
        return implement[0].value;
      }
    };

};

exports.doings_create_doing = (req, res, next) => {
  const doing = new Doing({
    _id: new mongoose.Types.ObjectId(),
    userId: req.userData.userId,
    name: req.body.name,
    multiplier: 1,
    price: parseInt(req.body.price),
    description: req.body.description,
    periodType: parseInt(req.body.periodType),
    type: parseInt(req.body.type)
  });
  doing
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Created doing successfully',
        createdDoing: {
          name: result.name,
          price: result.price,
          description: result.description,
          periodType: result.periodType,
          type: result.type,
          _id: result._id,
          request: {
            type: 'GET',
            url: `http://localhost:3000/doings/${result._id}`
          }
        }
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err})
    });
    
};

exports.doings_patch_doing = (req, res, next) => {
  const id = req.params.doingId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Doing
    .update({_id: id, userId: req.userData.userId}, { $set: updateOps })  
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Doing updated',
        request: {
          type: 'GET',
          url: `http://localhost:3000/doings/${result._id}`
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

exports.doings_add_implements = (req, res, next) => {
  const id = req.params.doingId;
  Doing
    .update({_id: id, userId: req.userData.userId}, { $push: {implements: req.body} })  
    .exec()
    .then(result => {
      console.log(result)
      res.status(200).json({
        message: 'Implemnts added',
        request: {
          type: 'GET',
          url: `http://localhost:3000/doings/${id}/implements`
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

exports.doings_patch_implements = (req, res, next) => {
  const id = req.params.doingId;
  Doing
    .update({_id: id, userId: req.userData.userId, "implements.date": req.body.date}, { $set: { "implements.$.value" : req.body.value} })  
    .exec()
    .then(result => {
      res.status(200).json({
        message: `Implemnt changed to ${req.body.value}`,
        request: {
          type: 'GET',
          url: `http://localhost:3000/doings/${result._id}`
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

exports.doings_delete_doing = (req, res, next) => {
  const id = req.params.doingId;
  Doing
    .remove({_id: id})
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Doing deleted',
        request: {
          type: 'POST',
          url: `http://localhost:3000/doings`,
          body: {name: '', price: '', periodType: null, type: null}
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