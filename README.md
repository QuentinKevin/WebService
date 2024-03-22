Pour installer l'application : \n
  executé les 4 dockerfile avec les commandes suivantes : \n
    API_CINEMA :\n
      docker build -t webservice-cinema .
    API_MOVIE :\n
      docker build -t webservice-movie .
    API_RESERVATION :\n
      docker build -t webservice-reservation .
    API_USER :\n
      docker build -t webservice-user .

    Enfin executer à la racine :\n
      docker compose up -d
