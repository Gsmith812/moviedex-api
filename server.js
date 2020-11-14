require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const MOVIES = require('./movies-data-small.json');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken (req, res, next) {
    const authToken = req.get('Authorization');
    const apiToken = process.env.API_TOKEN;
    console.log(apiToken, authToken.split(' ')[1]);
    if(!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' });
    }
    next();
})

function handleGetMovies(req, res) {
    const { genre, country, avg_vote } = req.query;
    let response = MOVIES;
    if(genre) {
        response = response.filter(movie => 
            movie.genre.toLowerCase().includes(genre.toLowerCase())
        );
    }
    if(country) {
        response = response.filter(movie => 
            movie.country.toLowerCase().includes(country.toLowerCase())    
        );
    }
    if(avg_vote) {
        const parsedAvgVote = parseFloat(avg_vote);
        if(isNaN(parsedAvgVote)){
            response = {error: 'avg_vote must be a number'};
        }
        else {
            response = response.filter(movie =>
            movie.avg_vote >= parsedAvgVote
        );
        }
    }
    return res.json(response);
}

app.get('/movie', handleGetMovies);

const PORT = 8000;

app.listen(PORT, () => {
console.log(`Server listening on PORT ${PORT}`);
});
