FROM node:21

# Créer un répertoire d'applications
WORKDIR D:\cour\WebService\WebService\API_USER

# Installer les dépendances de l'application
COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "app.js"]