import { Request, Response, RequestHandler } from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv'; 
dotenv.config();

OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

// função de login no banco de dados
async function connBD() {
    try {
        let conn = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });
        return conn;
    } catch (err) {
        console.error('Erro ao conectar:', err);
        throw err;
    }
}

export namespace EventsHandler {
    // função de adicionar evento
    export const addEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const { eventName, eventDate, eventDescription } = req.body;
        if (eventName && eventDate && eventDescription) {
            let connection;
            try {
                connection = await connBD();

                await connection.execute(
                    'INSERT INTO EVENTS (eventName, eventDate, eventDescription, status) VALUES (:eventName, :eventDate, :eventDescription, :status)',
                    [eventName, eventDate, eventDescription, 'pending']
                );

                res.status(201).send("Evento adicionado com sucesso");
            } catch (err) {
                res.status(500).send("Erro ao adicionar evento");
            } finally {
                if (connection) {
                    await connection.close();
                }
            }
        } else {
            res.status(400).send("Nome do evento, data do evento e descrição do evento são obrigatórios");
        }
    };

    // função de ver todos os eventos
    export const getEventsHandler: RequestHandler = async (req: Request, res: Response) => {
        const { status } = req.query;
        let connection;
        try {
            connection = await connBD();

            let events = await connection.execute(
                'SELECT * FROM EVENTS WHERE status = :status',
                [status]
            );

            res.status(200).json(events.rows);
        } catch (err) {
            res.status(500).send("Erro ao obter eventos");
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    };

    // função de deletar evento
    export const deleteEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const { eventId } = req.body;
        if (eventId) {
            let connection;
            try {
                connection = await connBD();

                await connection.execute(
                    'UPDATE EVENTS SET status = :status WHERE eventId = :eventId',
                    ['deleted', eventId]
                );

                res.status(200).send("Evento deletado com sucesso");
            } catch (err) {
                res.status(500).send("Erro ao deletar evento");
            } finally {
                if (connection) {
                    await connection.close();
                }
            }
        } else {
            res.status(400).send("ID do evento é obrigatório");
        }
    };

    // função de apostar em evento
    export const betOnEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const { email, eventId, amount } = req.body;
        if (email && eventId && amount) {
            let connection;
            try {
                connection = await connBD();

                await connection.execute(
                    'UPDATE ACCOUNTS SET balance = balance - :amount WHERE email = :email AND balance >= :amount',
                    [amount, email]
                );

                await connection.execute(
                    'INSERT INTO BETS (email, eventId, amount) VALUES (:email, :eventId, :amount)',
                    [email, eventId, amount]
                );

                res.status(200).send("Aposta realizada com sucesso");
            } catch (err) {
                res.status(500).send("Erro ao realizar aposta");
            } finally {
                if (connection) {
                    await connection.close();
                }
            }
        } else {
            res.status(400).send("Email, ID do evento e valor são obrigatórios");
        }
    };

    // função de encerrar evento
    export const finishEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const { eventId, result } = req.body;
        if (eventId && result) {
            let connection;
            try {
                connection = await connBD();

                await connection.execute(
                    'UPDATE EVENTS SET status = :status WHERE eventId = :eventId',
                    [result, eventId]
                );

                res.status(200).send("Evento encerrado com sucesso");
            } catch (err) {
                res.status(500).send("Erro ao encerrar evento");
            } finally {
                if (connection) {
                    await connection.close();
                }
            }
        } else {
            res.status(400).send("ID do evento e resultado são obrigatórios");
        }
    };

    // função de buscar eventos
    export const searchEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const { keyword } = req.query;
        let connection;
        try {
            connection = await connBD();

            let events = await connection.execute(
                'SELECT * FROM EVENTS WHERE eventName LIKE :keyword',
                [`%${keyword}%`]
            );

            res.status(200).json(events.rows);
        } catch (err) {
            res.status(500).send("Erro ao buscar eventos");
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    };

    // função de avaliar novo evento
    export const evaluateNewEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const { eventId, acao } = req.body;
        if (eventId && (acao === 'aprovado' || acao === 'rejeitado')) {
            let connection;
            try {
                connection = await connBD();

                const status = acao === 'aprovado' ? 'approved' : 'rejeitado';
                await connection.execute(
                    'UPDATE EVENTS SET status = :status WHERE eventId = :eventId',
                    [status, eventId]
                );

                res.status(200).send(`O evento foi ${acao} com sucesso`);
            } catch (err) {
                res.status(500).send("Erro ao avaliar evento");
            } finally {
                if (connection) {
                    await connection.close();
                }
            }
        } else {
            res.status(400).send("Id do evento e ação são obrigatórios");
        }
    };
}