# IT_CHAT

## Technology

- [Nodejs](https://nodejs.org/en/) - adventurous I/O for the backend.
- [Express](https://expressjs.com/es/) - fast node.js network application framework [@tjholowaychuk].
- [MongoDB](https://www.mongodb.com/es) - Database 
- [Moongose](https://mongoosejs.com/) - MongoDB ORM
- [Socket.io](https://socket.io/) - Socket.io
- [ReactJS](https://es.reactjs.org/) - ReactJS

## Installation

The project requires [Node.js](https://nodejs.org/), and mongodb to work.

Install the dependencies and devDependencies and fix the server.
Create an .env file in the root directory with the following code and fill in the configuration fields


```sh
clone https://github.com/heb1k0/it-chat/
cd it-chat/
```
CLIENT:
```sh
cd client
npm i
```

SERVER:

```sh
cd server
npm i
```


## Start

Do you want to start the project?

Inside the client and server folder, you will find an .env file that you must modify to start your project.

SERVER:

```sh
cd server
```
OPEN .env

````sh
PORT=3000
MONGODB_URI=mongodb://localhost:27017/chatSocket
TEST_MONGODB_URI=mongodb://localhost:27017/chatSocket
``````

CLIENT:

```sh
cd client
```
OPEN .env

````sh
URL= "http://localhost:3002"
URL_DEV= "http://localhost:3002"
``````
RUN SERVER:

````sh
cd server
npm run start
``````
RUN CLIENT:

````sh
cd client
npm run start
``````
## VIEW DEMO

[DEMOO CHAT socketchat.es](https://www.socketchat.es)
