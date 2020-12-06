const user = require("../models/user")

const Message = require('../models/message');

exports.modify = (userId, req, res, next) => {
    const msgId = req.params.id;
    const newContent = req.body.newContent;
    Message.findOneAndUpdate({_id: msgId, owner: userId}, {content: newContent})
    .then(message => {
        return res.status(201).json({message: 'Message successfully updated'});
    })
    .catch(error => res.status(500).json({error}))
}

exports.delete = (userId, req, res, next) => {
    const msgId = req.params.id;
    Message.findOneAndDelete({_id: msgId, owner: userId}, (err, doc) => {
        if(err) {
            return res.status(500).json({error});
        } else {
            return res.status(201).json({message: 'Message successfully deleted'});
        }
    })
}

exports.get = (userId, req, res, next) => {
    Message.findOne({_id: msgId})
    .then(message => {
        if(message.owner._id !== userId) {
            return res.status(400).json({error: 'Unauthorized'});
        }
        return res.status(201).json({data: message});
    })
    .catch(error => res.status(500).json({error}))
}