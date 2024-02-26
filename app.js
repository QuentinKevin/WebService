const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const { Sequelize, DataTypes, Model } = require('sequelize');

app.use(bodyParser.json());

// Connexion à la base de données
const sequelize = new Sequelize('sabergrou_webservice', 'sabergrou', 'WebS3rvice', {
    host: 'mysql-sabergrou.alwaysdata.net',
    dialect: 'mysql',
});

//--------Movie-MODELS--------

class Movie extends Model {}

Movie.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING
    },
    date_creation: {
        type: DataTypes.DATE
    },
    note: {
        type: DataTypes.INTEGER
    },
    category: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    modelName: 'Movie',
    tableName: 'movies'
});

//--------USERS-MODELS--------

class Users extends Model {}

Users.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Users',
    tableName: 'users'
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

// Récupération d'un film par ID
app.get('/movies/:id', async (req, res) => {

    let movies = await Movie.findAll();

    const movieId = parseInt(req.params.id);
    const movie = movies.find((m) => m.id === movieId);

    if (movie) {
        res.json(movie);
    } else {
        res.status(404).json({ message: 'Movie not found' });
    }
});

// Modification d'un film par ID
app.put('/movies/:id', async (req, res) => {

    let movies = await Movie.findAll();

    const movieId = parseInt(req.params.id);
    const index = movies.findIndex((m) => m.id === movieId);

    if (index !== -1) {
        movies[index] = { ...movies[index], ...req.body };
        res.json({ message: 'Movie updated successfully' });
    } else {
        res.status(404).json({ message: 'Movie not found' });
    }
});

// Création d'un nouveau film
app.post('/movies', async (req, res) => {
    let movies = await Movie.findAll();

    const newMovie = req.body;
    newMovie.id = movies.length + 1;
    movies.push(newMovie);
    res.status(201).json({ message: 'Movie created successfully' });
});

// Suppression d'un film par ID
app.delete('/movies/:id', async (req, res) => {

    let movies = await Movie.findAll();
    const movieId = parseInt(req.params.id);
    movies = movies.filter((m) => m.id !== movieId);
    res.json({ message: 'Movie deleted successfully' });
});

// Gestion des erreurs de validation
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        res.status(422).json({ message: 'Validation error' });
    }
});

// Récuperation des films par catégories
app.get('/movies/category/:category', async (req, res) => {
    const category = req.params.category;

    try {
        const movies = await Movie.findAll({
            where: {
                category: category,
            },
        });

        if (movies.length > 0) {
            res.json(movies);
        } else {
            res.status(404).json({ message: 'No movies found in the specified category' });
        }
    } catch (error) {
        console.error('Error fetching movies by category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Récupération des films par Nom
app.get('/movies/namesearch/:name', async (req, res) => {
    const nameQuery = req.params.name;

    if (!nameQuery) {
        return res.status(400).json({ message: 'Name parameter is required for search' });
    }

    try {
        const movies = await Movie.findAll({
            where: {
                name: {
                    [Sequelize.Op.like]: `%${nameQuery}%`,
                },
            },
        });

        if (movies.length > 0) {
            res.json(movies);
        } else {
            res.status(404).json({ message: 'No movies found with the specified name' });
        }
    } catch (error) {
        console.error('Error fetching movies by name:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Récupération des films par description
app.get('/movies/descsearch/:description', async (req, res) => {
    const descriptionQuery = req.params.description;

    if (!descriptionQuery) {
        return res.status(400).json({ message: 'Description parameter is required for search' });
    }

    try {
        const movies = await Movie.findAll({
            where: {
                description: {
                    [Sequelize.Op.like]: `%${descriptionQuery}%`,
                },
            },
        });

        if (movies.length > 0) {
            res.json(movies);
        } else {
            res.status(404).json({ message: 'No movies found with the specified name' });
        }
    } catch (error) {
        console.error('Error fetching movies by name:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on localhost:${port}`);
});