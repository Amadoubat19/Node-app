
const User = require('../models/user');
const Conversation = require('../models/conversation');
const Message = require('../models/message');
const mongoose = require('mongoose');

exports.create = (userId, req, res, next) => {
    const owner = userId;
    const conv = new Conversation({name: ""});
    conv.users = Array(userId);
    if(req.body.members.length <= 0)
        return res.status(400).json({error: 'Must have at least one member'})
    if(req.body.members.length === 1)
        conv.name = req.body.name;

    User.find({_id: {$in: req.body.members}})
    .then(docs => {
        if(docs.length <= 0) {
            return res.status(400).json({error: 'Must have at least one member'});
        }
        docs.forEach(element => {conv.users.push(element)})
        const m = new Message({owner, content: 'Welcome in this group'})
        m.save()
        .then(msg => {
            if(!msg)
                return res.status(400).json({error: 'Message not added'})
            else {
                conv.messages = Array(msg);
                conv.save()
                .then(convy => {
                    if(!convy)
                        return res.status(400).json({error: 'Conversation not added'})
                    console.log(conv)
                    return res.status(201).json({message: 'Successfully created'})
                })
                .catch(error => res.status(500).json({error}))
            }
        })
        .catch(error => res.status(500).json({error}))
    })
    .catch(error => res.status(500).json({error}))
    
}


exports.delete = (userId, req, res, next) => {
    const convId = req.params.id;
    Conversation.findOne({_id: convId})
    .then(conv => {
        if(!conv)
            return res.status(400).json({error: 'Conversation does not exist'})
        if(conv.owner === userId) {
            conv.messages.forEach(element => {
                Message.findOneAndDelete({_id: element}, (err, foc) => {
                    if(err) {
                        return res.status(400).json({error: 'Unable to delete messages'})
                    }
                })
            })
            conv.remove
            .then(() => {
                res.status(201).json({message: 'Conversation successfully deleted'})
            })
            .catch(error => res.status(400).json({ error: "Suppression ineffective de la conversation" }));
        }
        res.status(400).json({message: 'Cette conversation ne vous appartient pas'})
    })
    .catch(error => res.status(500).json({error}))
}

exports.addMessage = (userId, req, res, next) => {
    const convId = req.body.conv;
    const content = req.body.content;
    Conversation.findOne({_id: convId})
    .then(conv => {
        if(!conv.users.some(element => element.equals(userId))) 
            return res.status(400).json({error: 'Adding message in a non owned conversation'})
        const m = new Message({owner: userId, content})
        m.save()
        .then(msg => {
            if(!msg)
                return res.status(400).json({error: 'Message not added'})
            else {
                conv.messages.push(msg);
                conv.save()
                .then(conv => {
                    if(!conv)
                        return res.status(400).json({error: 'Conversation not added'})
                    res.status(201).json({message: 'Successfully created'})
                })
                .catch(error => res.status(500).json({error}))
            }
            return res.status(201).json({message: 'Successfully added'})
        })
        // return res.status(201).json({data: conv});
    })
    .catch(error => res.status(500).json({error}))
}

exports.get = (userId, req, res, next) => {
    const convId = req.body.convId;
    Conversation.findOne({_id: convId})
    .then(conv => {
        return res.status(201).json({data: conv});
    })
    .catch(error => res.status(500).json({error}))
}

exports.getAll = (userId, req, res, next) => {
    Conversation.find({$or: [{owner: userId}, {members: userId}]})
    .then(conv => {
        return res.status(201).json({data: conv});
    })
    .catch(error => res.status(500).json({error}))
}