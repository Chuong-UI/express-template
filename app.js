const dbConnectionString = 'mongodb://localhost:27017/DemoNodeJS';
const express = require('express');
const path = require('path');
const session = require('express-session');
const errorHandler = require('errorhandler');
const flash = require('express-flash');
const chalk = require('chalk');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const multer = require('multer');
const uploadStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'))
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})
const upload = multer({ storage: uploadStorage })
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);

// app environments
const app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'ssession',
    store: new MongoStore({
        url: dbConnectionString,
        autoReconnect: true,
        ttl: 14 * 24 * 60 * 60,
        autoRemove: 'native'
    })
}));
app.use(flash());
if ('development' == app.get('env')) { }

// global
global.appRoot = path.resolve(__dirname) + '/';

// mongoDB.
mongoose.Promise = global.Promise;
mongoose.connect(dbConnectionString);
mongoose.connection.on('error', () => {
    console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
    process.exit();
});


// controllers
const homeController = require('./controllers/home_controller');
const contactController = require('./controllers/contact_controller');
const uploadController = require('./controllers/upload_controller');

// routes
app.get('/', homeController.index);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);

app.get('/upload', uploadController.getFileUpload);
app.post('/upload', upload.single('myFile'), uploadController.postFileUpload);

// api
const router = express.Router();
const userApiRouter = require('./controllers/api/user_api_controller');

router.get('/', function (req, res) {
    res.json({ status: 'Working' });
});

app.use('/api', router);
app.use('/api/users', userApiRouter);

// error handler
app.use(errorHandler());

// css
app.use(express.static(path.join(__dirname, 'public')));

// start app
app.listen(app.get('port'), () => {
    console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
});

module.exports = app;