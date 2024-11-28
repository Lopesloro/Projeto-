import express, { Request, Response, Router } from "express";
import { AccountsHandler } from "./accounts/accounts";
import { EventsHandler } from "./events/events";
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

dotenv.config();

const port = 3000;
const server = express();
const routes = Router();

// Configuração do CORS
server.use(cors({
    origin: 'http://127.0.0.1:5500', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'email', 'password']
}));

server.use(express.json());

// Servir arquivos estáticos do diretório public
server.use(express.static('public'));

// Define routes
// Rota para a página inicial
routes.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para a página de autenticação
routes.get('/auth', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

// Rota de Login
routes.post('/login', AccountsHandler.loginHandler);

// Rota de Cadastro
routes.post('/signUp', AccountsHandler.signUpHandler);

// Rotas
routes.post('/addEvent', EventsHandler.addEventHandler);
routes.get('/getEvents', EventsHandler.getEventsHandler);
routes.put('/deleteEvent', EventsHandler.deleteEventHandler);
routes.put('/evaluateNewEvent', EventsHandler.evaluateNewEventHandler);
routes.post('/addFunds', AccountsHandler.addFundsHandler);
routes.post('/withdrawFunds', AccountsHandler.withdrawFundsHandler);
routes.post('/betOnEvent', EventsHandler.betOnEventHandler);
routes.put('/finishEvent', EventsHandler.finishEventHandler);
routes.get('/searchEvent', EventsHandler.searchEventHandler);

server.use(routes);

// Inicia o servidor
server.listen(port, () => {
    console.log(`Server is running on: ${port}`);
});