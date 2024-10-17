import { Request, Response, RequestHandler } from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv'; 
dotenv.config();


OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

// função de login no banco de dados
async function connBD(){
    try {
        let conn = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });
        return conn;
    } catch (err) {
        console.error('Erro ao conectar:', err);
        return undefined;
    }
}

export namespace EventsHandler {
    // função de adicionar evento
    export const addEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const { eventName, eventDate, eventDescription } = req.body;
        if (eventName && eventDate && eventDescription) {
            let connection = await OracleDB.getConnection({
                user: process.env.ORACLE_USER,
                password: process.env.ORACLE_PASSWORD,
                connectString: process.env.ORACLE_CONN_STR
            });

            await connection.execute(
                'INSERT INTO EVENTS (eventName, eventDate, eventDescription, status) VALUES (:eventName, :eventDate, :eventDescription, :status)',
                [eventName, eventDate, eventDescription, 'pending']
            );

            await connection.close();
            res.status(201).send("Evento adicionado com sucesso");
        } else {
            res.status(400).send("Nome do evento, data do evento e descrição do evento são obrigatórios");
        }
    };

    // função de ver todos os eventos
    export const getEventsHandler: RequestHandler = async (req: Request, res: Response) => {
        const { status } = req.query;
        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let events = await connection.execute(
            'SELECT * FROM EVENTS WHERE status = :status',
            [status]
        );

        await connection.close();
        res.status(200).json(events.rows);
    };

    // função de deletar evento
    export const deleteEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const { eventId } = req.body;
        if (eventId) {
            let connection = await OracleDB.getConnection({
                user: process.env.ORACLE_USER,
                password: process.env.ORACLE_PASSWORD,
                connectString: process.env.ORACLE_CONN_STR
            });

            await connection.execute(
                'UPDATE EVENTS SET status = :status WHERE eventId = :eventId',
                ['deleted', eventId]
            );

            await connection.close();
            res.status(200).send("Evento deletado com sucesso");
        } else {
            res.status(400).send("ID do evento é obrigatório");
        }
    };

    // função de avaliar novo evento
    export const evaluateNewEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const { eventId, acao } = req.body;
        if (eventId && (acao === 'aprovado' || acao === 'rejeitado')) {
            let connection = await OracleDB.getConnection({
                user: process.env.ORACLE_USER,
                password: process.env.ORACLE_PASSWORD,
                connectString: process.env.ORACLE_CONN_STR
            });

            const status = acao === 'aprovado' ? 'approved' : 'rejeitado';
            await connection.execute(
                'UPDATE EVENTS SET status = :status WHERE eventId = :eventId',
                [status, eventId]
            );

            await connection.close();
            res.status(200).send(`O evento foi ${acao} com sucesso`);
        } else {
            res.status(400).send("Id do evento e ação são obrigatórios");
        }
    }
}
;