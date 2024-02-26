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

//--------USERS-ENDPOINTS--------

app.get('/users', (req, res) => {
    const auth = req.header('Authorization');
    const isBasicAuth = auth && auth.startsWith('Basic ');
    if (!isBasicAuth) {
        res.status(401).send('Unauthorized');
        return;
    }
    res.json(Users.findAll());
});

app.get('/renew', (req, res) => {
    const auth = req.header('Authorization');

    const isBasicAuth = auth && auth.startsWith('Basic ');
    if (!isBasicAuth) {
        res.status(401).send('Unauthorized');
        return;
    }

    const decodedValue = JSON.parse(Buffer.from(req.query.token.split('.')[1], 'base64').toString('ascii'));

    const token = jwt.sign(
        {
            sub: decodedValue.sub,
            local_user: decodedValue.local_user,
            local_password: decodedValue.local_password
        },
        'secret',
        {expiresIn: '1 hour'}
    );

    res.json({token});

    res.status(200).send('Renew Successful');

});

app.get('/editor', (req, res) => {
    const auth = req.header('Authorization');
    const isBasicAuth = auth && auth.startsWith('Basic ');
    if (!isBasicAuth) {
        res.status(401).send('Unauthorized');
        return;
    }
    const decodedValue = JSON.parse(Buffer.from(req.query.token.split('.')[1], 'base64').toString('ascii'));
    let valideUser = null;
    for (const user of Users) {
        if (user.local_user === decodedValue.local_user || decodedValue.local_user === 'admin') {
            valideUser = user;
        }
    }
    if (valideUser != null) {
        if (req.query.user !== undefined){
            for (const user of Users) {
                if (user.local_user === decodedValue.local_user) {
                    user.local_user = req.query.user;
                    Users.forEach(function (item, index) {
                        fs.writeFile('users.json', JSON.stringify(Users), function (err) {
                            if (err) return console.log(err);
                        });
                    });
                }
            }
        }
        if (req.query.password !== undefined) {
            for (const user of Users) {
                if (user.local_user === decodedValue.local_user) {
                    user.local_password = Crypto.createHash('SHA256').update(req.query.password).digest('hex');
                    Users.forEach(function (item, index) {
                        fs.writeFile('users.json', JSON.stringify(Users), function (err) {
                            if (err) return console.log(err);
                        });
                    });
                }
            }
        }
        res.status(200).send('Access Granted');
    } else {
        res.status(401).send('Unauthorized');
    }
});

//--------SERVER-LISTEN--------

app.listen(port, () => {
    console.log(`Server is running on localhost:${port}`);
});