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
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    uid: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    modelName: 'Cinema',
    tableName: 'cinemas'
});

//--------ROOM-MODELS--------

class Room extends Model {}

Room.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    uid: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING
    },
    seats: {
        type: DataTypes.INTEGER
    },
    cinema: {
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
    room: {
        type: DataTypes.INTEGER
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

app.get('/cinema', async (req, res) => {
    const cinemas = await Cinema.findAll();
    res.status(200).json(cinemas);
});

app.get('/cinema/:uid', async (req, res) => {
    if (req.params.uid != null) {
        const cinema = await Cinema.findOne({
            where: {
                uid: req.params.uid
            }
        });
        if (cinema != null) {
            res.status(200).json(cinema);
        } else {
            res.status(404).send('Le cinéma est inconnu');
        }
    } else {
        res.status(422).send('Le contenu de l\'object cinema dans le body est invalide');
    }
});

app.post('/cinema', async (req, res) => {
    if (req.query.name) {
        Cinema.create({
            uid: uuidv4(),
            name: req.query.name
        });        
    }
    let cinema;
    if (req.query.uid) {
        cinema = Cinema.findOne({
            where: {
                name: req.query.name
            }
        });
        cinema.uid = req.query.uid;
    }
    if (cinema != null) {
        res.status(201).json(cinema);
    } else {
        res.status(422).send("Le contenu de l'object cinema dans le body est invalide");
    }
});

app.put('/cinema/:uid', async (req, res) => {
    if(req.query.name && req.query.uid) {
        let cinema = await Cinema.findOne({
            where: {
                uid: req.params.uid
            }
        });
        cinema.name = req.query.name;
        cinema.save();
    }
    if(cinema != null) {
        res.status(200).json(cinema);
    }
    else {
        res.status(404).send('Le cinéma est inconnu');
    }
});

app.delete('/cinema/:uid', async (req, res) => {
    if(req.query.uid) {
        let cinema = await Cinema.findOne({
            where: {
                uid: req.params.uid
            }
        });
        cinema.destroy();
    }
    if(cinema == null) {
        res.status(204).json(cinema);
    } else {
        res.status(404).send('Le cinéma est inconnu');
    }
});

app.get('/cinema/:uid/rooms', async (req, res) => {
    const cinema = await Cinema.findOne({
        where: {
            uid: req.params.uid
        }
    });
    const rooms = await Room.findAll({
        where: {
            cinema: cinema.id
        }
    });
    res.json(rooms);
});

app.get('/cinema/:uid/rooms/:uidd', async (req, res) => {
    const room = await Room.findOne({
        where: {
            uid: req.params.uidd
        }
    });
    res.json(room);
});

app.post('/cinema/:uid/rooms', async (req, res) => {
    if (req.query.name && req.query.uid && req.query.seats) {
        let cinema = await Cinema.findOne({
            where: {
                uid: req.params.uid
            }
        });
        let room = Room.create({
            uid: req.query.uid,
            name: req.query.name,
            seats: req.query.seats,
            cinema: cinema.id
        });
        res.json(room);
    }
    else {
        res.send('Error');
    }
});

app.put('/cinema/:uid/rooms/:uidd', async (req, res) => {
    let room = await Room.findOne({
        where: {
            uid: req.params.uidd
        }
    });
    if(req.query.uid)
        room.uid = req.query.uid;
    if(req.query.name)
        room.name = req.query.name;
    if(req.query.seats)
        room.seats = req.query.seats;
    if(req.query.cinema)
        room.cinema = req.query.cinema;
    res.json(room);
});

app.delete('/cinema/:uid/rooms/:uidd', async (req, res) => {
    let room = await Room.findOne({
        where: {
            uid: req.params.uidd
        }
    });
    room.destroy();
    res.json(room);
});

app.get('/cinema/:uid/rooms/:uidd/sceances', async (req, res) => {
    const room = await Room.findOne({
        where: {
            uid: req.params.uidd
        }
    });
    const sceances = await Sceance.findAll({
        where: {
            room: room.id
        }
    });
    res.json(sceances);
});

app.post('/cinema/:uid/rooms/:uidd/sceances', async (req, res) => {
    const room = await Room.findOne({
        where: {
            uid: req.params.uidd
        }
    });
    let sceance
    if (req.query.movie && req.query.date) {
        sceance = Sceance.create({
            uid: uuidv4(),
            movie: req.query.movie,
            date: req.query.date,
            room: room.id
        });
    }
    res.json(sceance);
});

app.put('/cinema/:uid/rooms/:uidd/sceances/:uid', async (req, res) => {
    let sceance = await Sceance.findOne({
        where: {
            uid: req.params.uid
        }
    });
    if(req.query.movie)
        sceance.movie = req.query.movie;
    if(req.query.date)
        sceance.date = req.query.date;
    if(req.query.room)
        sceance.room = req.query.room;
    res.json(sceance);
});

app.delete('/cinema/:uid/rooms/:uidd/sceances/:uid', async (req, res) => {
    let sceance = await Sceance.findOne({
        where: {
            uid: req.params.uid
        }
    });
    sceance.destroy();
    res.json(sceance);
});

//--------SERVER-LISTEN--------

app.listen(port, () => {
    console.log(`Server is running on localhost: ${port}`);
});