var mongoose=require('mongoose'),
    bodyParser=require('body-parser'),
    express=require('express'),
    passport=require('passport'),
    app=express();
    
var Strategy = require('passport-twitter').Strategy;

//mongoose.connect("mongodb://localhost/bethere");
var url=process.env.DBURL || "mongodb://localhost/bethere";
mongoose.connect(url);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var Yelp = require('yelp');

var yelp = new Yelp({
  consumer_key: 'etfAvBSllAOZTR1zhf4Zbw',
  consumer_secret: 'BjBuoC9sgahuVlDhHfCe2n_aVsY',
  token: '0_DYGgvr9LYpsO8QpIuoLDv9EGzIl3gD',
  token_secret: 'LaQuJbmVTQT5Dkzbc8Ix0TQ5x9w'
});


//passport twitter stuff
passport.use(new Strategy({
    consumerKey: 'ERaFtCjCmgJ6dXHiiEFDBMHUp',
    consumerSecret: 'dQOVSJgMGavQfs8fhStn74fmtmrnLIFxxRyMmSuxUARvc70qgJ',
    callbackURL: 'https://fierce-sierra-67177.herokuapp.com/auth/twitter/callback'
  },
  function(token, tokenSecret, profile, cb) {
    // In this example, the user's Twitter profile is supplied as the user
    // record.  In a production-quality application, the Twitter profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.use(require('express-session')({ secret: 'this is going to kill me', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());


var GoingSchema = new mongoose.Schema({
  restid: String,
  whoid: String
});

var Going = mongoose.model("Going", GoingSchema);
/*
Going.create({
  restid: "mystic-muffin-toronto",
  whoid: '400684325'
});
Going.create({
  restid: "mystic-muffin-toronto",
  whoid: '406650125'
});
Going.create({
  restid: "corrados-toronto",
  whoid: '400685125'
});
Going.create({
  restid: "under-the-table-restaurant-toronto",
  whoid: '400680125'
});

*/

////routes ////

app.get('/', function(req,res){
      var user=req.user;
      res.render('ang.ejs',{user: user});
});

app.get('/api/results/:city', function(req,res){
var results=[];
var userid;
if(req.user)
 userid=req.user.id;
 else userid=0;
 var city = req.params.city;
   yelp.search({ term: 'food', location: city })
  .then(function (data) {
    var businesses = data.businesses;
    for(var i=0; i<businesses.length; i++){
       businesses[i].userid=userid;
      if(i<businesses.length-1){
          getit(businesses[i],function(err,result){
            var bus=result[result.length-1];
            results.push({'rest_id': bus.id, 'going':result.length-1, 'name': bus.name, 'snippet_text' : bus.snippet_text, 'image_url':bus.image_url, 'isgoing': bus.isgoing});  
          });
      }
      else{
          getit(businesses[i].id,function(err,result){
            var bus=result[result.length-1];
            results.push({'rest_id': bus.id, 'going':result.length-1, 'name': bus.name, 'snippet_text' : bus.snippet_text, 'image_url':bus.image_url, 'isgoing': bus.isgoing});  
            var str = JSON.stringify(results, null, 2); 
          res.end(str);
        });
      }
  }
  });
});

function getit(where,cb){
  var bus={};
  bus.name=where.name;
  bus.snippet_text=where.snippet_text;
  bus.id=where.id;
  bus.image_url=where.image_url;
  var userid=where.userid;
  var isgoing=false;
  Going.distinct('whoid', {'restid' : where.id},function(err,result){
      for(var i=0; i<result.length; i++){
      if(userid==result[i]) isgoing=true;
    }
     bus.isgoing=isgoing;
     result.push(bus);
     success: cb(err,result);
  } 
)};

app.post('/api/booking/:restid/:whoid',function(req,res){
  //res.status(200).send("I got " + req.params.restid + ", " + req.params.whoid);
  Going.create({
      restid: req.params.restid,
      whoid:  req.params.whoid
  },function(err,item){
    if(err)console.log(err);
    else{
      res.sendStatus(200);
    }
  });
});
 
app.delete('/api/booking/:restid/:whoid',function(req,res){
   Going.remove({
      restid: req.params.restid,
      whoid:  req.params.whoid
  },function(err,item){
    if(err)console.log(err);
    else{
      res.sendStatus(200);
    }
  });
});
//twitter auth routes

app.get('/auth/twitter',
        passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect(307, '/');
  });

app.get('/logout', function(req,res){
  req.logout();
  res.redirect('/');
});


//to compile less at command line for this project:
// $ lessc bootstrap/bootstrap.less public/stylesheets/bootstrap.css
//to minify js 
//minify public/sylesheets/bootstrap.css public/stylesheets/bootstrap.min.css

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started");
});