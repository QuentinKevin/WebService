Pour installer l'application :
  executé les 4 dockerfile avec les commandes suivantes :
    API_CINEMA :
      docker build -t webservice-cinema .
    API_MOVIE :
      docker build -t webservice-movie.$
    API_RESERVATION :
      docker build -t webservice-reservation .
    API_USER
      docker build -t webservice-user .

    Enfin executer à la racine :
      docker compose up -d
