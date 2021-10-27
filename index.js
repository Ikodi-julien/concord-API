require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const { createServer } = require('http')
const cors = require('cors')
const apiRouter = require('./app/routes/router');
const socketHandler = require('./app/services/socket.handler');

const app = express();
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ?
        [/\.ikodi\.eu\/?$/] :
        ['http://localhost:8080'],
    credentials: true
}
app.use(cors(corsOptions));
app.use(cookieParser());

const httpServer = createServer(app);
const io = new Server(httpServer,
    {
        cors: {
            origin: corsOptions.origin,
            allowedHeaders: [
                'Access-Control-Allow-Headers',
                'Origin',
                'X-Requested-With',
                'Content-Type',
                'Accept'
            ],
        }
    }
);

app.use(express.json());
app.use('/v2', apiRouter);

io.on('connection', socket => {
    socketHandler.auth(socket, io);
    socketHandler.message(socket, io);
    socketHandler.disconnecting(socket, io);
})

const PORT = process.env.PORT;

httpServer.listen(PORT, () => console.log(`Serveur running on http://localhost:${PORT}`));