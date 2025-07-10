const express = require("express"),
    morgan = require('morgan');

const app = express();

let movies = [
    {
        title: 'The Dark Knight',
        year: '2008',
        genre: 'Action',
        director: 'Christopher Nolan'
    },
    {
        title: 'Inception',
        year: '2010',
        genre: 'Action',
        director: 'Christopher Nolan'

    },
    {
        title: 'The Matrix',
        year: '1999',
        genre: 'Science Fiction',
        director: 'Lana Wachowski'
    },
    {
        title: 'Terminator 2: Judgment Day',
        year: '1991',
        genre: 'Action',
        director: 'James Cameron'
    },
    {
        title: 'Back to the Future',
        year: '1985',
        genre: 'Comedy',
        director: 'Robert Zemeckis'
    },
    {
        title: 'Spirited Away',
        year: '2001',
        genre: 'Fantasy',
        director: 'Hayao Miyazaki'
    },
    {
        title: 'Whiplash',
        year: '2014',
        genre: 'Music',
        director: 'Damien Chazelle'
    },
    {
        title: 'Spider-Man: Across the Spider-Verse',
        year: '2023',
        genre: 'Action',
        director: 'Joaquim Dos Santos'
    },
    {
        title: 'Dune',
        year: '2021',
        genre: 'Action',
        director: 'Christopher Nolan'
    },
    {
        title: 'Dune: Part Two',
        year: '2024',
        genre: 'Action',
        director: 'Christopher Nolan'
    }
];

app.use(morgan('common'));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});

// 1 Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
    res.json(movies);
    // res.send('Sucessful GET request returning data on top movies.');
});

// 2 Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
app.get('/movies/:title', (req, res) => {
    res.json(movies.find((movie) => 
    {return movie.title === req.params.title}));
    // res.send('Sucessful GET request returning data on single movie by title.');
});

// 3 Return data about a genre by name
app.get('/genres/:name', (req, res) => {
    res.send('Sucessful GET request returning data about a single genre by name.');
});

// 4 Return data about a director by name
app.get('/directors/:name', (req, res) => {
    res.send('Sucessful GET request returning data on single directorby name.');
});

// 5 Allow new users to register
app.post('/users', (req, res) => {
    res.send('Sucessful POST request allowing new user to register.');
});

// 6 Allow users to update their username
app.put('/users/:username', (req, res) => {
    res.send('Sucessful PUT request allowing user to update their username');
});

// 7 Allow users to add a movie to their list of favorites (showing only a text that a movie has been added)
app.post('/users/:username/favorites/:movie', (req, res) => {
    res.send('Sucessful POST request allowing user to add movie to favorites.');
});

// 8 Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed)
app.delete('/users/:username/favorites/:movie', (req, res) => {
    res.send('Sucessful DELETE request allowing user to remove movie from favorites.');
});

// 9 Allow existing users to deregister (showing only a text that a user email has been removed)
app.delete('/users/:username', (req, res) => {
    res.send('Sucessful DELETE request allowing user to deregister.')
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
})