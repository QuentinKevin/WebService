const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { Sequelize, DataTypes, Model } = require('sequelize');

const app = express();
const port = 3002;
const amqp = require('amqplib');

app.use(bodyParser.json());

// Connexion à RabbitMQ
const rabbitMQUrl = 'amqp://localhost';

// Connexion à la base de données
const sequelize = new Sequelize('sabergrou_webservice', 'sabergrou', 'WebS3rvice', {
    host: 'mysql-sabergrou.alwaysdata.net',
    dialect: 'mysql',
});

// Définition du modèle de réservation
class Reservation extends Model {}

Reservation.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    movieId: {
        type: DataTypes.INTEGER
    },
    customerName: {
        type: DataTypes.STRING
    },
    reservationDate: {
        type: DataTypes.DATE
    }
}, {
    sequelize,
    modelName: 'Reservation',
    tableName: 'reservations'
});

// Endpoint pour créer une réservation
app.post('/movies/:id/reservations', async (req, res) => {
    const movieId = req.params.id;
    const reservationData = req.body;

    try {
        // Vérification si le film existe dans l'API de films
        const response = await axios.get(`http://localhost:3000/movies/${movieId}`);
        if (response.status === 200) {
            // Enregistrement de la réservation dans la base de données
            const reservation = await Reservation.create({
                movieId: movieId,
                customerName: reservationData.customerName,
                reservationDate: new Date()
            });
            console.log("Reservation saved to database:", reservation);
            
            // Envoi de la réservation à RabbitMQ
            await sendReservationToQueue({ movieId, reservationData });

            res.status(201).json({ message: 'Reservation created successfully' });
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        console.error("Error creating reservation:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint pour confirmer une réservation
app.post('/reservations/:uid/confirm', async (req, res) => {
    const reservationUid = req.params.uid;

    try {
        // Recherche de la réservation dans la base de données
        const reservation = await Reservation.findByPk(reservationUid);
        if (reservation) {
            // Mettre à jour le statut de la réservation pour le confirmer
            reservation.confirmed = true;
            await reservation.save();

            console.log("Reservation confirmed:", reservation);
            
            res.status(200).json({ message: 'Reservation confirmed successfully' });
        } else {
            res.status(404).json({ message: 'Reservation not found' });
        }
    } catch (error) {
        console.error("Error confirming reservation:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Fonction pour envoyer la réservation à RabbitMQ
async function sendReservationToQueue(reservation) {
    try {
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const queueName = 'reservation_queue';

        await channel.assertQueue(queueName, { durable: true });

        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(reservation)), { persistent: true });

        console.log("Reservation sent to RabbitMQ:", reservation);

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error("Error sending reservation to RabbitMQ:", error);
    }
}


// Écoute du serveur sur le port spécifié
app.listen(port, () => {
    console.log(`Server is running on localhost:${port}`);
});
