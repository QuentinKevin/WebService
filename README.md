# Pour installer l'application : 
  executé les 4 dockerfile avec les commandes suivantes : 
    1. API_CINEMA :
      - docker build -t webservice-cinema .
    2. API_MOVIE :
      - docker build -t webservice-movie .
    3. API_RESERVATION :
      - docker build -t webservice-reservation .
    4. API_USER :
      - docker build -t webservice-user .

    Enfin executer à la racine :\n
      docker compose up -d
