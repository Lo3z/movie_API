const express = require("express"),
    morgan = require('morgan');

const app = express();

let topMovies = [
    {
        title: 'The Dark Knight',
        year: '2008'
    },
    {
        title: 'Inception',
        year: '2010'
    },
    {
        title: 'The Matrix',
        year: '1999'
    },
    {
        title: 'Terminator 2: Judgment Day',
        year: '1991'
    },
    {
        title: 'Back to the Future',
        year: '1985'
    },
    {
        title: 'Spirited Away',
        year: '2001'
    },
    {
        title: 'Whiplash',
        year: '2014'
    },
    {
        title: 'Spider-Man: Across the Spider-Verse',
        year: '2023'
    },
    {
        title: 'Dune',
        year: '2021'
    },
    {
        title: 'Dune: Part Two',
        year: '2024'
    }
];

app.use(morgan('common'));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});

app.get('/secreturl', (req, res) => {
    res.send('This is a secret url with super top-secret content.');
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
})