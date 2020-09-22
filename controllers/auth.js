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
          'SECRET_TOKEN',
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
          to: 'barrygims@gmail.com'
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

exports.accept_user = async (req, res, next) => {
  const mail = req.body.email;
  PendingUser.findOne({email: req.body.email})
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
  jwt.verify(req.body.token, 'SECRET_TOKEN', function (error, decoded) {
    if(error) {
      PendingUser.findOneAndDelete({pseudo: jwt.decode(req.body.token, 'SECRET_TOKEN').pseudo})
      .then((data) => console.log("deleted user", data))
      .catch((error) => console.log("user not in the doc"));
      return res.status(401).json({ error: 'Données incorrectes, votre token ou votre code d\'autorization ont expirés, veuillez soumettre une nouvelle demande d\'inscription !' });
    } else {
      const pseudo = decoded.pseudo;
      const validation_code = parseInt(req.body.code, 10);
      PendingUser.findOne({pseudo: pseudo})
      .then(user_info => {
        if (user_info === null || user_info.validation_code !== validation_code || validation_code === NaN) {
          console.log('ici')
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
                .catch(error => res.status(400).json({ error }));
              })
              .catch(error => res.status(400).json({ error }));
          })
        .catch(error => { console.log(error); res.status(500).json({ error })});
      })
      .catch(error => { console.log(error); res.status(500).json({ error })});
    }
  });
}

exports.getPseudo = (req, res, next) => {
  const bearer = req.headers.authorization;
  const uid = jwt.decode(bearer, 'SECRET_TOKEN').uid;
  res.json({uid: uid});
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
            /*userId: user._id,
            pseudo: user.pseudo,
            imageUrl: user.imageUrl,
            nom: user.nom,
            prenom: user.prenom,*/
            token: jwt.sign(
              { userId: user._id },
              'SECRET_TOKEN',
              { expiresIn: '1h' }
            )  
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};