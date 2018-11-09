const express = require('express')
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser') 
const methodOverride = require('method-override')
const path = require('path')
const redis = require('redis') 

// initiate Express server
require('dotenv').config()
const app = express()
const PORT = process.env.SERVER_PORT || 8888

// body-parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))  

// set template engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// serve static file
app.use(express.static(path.join(__dirname,'public')))

// request info teller
const requestInfoTeller = (req, res, next)=>{ 
  console.log('req method :', req.method)
  console.log('req query :', req.query) 
  console.log('request path: ',req.path)
  next() 
} 


// create redis client 
const redisClient = redis.createClient();
console.log('use redisClient to check redis connection')
global.redisClient = redisClient

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

redisClient.on("connect", function () {
  console.log("redis server is connected");
});

redisClient.on("error", function (err) {
  console.log("Error " + err);
});

app.use('*', requestInfoTeller) 
// override req.method with request's header X-HTTP-Method-Override 
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(methodOverride('_method',{methods:['GET','PUT']}))

app.use('*',requestInfoTeller)

/////////////
// Routing //
/////////////

// function renderHomePage(req, res, next){
//   if(req.error) res.render('searchusers', req.error);
//   res.render('searchusers');
// }

// process request

app.get('/', function (req, res) {
  res.render('home');
});


app.get('/user/search', function (req, res) {
  res.render('searchusers');
});


app.post('/user/search', (req, res, next)=>{
  const {id} = req.body
  // search user with req.id, 
  // if no user found, response 'searchusers' page with error
  // if user found, response with user info ande 'detail' page
  redisClient.hgetall(id,(err, obj)=>{
    if(!obj){
      res.render('searchusers', { error: "user does not exisit" }) 
    }else{
      obj.id = id
      res.render('details',{
        user: obj
      }) 
    }
  }) 
})

app.get('/user/add', function (req, res) {
  res.render('add_user');
});

app.post('/user/add', function (req, res) {
  res.render('home');
});


app.listen(PORT, ()=>{
  console.log(`server is running on ${PORT}`)
}) 
