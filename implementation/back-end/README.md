# Spreadsheet Backend

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file at the root folder where you run `npm start`

```
# Template

# Database
DB_HOST=localhost
DB_PORT=27017
DB_NAME=spreadsheet
DB_USER=
DB_PASS=
DB_AUTH_SOURCE=

# Express
HTTP_PORT=3000

# SessionStore
SESSION_DB_NAME=session
SESSION_SECRET=spreadsheet

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

```

## Database

We need to enable the replica set for the database, which need to specify the `replSet` in the `mongod.conf` file.

```yaml
# mongod.conf

replication:
  replSetName: rs0
```

```bash
# Start the database
mongod --config /etc/mongod.conf

# Connect to the database
mongo

# Initiate the replica set
rs.initiate()
```

## Run

```bash
npm start
```
