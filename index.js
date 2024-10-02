// dotenv import
import { config } from "dotenv";
// express imports
import express from "express";
// static file server imports
import path from "node:path";
import { fileURLToPath } from 'url';
// socket.io imports
import { Server } from "socket.io";
import { createServer } from "node:http";
// other imports
import morgan from "morgan";
import { getMessages, insertMessage } from "./db/supabase.js";
// configurar dotenv para usar variables de entorno
config();
// inicializar aplicacion con express
const app = express();
// obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// inicializar el websocket
const server = createServer(app);
const io = new Server(server);
// configurar el socket.io
io.on('connection', async (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('chat-message', async (message) => {
        const username = socket.handshake.auth.username
        const newMessage = await insertMessage(message, username)
        io.emit('chat-message', newMessage[0].content, newMessage[0].id.toString(), username)
    });
    if (!socket.recovered) { // <-- recuperar los mensajes sin conexion
       const messages = await getMessages(socket.handshake.auth.serverOffset)
       messages.forEach(message => {
           io.emit('chat-message', message.content, message.id.toString(), message.username)
       })
    }
});
// configurar middleware para servir archivos estaticos
app.use('/public', express.static(path.join(__dirname, 'public')))
// configurar middleware para logs
app.use(morgan('dev'))
// crer rutas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'))
})
// inicializar el servidor
async function runApp(port) {
    server.listen(port, () => {
        console.log('server run in port', port)
    })
}
(() => runApp(3000))()






