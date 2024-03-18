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

//--------CINEMA-MODELS--------

class Cinema extends Model {}

Cinema.init({
    uid: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING
    },
}, {
    sequelize,
    modelName: 'Cinema',
    tableName: 'cinemas'
});

//--------ROOM-MODELS--------

class Room extends Model {}

Room.init({
    uid: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING
    },
    seats: {
        type: DataTypes.INTEGER
    },
}, {
    sequelize,
    modelName: 'Room',
    tableName: 'rooms'
});

//--------SCEANCE-MODELS--------

class Sceance extends Model {}

Sceance.init({
    uid: {
        type: DataTypes.STRING
    },
    movie: {
        type: DataTypes.STRING
    },
    date: {
        type: DataTypes.DATE
    },
}, {
    sequelize,
    modelName: 'Sceance',
    tableName: 'sceances'
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

//--------CINEMA-ENDPOINTS--------

app.get('/cinemas', async (req, res) => {
    const cinemas = await Cinema.findAll();
    res.json(cinemas);
});

//--------SERVER-LISTEN--------

app.listen(port, () => {
    console.log(`Server is running on localhost: ${port}`);
});