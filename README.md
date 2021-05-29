# TeaCup Back-End

## Stack technique

- Node.js 14
- NPM
- PostgreSQL 12
- [Redis 6.2.1](https://redis.io/download)

Ces outils sont nécessaires au bon fonctionnement de l'app, il est nécessaire de les installer avant de continuer.

## Installation

Cloner le repo en local

```bash
git clone <url de ce repo>
```

Puis, dans ce dossier local, installer les dépendances NPM

```bash
npm i
```

Enfin, créer une base de données PostgreSQL et exécuter le fichier de seeding db-generate (`./data/db-generate.js`). 
La génération de la base de données prend quelques secondes à s'exécuter et génère également un utilisateur test qui sera utilisable avec les identifiants suivants :
- email : testeur@testmail.com
- mot de passe : 7357

```bash
createdb <nom de la base>
npm run generate-db
```

Penser à configurer PostgreSQL (ou à fournir les variables d'environnement nécessaires) pour que la commande `createdb` puisse s'exécuter correctement.

## Lancement

_**Attention**_ ! Dans le cas où redis-server ne serait pas lancé par défaut, il est nécessaire d'exécuter la commande suivante dans un terminal à part avant de démarrer le projet : 
```bash
redis-server
```

```bash
npm start
```
