FROM node:21

# Créer un répertoire d'applications
WORKDIR /API_RESERVATION

# Installer les dépendances de l'application
COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "app.js"]