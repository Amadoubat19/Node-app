const User = require('../models/user');
const PendingUser = require('../models/pending_user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sendMail = require('../utils/mailer');



exports.register = (req, res, next) => {
  User.findOne({$or: [{pseudo: req.body.pseudo}, {email: req.body.email}]})
    .then(uname => {
      if (uname !== null) {
        return res.status(401).json({ error: 'Utilisateur existe dejà !' });
      }
      PendingUser.findOne({$or: [{pseudo: req.body.pseudo}, {email: req.body.email}]})
      .then(puname => {
        if(puname !== null) {
          return res.status(401).json({ error: 'Une demande est deja faite pour cet utilisateur !' });
        }
        const user = {...req.body}
        token = jwt.sign(
          {pseudo : user.pseudo},
          process.env.SECRET,
          { expiresIn: '1h' }
        );
        const pending_user = new PendingUser({...req.body, accepted: false, validation_code: Math.floor(Math.random() * 100000), token: token, imageUrl: `${req.protocol}://${req.get('host')}/images/defaultImage.png`});
        pending_user.save()
        .then(() => console.log('pending created'))
        .catch(error => res.status(400).json({ error }));
        const mailOptions = {
          html: '<p><span>Bonjour</span> Monsieur Barry</p>\
                <p>Une personne a fait une demande d\'accès pour inscription à votre site</p>\
                <p>Nom: '+user.nom+'<br/>Prenom: '+user.prenom+'<br/>Email: '+user.email+'</p>\
                <form action="http://localhost:4000/auth/accept_user" method="post">\
                  <input type="hidden" name="email" id="email" value='+req.body.email+'>\
                  <button type="submit" >Valider l\'inscription</button>\
                </form>',
          to: req.body.email //'barrygims@gmail.com'
        }
        const func = (error, info) => {
          if (error) {
            res.status(400).json({ error });
          } else {
            res.status(200).json({message: 'Mail sent'});
          }
        };
        sendMail(mailOptions, func);
          })
      .catch(error => res.status(500).json({ error }));
      }
  )
  .catch(error => res.status(500).json({ error }));
}

exports.accept_user = (userId, req, res, next) => {
  const mail = req.body.email;
  PendingUser.findOne({email: mail})
    .then(uname => {
      if (!uname || uname.accepted) {
        return res.status(401).json({ error: 'Utilisateur pas en attente !' });
      }
      const mailOptions = {
        html: '<p><span>Bonjour</span></p>\
              <p>Votre demande d\'acces a bien été validée par nos équipes, vous pouvez vous activer votre compte</p>\
              <p>Attention ces informations sont valides une heure</p>\
              <p>Token: '+uname.token+'<br/>Secret code: '+uname.validation_code+'<br/></p>\
              <a href="http://localhost:3000/validate">Valider</a>',
        to: mail
      }
      uname.accepted = true;
      uname.save()
      .then(() => console.log('user accepted'))
      .catch(error => res.status(400).json({ error }));
      const func = (error, info) => {
        if (error) {
          console.log("err",error)
          res.status(400).json({ error });
        } else {
          res.status(200).json({message: 'Mail sent'});
        }
      };
      sendMail(mailOptions, func);
    })
    .catch(error => { console.log(error); res.status(500).json({ error })});
}

exports.validate = (req, res, next) => {
  jwt.verify(req.body.token, process.env.SECRET, function (error, decoded) {
    if(error) {
      PendingUser.findOneAndDelete({pseudo: jwt.decode(req.body.token, process.env.SECRET).pseudo})
      .then((data) => res.status(401).json({ error: 'Données incorrectes, votre token ou votre code d\'autorization ont expirés, veuillez soumettre une nouvelle demande d\'inscription !' }))
      .catch((error) => console.log("user not in the doc"));
    } else {
      const pseudo = decoded.pseudo;
      const validation_code = parseInt(req.body.code, 10);
      PendingUser.findOne({pseudo: pseudo})
      .then(user_info => {
        if (user_info === null || user_info.validation_code !== validation_code || validation_code === NaN) {
          console.log('ici', user_info, user_info.validation_code, validation_code);
          return res.status(401).json({ error: 'Données incorrectes !' });
        }
        bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                nom: user_info.nom,
                prenom: user_info.prenom,
                email: user_info.email,
                pseudo: user_info.pseudo,
                password: hash,
                imageUrl: user_info.imageUrl,
            });
            user.save()
              .then(() => {
                console.log('Utilisateur créé !');
                user_info.remove()
                .then(() => {
                  console.log('Utilisateur supprimé de l\'attente et créé!');
                  res.status(201).json({message: 'user successfully created'})
                })
                .catch(error => res.status(400).json({ error: "Suppression ineffective" }));
              })
              .catch(error => res.status(500).json({ error}));
          })
        .catch(error => { console.log(error); res.status(500).json({ error })});
      })
      .catch(error => { console.log(error); res.status(500).json({ error })});
    }
  });
}


exports.login = (req, res, next) => {
  User.findOne({ pseudo: req.body.pseudo })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            token: jwt.sign(
              { userId: user._id },
              process.env.SECRET,
              { expiresIn: '1h' }
            )  
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.reset_pass = (req, res, next) => {
  const mail = req.body.email;
  User.findOne({email: mail})
  .then( user => {

    if(!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé !' });
    }
    var secret = user.password+'-'+user.updatedAt;
    console.log('secret ==> ', secret)
    const tok = jwt.sign(
      {
        uid: user._id,
      }, secret);
    const mailOptions = {
      html: '<p><span>Bonjour</span></p>\
            <p>Veuillez suivre ce lien pour modifier votre mot de passe, il est valide pendant une heure</p>\
            <a href="http://localhost:4000/auth/change_password/'+tok+'">Changer le mot de passe</a>',
      to: mail
    }
    sendMail(mailOptions, (error, info) => {
      if (error) {
        res.status(400).json({ error });
      } else {
        res.status(200).json({message: 'Mail sent'});
      }
    });
  })
  .catch(error => {console.log('error: ', error);res.status(500).json({ error: 'Utilisateur non reconnu' })})
}

exports.change_pass = (req, res, next) => {
  const token = req.params.token;
  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err) {
      res.status(400).json({message: 'Le jeton que vous avez est invalide'})
    } else {
      User.findOne({_id: decoded.uid})
      .then(user => {
        res.render('../views/change_pass',{token: token});
      })
      .catch(error => res.json(500).json({error: "Utilisateur non reconnu"}))
    }
  });  
}

exports.pass_changed = (req, res, next) => {
  const token = req.body.token;
  const pass = req.body.pass;
  // const cpass = req.body.cpass;
  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err) {
      res.render('../views/pass_changed', {ok: false});
    } else {
      User.findOne({_id: decoded.uid})
      .then(user => {
        bcrypt.hash(pass, 10)
        .then(hash => {
          console.log('old user pass ==>',user.password)
          user.password = hash;
          user.save()
          .then((usy) => {console.log('new user ==>', usy); res.render('../views/pass_changed', {ok: true});})
          .catch(error => res.json(500).json({error}));
        })
        .catch(error => res.json(500).json({error}))
      })
      .catch(error => res.json(500).json({error: "Utilisateur non reconnu"}))
      
    }
  })
}