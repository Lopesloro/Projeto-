import express from "express";
import { Request, Response, Router } from "express";
import { AccountsHandler } from "./accounts/accounts";
import { EventsHandler } from "./events/events";

const port = 3000;
const server = express();
const routes = Router();

server.use(express.json()); 

// Define routes
routes.get('/', (req: Request, res: Response) => {
    res.status(403).send('Acesso não permitido.');
});

// Rota de Login
routes.post('/login', AccountsHandler.loginHandler);

// Rota de Cadastro
routes.post('/signUp', AccountsHandler.signUpHandler);

// Rota de Eventos
routes.post('/addEvent', EventsHandler.addEventHandler);

// Rota para obter eventos
routes.get('/getEvents', EventsHandler.getEventsHandler);

// Rota para deletar evento
routes.put('/deleteEvent', EventsHandler.deleteEventHandler);

// Rota para avaliar novo evento
routes.put('/evaluateNewEvent', EventsHandler.evaluateNewEventHandler);

server.use(routes);

server.listen(port, () => {
    console.log(`Server is running on: ${port}`);
});