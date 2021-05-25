var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Wallet = require('../models/wallet')
var jwt = require('jsonwebtoken');
const MongoClient = require('mongodb').MongoClient
var decodedToken;
var userDetails;


router.post('/register', function (req, res, next) {

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      let errors = {};
      if (user.username === req.body.username) {
        errors.username = "User Name already exists";
      } else {
        errors.email = "Email already exists";
      }
      return res.status(400).json({ message: 'Email already exists' });
    } else {
      var user = new User({
        email: req.body.email,
        username: req.body.username,
        password: User.hashPassword(req.body.password),
        creation_dt: new Date()
      });
      var wallet = new Wallet(
        {
          username: req.body.username,
          TotalMoney: 0,
          TransactionsNotes: [],
          creation_dt: new Date()
        }
      )
      let promise = user.save();
      promise = wallet.save();

      return res.status(201).json({ message: 'sucessfull' });
    }
  })
    .catch(err => {
      return res.status(500).json({
        error: err
      });
    });


  // var user=new User({
  //   email:req.body.email,
  //   username:req.body.username,
  //   password:User.hashPassword(req.body.password),
  //   creation_dt:Date.now()
  // });
  // var wallet=new Wallet(
  //   {
  //     username:req.body.username,
  //     TotalMoney:0,
  //     creation_dt:Date.now()
  //   }
  // )
  // let promise=user.save();
  //   promise=wallet.save();

  // promise.then(function(doc)
  // {
  //   return res.status(201).json(doc);
  // })

  // promise.catch(function(error)
  // {
  //   return res.status(501).json({message:'error in registration'})
  // })
})

router.post('/login', function (req, res, next) {
  let promise = User.findOne({ email: req.body.email }).exec();

  promise.then(function (doc) {
    userDetails = doc;
    if (doc) {
      if (doc.isValid(req.body.password)) {
        //genrate token
        let token = jwt.sign({ username: doc.username }, 'secret', { expiresIn: '5h' });
        console.log("genrate token", token);
        return res.status(200).json(token);
      }
      else {
        return res.status(501).json({ message: 'email or password is incorrect' });
      }
    } 
    else {
      return res.status(501).json({ message: 'user email not found' });
    }
  })

  promise.catch(function (error) {
    return res.status(501).json({ message: 'error' });
  })

});

router.get('/username', verifyToken, function (req, res, next) {
  return res.status(200).json(decodedToken.username);
});

function verifyToken(req, res, next) {
  const token = req.body.token || req.query.token || req.headers["Authorization"];
  console.log("topken", token);
  console.log("", req.body.token);
  console.log(req.query.token);
  console.log(req.headers["Authorization"]);
  // let token = req.query.token;
  jwt.verify(token, 'secret', function (err, tokendata) {
    if (err) {
      console.log("err", err);
      return res.status(400).json({ message: 'unathourised req' });
    }
    if (tokendata) {
      console.log("token", tokendata);
      decodedToken = tokendata;
      Wallet.findOne({ username: tokendata.username }).then(wallet => {
        console.log("money", wallet);
      })

      // Wallet.findOne({ username: tokendata.username}, function(err, result) {
      //   if (err) throw err;
      //   console.log("result",result);
      // });

      next();
    }
  })
}
router.get('/walletmoney', function (req, res, next) {

  Wallet.findOne({ username: decodedToken.username }, function (err, result) {
    if (err) {
      return res.status(400).json({ message: 'unathourised req' });
    }
    else {
      console.log("result wallete", result);
      return res.status(200).json(result.TotalMoney);
    }
  });
  // return res.status(200).json(userDetails.username);
});

 

router.get('/getTransactions', function (req, res, next) {

  console.log("token get",decodedToken);
  Wallet.findOne({ username: decodedToken.username }, function (err, result) {
    if (err) {
      return res.status(400).json({ message: 'unathourised req' });
    }
    else {
      console.log("resulttrana", result);
      return res.status(200).json(result.TransactionsNotes);
    }
  });
  // return res.status(200).json(userDetails.username);
});


router.post('/addTransactions', function (req, res, next) {

  let UserName=req.body.name;
  console.log("data", req.body);
  let preMoney=parseInt(req.body.preMoney);
    // var preMoney=res[0].TotalMoney+parseInt(req.body.amount);
    // console.log("preMoney",preMoney);
    // res[0].TotalMoney=preMoney;
    
        Wallet.updateOne({username:UserName},
            {
              TotalMoney:preMoney
            },(err,res)=>
            {
              if(err)
              {
                console.log("err res",err);
              }
              else
              {
              console.log("add res",res);
              }
            })

    
  // const newname={name:'vishnu'};
  Wallet.findOneAndUpdate({username:UserName},
    {
      $addToSet:
      {
        TransactionsNotes: req.body,
      },
      
    },(err,res)=>
    {
      console.log("fin res",res);
    })
    
  // Wallet.collection("wallets").find( function(err, res) {
  //   if (err) throw err;
  //   console.log("1 document inserted",res);
  // });
});
module.exports = router;
