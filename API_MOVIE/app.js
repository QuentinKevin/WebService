const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3003;
const { Sequelize, DataTypes, Model } = require('sequelize');
const { v4 } = require('uuid');
const uuidv4 = v4;


app.use(bodyParser.json());

// Connexion à la base de données
const sequelize = new Sequelize('sabergrou_webservice', 'sabergrou', 'WebS3rvice', {
    host: 'mysql-sabergrou.alwaysdata.net',
    dialect: 'mysql',
});

//--------Movie-MODELS--------

class Movie extends Model {}

Movie.init({
    uid: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.STRING
    },
    date_creation: {
        type: DataTypes.DATE
    },
    rate: {
        type: DataTypes.INTEGER
    },
    category: {
        type: DataTypes.STRING
    },
    duration: {
        type: DataTypes.INTEGER
    },
    hasReservationAvailable: {
        type: DataTypes.BOOLEAN
    }
}, {
    sequelize,
    modelName: 'Movie',
    tableName: 'movies'
});

//--------MODEL-SYNC--------

// Synchronisation du modèle avec la base de données
sequelize.sync()
    .then(() => {
        console.log('Database and tables synced');
    })
    .catch((err) => {
        console.error('Error syncing database:', err);
    });

//--------MOVIES-ENDPOINTS--------

// Récupération des films
app.get('/movies', async (req, res) => {
    let movies = await Movie.findAll();

    res.status(200).json(movies);
});

// Récupération d'un film par ID
app.get('/movies/:uid', async (req, res) => {

    let movies = await Movie.findAll();

    const movieId = parseInt(req.params.uid);
    const movie = movies.find((m) => m.uid === movieId);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(404).json({ message: 'Le film est inconnu' });
    }
});

// Création d'un nouveau film
app.post('/movies', async (req, res) => {
    let movies = await Movie.findAll();

    if (!req.body.uid || !req.body.name || !req.body.description || !req.body.rate || !req.body.duration) {
        return res.status(422).json({ message: 'All fields are required' });
    }
    const newMovie = req.body;
    newMovie.date_creation = new Date();
    newMovie.hasReservationAvailable = true;
    newMovie.category = 'non défini';
    movies.push(newMovie);
    res.status(201).json(newMovie);
});

// Modification d'un film par ID
app.put('/movies/:uid', async (req, res) => {

    if (!req.params.uid) {
        return res.status(422).json({ message: 'Movie ID is required' });
    }

    let movies = await Movie.findAll();
    const movieId = parseInt(req.params.uid);
    const index = movies.findIndex((m) => m.uid === movieId);

    if (index === -1) {
        return res.status(404).json({ message: 'Movie not found' });
    }

    if (req.body.name) {
        movies[index].name = req.body.name;
    }
    if (req.body.description) {
        movies[index].description = req.body.description;
    }
    if (req.body.rate) {
        movies[index].rate = req.body.rate;
    }
    if (req.body.duration) {
        movies[index].duration = req.body.duration;
    }
    res.status(200).json(movies[index]);
});

// Suppression d'un film par ID
app.delete('/movies/:uid', async (req, res) => {
    if (!req.params.uid) {
        return res.status(404).json({ message: 'Movie ID is required' });
    }

    let movies = await Movie.findAll();
    const movieId = parseInt(req.params.uid);
    movies = movies.filter((m) => m.uid !== movieId);
    res.status(204).json({ message: 'Movie deleted successfully' });
});

//--------SERVER-LISTEN--------

app.listen(port, () => {
    console.log(`Server is running on localhost: ${port}`);
});