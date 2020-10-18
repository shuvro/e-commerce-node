const express = require('express');
const handlebars = require('handlebars')
const exphbs = require('express-handlebars');
const routers = require('./routers/index');
const KYCRouters = require('./routers/kyc');
const KYCDemoRoutes = require('./routers/kyc-demo');
const KYBRouters = require('./routers/kyb');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const redis = require("redis");
// const fileUpload = require('express-fileupload');
const handlebarsHelpers = require('./helpers');
const csrf = require('csurf')
const database = require('./config/database');
const session = require('express-session')
const mongodb = require('./config/mongoserver')
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const serverDefinitions = require('./config/server');
var morgan = require('morgan')
const {check, validationResult} = require('express-validator');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')


// var AWS = require('aws-sdk');
// AWS.config.loadFromPath('./config/awsConfig.json');
// var sns = new AWS.SNS();
// var SNS_TOPIC_ARN = "arn:aws:sns:us-east-1:524724245848:pin-setup";
// var cookieParser = require('cookie-parser');

var ENV = process.argv[2];
var port = 4515;
if (!ENV) {
    ENV = 'dev';
}

var client = redis.createClient();
client.on('error', function (err) {
    console.log('Something went wrong ', err)
});
// client.set('my test key', {test:"message",test1:"message1"}, redis.print);
// client.get('my test key', function(error, result) {
//   if (error) throw error;
//   console.log('GET result ->', result)
// });

// console.log('SNS_TOPIC_ARN',SNS_TOPIC_ARN)

// sns.subscribe({
//       Protocol: 'sms',
//       TopicArn: SNS_TOPIC_ARN,
//       Endpoint: '+506 71765072' // type mobile number to whom you want to send a message.
//     }, function(error, data) {
//       console.log("error when subscribe", error);
//       if (error) {
//         console.log("error when subscribe", error);
//       }
//       console.log("subscribe data", data);
//       var SubscriptionArn = data.SubscriptionArn;
//       var params = {
//           TargetArn: SNS_TOPIC_ARN,
//           Message: 'your pin number is: 7777',//type your message
//           Subject: 'New pin number' //type your subject
//       };
//     sns.publish(params, function(err_publish, data) {
//         if (err_publish) {
//             console.log('Error sending a message', err_publish);
//         } else {
//             console.log('Sent message:', data.MessageId);
//         }
//         var params = {
//             SubscriptionArn: SubscriptionArn
//         };

//         //unsubscribing the topic
//         sns.unsubscribe(params, function(err, data) {
//             if (err) {
//                 console.log("err when unsubscribe", err);
//             }
//         });
//       });
//   });


//Set port according to ENV


var __basedir = __dirname;
// setup route middlewares
var csrfProtection = csrf({cookie: true})

const app = express();

global.ENV = ENV;
global.app__basedir = __basedir;

console.log('ENV', ENV)

// parse cookies
// we need this because "cookie" is true in csrfProtection
// app.use(cookieParser())
app.use(cookieParser(serverDefinitions.server.secret));
app.use(bodyParser.json({limit: '150mb'})); // <--- Here   // remove this if not necessary....
app.use(bodyParser.urlencoded({extended: true, limit: '150mb'}));

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    helpers: handlebarsHelpers(exphbs),
    handlebars: allowInsecurePrototypeAccess(handlebars)
}));
app.set('view engine', 'handlebars');

app.use(express.static('public'));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(morgan('combined'))


app.use(flash());
//use sessions for tracking logins
app.use(session({
    cookie: {maxAge: (24 * 3600 * 1000 * 30)},
    secret: 'carisR0kZ',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongodb})
}));

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});


app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)

    // handle CSRF token errors here
    res.status(403)
    res.send('form tampered with')
})

KYCRouters(app, csrfProtection, __basedir);
KYCDemoRoutes(app, csrfProtection, __basedir);
KYBRouters(app, csrfProtection, __basedir);
routers(app, csrfProtection, __basedir);


app.listen(port);
console.log('port listening: ' + port);
