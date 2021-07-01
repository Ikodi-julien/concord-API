# How to create, backup and restore the database

## Create a user if none exists

```bash
postgres# CREATE USER <dbuser> WITH ENCRYPTED PASSWORD 'password';
```

## Create database

```bash
postgres# CREATE DATABASE <dbname> OWNER <dbuser>;
```

## Connect to postgres user and psql in one command line

```bash
sudo -i -u postgres psql
```
-i    run shell as root
-u    run the command as the following user (postgres)
psql  PostgreSQL interactive terminal

## Backup the database

```bash
postgres# \! pg_dump -U postgres -W -d <dbname> > /var/www/html/concord/socket-chat-api/data/20210629_backup_<dbname>.sql;
```
-U  Specify username to connect to DB
-W  Force prompt for password
-d  Specify dbname to connect to

## Restore the backup, create DB before if needed

Restore backup
```bash
postgres# \! pg_dump -U postgres -W -d <dbname> -f > /var/www/html/concord/socket-chat-api/data/20210629_backup_<dbname>.sql;
```
-f  read command from the given file