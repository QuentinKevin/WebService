@echo off

REM Build Docker images
docker build -t webservice-cinema -f API_CINEMA/ .
docker build -t webservice-movie -f API_MOVIE/ .
docker build -t webservice-user -f API_USER/ .
docker build -t webservice-reservation -f API_RESERVATION/ .

REM Launch Docker Compose
docker-compose up