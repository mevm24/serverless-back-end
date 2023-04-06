# Table of Contents

1. [First Time Environment Setup](#first-time-environment-setup)
2. [Running the Application Locally](#running-the-application-locally)
3. [Running Unit Tests](#running-unit-tests)

## First Time Environment Setup

1. [Install NodeJS](https://nodejs.org/en/download/) version 16.13.1 or higher
2. [Install Docker](https://docs.docker.com/get-docker/)
3. [Setup Local DynamoDB](#local-dynamodb-setup)
4. [Operations Creations](#operations-creations)
5. [Setup Environment Variables](#environment-variables-setup)
6. [Install Project Dependencies](#project-dependencies-installation)

### Local DynamoDB Setup

To run the application locally, you need local DynamoDB available under http://localhost:8000

We use Docker to run DynamoDB locally. Please make sure that Docker is running before proceeding.
dynamodb-admin --port 8002
In the main folder the project and execute the following command:

```bash
$ docker-compose up -d dynamodb
```

Alternatively, you can start DynamoDB using a single command:

```bash
$ docker-compose up -d
```

After DynamoDB container is up, you can check that DynamoDB is running by opening the shell: http://localhost:8000/shell/

Install `dynamodb-admin` UI for easier interactions with local DynamoDB:

```bash
$ npm install -g dynamodb-admin
$ dynamodb-admin # starts dynamodb-admin under http://localhost:8001/
$  # starts dynamodb-admin under http://localhost:8002/
```

To finish the setup you need to create tables using the `dynamodb-admin` UI:

Create the `serverless-backend-app-user`:

1. Open dynamodb-admin UI.
2. Press the "Create table" button.
3. Enter the "serverless-backend-app-user" value for the "Table Name" text field.
4. Enter the "id" value for the "Hash Attribute Name" text field. Select the "String" value for the "Hash Attribute Type" dropdown.
5. Enter the "username" value for the "Range Attribute Name (Optional)" text field. Select the "String" value for the "Range Attribute Type" dropdown.
6. Press the "New Secondary Index" button.
7. Enter the "usernameIndex" value for the "Index Name" text field. Select the "Global Secondary Index (GSI)" value for the "Index Type" dropdown.
8. Enter the "username" value for the "Hash Attribute Name" text field. Select the "String" value for the "Hash Attribute Type" dropdown.
9. Press the "Submit" button.

Create the `serverless-backend-app-record`:

1. Open dynamodb-admin UI.
2. Press the "Create table" button.
3. Enter the "serverless-backend-app-record" value for the "Table Name" text field.
4. Enter the "id" value for the "Hash Attribute Name" text field. Select the "String" value for the "Hash Attribute Type" dropdown.
5. Enter the "createdAt" value for the "Range Attribute Name (Optional)" text field. Select the "String" value for the "Range Attribute Type" dropdown.
6. Press the "New Secondary Index" button.
7. Enter the "userIndex" value for the "Index Name" text field. Select the "Global Secondary Index (GSI)" value for the "Index Type" dropdown.
8. Enter the "user_id" value for the "Hash Attribute Name" text field. Select the "String" value for the "Hash Attribute Type" dropdown.
9. Enter the "createdAt" value for the "Range Attribute Name" text field. Select the "String" value for the "Range Attribute Type" dropdown.
10. Press the "New Secondary Index" button.
11. Enter the "operationIndex" value for the "Index Name" text field. Select the "Global Secondary Index (GSI)" value for the "Index Type" dropdown.
12. Enter the "operation_id" value for the "Hash Attribute Name" text field. Select the "String" value for the "Hash Attribute Type" dropdown.
13. Enter the "createdAt" value for the "Range Attribute Name" text field. Select the "String" value for the "Range Attribute Type" dropdown.
14. Press the "Submit" button.

Create the `serverless-backend-app-operation`:

1. Open dynamodb-admin UI.
2. Press the "Create table" button.
3. Enter the "serverless-backend-app-operation" value for the "Table Name" text field.
4. Enter the "id" value for the "Hash Attribute Name" text field. Select the "String" value for the "Hash Attribute Type" dropdown.
5. Enter the "type" value for the "Range Attribute Name (Optional)" text field. Select the "String" value for the "Range Attribute Type" dropdown.
6. Press the "New Secondary Index" button.
7. Enter the "typeIndex" value for the "Index Name" text field. Select the "Global Secondary Index (GSI)" value for the "Index Type" dropdown.
8. Enter the "type" value for the "Hash Attribute Name" text field. Select the "String" value for the "Hash Attribute Type" dropdown.
9. Press the "Submit" button.

Please note that `docker-compose` mounts volume in the `/docker_volume/dynamodb` folder of the project. This allows to persist DynamoDB data between restarts. Thus you won't need to recreate the table every time you restart Docker.

### Operations Creations

After create the tables, you can create the operation in the table `serverless-backend-app-operation`, you can use the `Create Patch Operation Endpoint` from the postman library refered in the `LIVE-DOCS.MD`, or you can add them manually to the table, cost may vary but the type must be those exactly

```
[
    {
        "type": "addition",
        "cost": 100
    },
    {
        "type": "subtraction",
        "cost": 100
    },
    {
        "type": "multiplication",
        "cost": 150
    },
    {
        "type": "divition",
        "cost": 120
    },
    {
        "type": "randomStringGeneration",
        "cost": 50
    },
    {
        "type": "squareRoot",
        "cost": 130
    }
]
```

### User Creations

As of the operations endpoints, you'll need to create a user to start testing the endpoints. You can use either the `Create User` endpoint from the postman library refered in the `LIVE-DOCS.MD`, or you can add them manually to the table `serverless-back-end-user`:

```
{
  "createdAt": "2023-04-02T19:50:26.706Z",
  "password": "$2a$10$taK80zzkq6dAWVyPB2JFP.Swj4.8loL8TuqOjLHrp/i6niHQNenjG",
  "balance": 0,
  "id": "1c1d80b4-4d38-4e6f-90f0-363e1e7362a6",
  "status": true,
  "updatedAt": "2023-04-02T19:50:26.706Z",
  "username": "prueba@prueba.com"
}
```

This user will have `prueba@prueba.com` as username and `PruebaContraseñaDificl@` as the password.

### Environment Variables Setup

For running the service locally, enter these values in your environment variables or .env file located in the root of the project:

`JWT_SECRET`=MIIBOgIBAAJBAI0+C9c7pnJN0DnXCF8Dt7eJtwpH7yUyIej57arHM3U8t8PNidfs
kfXCJgZopgB54Hq8E1cN4urJ/9VBVkmFIdUCAwEAAQJAEw/1ryXI0BJ6cOP5qEEr
MWUvw/5zYzTB6NyaW/sokcDdOZMdvZOAvt5xbC10MXF1BJ1v3GFOYU0biQrXVnxs
3QIhANvjWSNNyWhJMQylfVaLKqgkgPthx/cZzq6H5uu7lOG3AiEApHA7sTigiL2j
POcLT317QgBuTwqvoKm4lHlsHkfJqNMCIColz+Y2eM6miOJVrkqybkDAjoCg44V3
yuglYJv63rTNAiBd3h+FHAEv7akYY/+l4ciRtbNCdaQp/5h5URLx+iLYtwIhAJ8h
GIP1C3l3t6kPrbRVOXkZo0OOYH1RWGfvGqkmXVM+

`AWS_ACCESS_KEY_ID`= Your Own AWS_ACCESS_KEY_ID `NotNeededForLocal`

`AWS_SECRET_ACCESS_KEY`= Your own AWS_SECRET_ACCESS_KEY `NotNeededForLocal`

`AWS_DEFAULT_REGION`=us-east-1

`PROJECT_NAME`=serverless-backend-app

`ENVIRONMENT`=local

`PORT`=4000

### Project Dependencies Installation

In the main folder the project and execute the following command:

```bash
$ npm install
```

## Running the Application Locally

In the main folder the project and execute the following command:

```bash
$ npm run start_local
```

## Running Unit Tests

In the main folder the project and execute the following command:

```bash
$ npm run test
```
