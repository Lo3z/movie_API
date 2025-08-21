const express = require("express");
const mongoose = require('mongoose');
const Models = require('./models.js');
const {check, validationResult} = require('express-validator');
const morgan = require('morgan');
const cors = require('cors');

const Movies = Models.Movie;
const Users = Models.User;

const app = express();

// mongoose.connect('mongodb://127.0.0.1:27017/myFlixDB');
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true}); 

app.use(cors());

// let allowedOrigins = ['http://localhost:8080', 'https://testsite.com'];
// app.use(cors({
//     origin: (origin, callback) => {
//         if(!origin) return callback(null, true);
//         if(allowedOrigins.indexOf(origin) === -1){
//             let message = 'The CORS policy for this application does not allow access from origin ' + origin;
//             return callback(new Error(message ), false);
//         }
//         return callback(null, true);
//     }
// }));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.use(morgan('common'));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});

// Login endpoint in auth.js

// 1 Return a list of ALL movies to the user
app.get('/movies', passport.authenticate('jwt', {session:false}), async (req, res) => {
    await Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


// 2 Return data about a single movie by title to the user
app.get('/movies/:Title', passport.authenticate('jwt', {session:false}), async (req, res) => {
    await Movies.findOne({Title: req.params.Title})
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// 3 Return data about a genre by name
app.get('/genres/:genreName', passport.authenticate('jwt', {session:false}), async (req, res) => {
    await Movies.findOne({'Genre.Name': req.params.genreName})
    .then((movie) => {
        res.json(movie.Genre);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// 4 Return data about a director by name
app.get('/directors/:directorName', passport.authenticate('jwt', {session:false}), async (req, res) => {
    await Movies.findOne({'Director.Name': req.params.directorName})
    .then((movie) => {
        res.json(movie.Director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// 5 Allow new users to register
app.post('/users',
    [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alphanumberic characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], async (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        let hashedPassword = Users.hashPassword(req.body.Password);
        await Users.findOne({Username: req.body.Username})
            .then((user) => {
                if (user) {
                    return res.status(400).send(req.body.Username + 'already exists');
                } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: hashedPassword,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) =>{res.status(201).json(user) })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    });
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
        });

// 5.1 Get all users
app.get('/users', passport.authenticate('jwt', {session:false}), async (req, res) => {
    await Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// 5.2 Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', {session:false}), async (req, res) => {
    await Users.findOne({Username: req.params.Username})
    .then((user) => {
        res.json(user);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// 6 Allow users to update their username
app.put('/users/:Username',
    [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alphanumberic characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], passport.authenticate('jwt', {session: false}), async (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        let hashedPassword = Users.hashPassword(req.body.Password);
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate({Username: req.params.Username}, {$set:
        {
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
    {new: true})
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    })
});

// 7 Allow users to add a movie to their list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session:false}), async (req, res) => {
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate({Username: req.params.Username}, {
        $push: {Favorites: req.params.MovieID}
    },
    {new: true})
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// 8 Allow users to remove a movie from their list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session:false}), async (req, res) => {
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate({Username: req.params.Username}, {
        $pull: {Favorites: req.params.MovieID}
    },
    {new: true})
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// 9 Allow existing users to deregister
app.delete('/users/:Username', passport.authenticate('jwt', {session:false}), async (req, res) => {
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission denied');
    }
    await Users.findOneAndDelete({Username: req.params.Username})
        .then((user) => {
            if(!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
})