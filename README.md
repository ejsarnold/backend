# App API

## Setup
1. Setup postgres database locally
2. Duplicate .env and update the database params
```
cp .env.example .env
```
3. Install project dependencies
```
yarn install
```
4. Install db-migrate commands globally
```
npm install -g db-migrate
```
5. Run migration
```
db-migrate up
```
6. Setup prisma
```
yarn prisma generate
```
7. Run the project
```
yarn run dev
```

## Swagger
1. Seed the database via App Swagger
2. Try authorize via token

## If Created New Migration
1. Execute it
```
db-migrate up
```
2. Update prisma
```
yarn prisma db pull
yarn prisma generate
```
 
