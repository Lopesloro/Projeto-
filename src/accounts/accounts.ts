import { Request, Response, RequestHandler } from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv'; 
dotenv.config();

OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

/*
    Namespace que contém tudo sobre "contas de usuários"
*/
export namespace AccountsHandler {
    
    /**
     * Tipo UserAccount
     */
    export type UserAccount = {
        id: number | undefined;
        completeName: string;
        email: string;
        password: string | undefined;
    };

    // função de login no banco de dados
    async function login(email: string, password: string) {
        let connection;
        try {
            connection = await OracleDB.getConnection({
                user: process.env.ORACLE_USER,
                password: process.env.ORACLE_PASSWORD,
                connectString: process.env.ORACLE_CONN_STR
            });

            let accounts = await connection.execute(
                'SELECT * FROM ACCOUNTS WHERE email = :email AND password = :password',
                [email, password]
            );

            return accounts.rows;
        } catch (err) {
            console.error('Erro ao conectar:', err);
            throw err;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    // função de login do site
    export const loginHandler: RequestHandler = async (req: Request, res: Response) => {
        const pEmail = req.headers['email'] as string;
        const pPassword = req.headers['password'] as string; 
        if (pEmail && pPassword) {
            try {
                await login(pEmail, pPassword);
                res.status(200).send("Login feito com sucesso");
            } catch (err) {
                res.status(500).send("Erro ao fazer login");
            }
        } else {
            res.status(400).send("Email e senha são obrigatórios");
        }
    };

    // função de cadastro de usuário
    export const signUpHandler: RequestHandler = async (req: Request, res: Response) => {
        const { completeName, email, password } = req.body;
        if (completeName && email && password) {
            let connection;
            try {
                connection = await OracleDB.getConnection({
                    user: process.env.ORACLE_USER,
                    password: process.env.ORACLE_PASSWORD,
                    connectString: process.env.ORACLE_CONN_STR
                });

                await connection.execute(
                    'INSERT INTO ACCOUNTS (completeName, email, password) VALUES (:completeName, :email, :password)',
                    [completeName, email, password]
                );

                res.status(201).send("Usuário cadastrado com sucesso");
            } catch (err) {
                res.status(500).send("Erro ao cadastrar usuário");
            } finally {
                if (connection) {
                    await connection.close();
                }
            }
        } else {
            res.status(400).send("Todos os campos são obrigatórios");
        }
    };

    // função de adicionar fundos
    export const addFundsHandler: RequestHandler = async (req: Request, res: Response) => {
        const { email, amount } = req.body;
        if (email && amount) {
            let connection;
            try {
                connection = await OracleDB.getConnection({
                    user: process.env.ORACLE_USER,
                    password: process.env.ORACLE_PASSWORD,
                    connectString: process.env.ORACLE_CONN_STR
                });

                await connection.execute(
                    'UPDATE ACCOUNTS SET balance = balance + :amount WHERE email = :email',
                    [amount, email]
                );

                res.status(200).send("Fundos adicionados com sucesso");
            } catch (err) {
                res.status(500).send("Erro ao adicionar fundos");
            } finally {
                if (connection) {
                    await connection.close();
                }
            }
        } else {
            res.status(400).send("Email e valor são obrigatórios");
        }
    };

    // função de sacar fundos
    export const withdrawFundsHandler: RequestHandler = async (req: Request, res: Response) => {
        const { email, amount } = req.body;
        if (email && amount) {
            let connection;
            try {
                connection = await OracleDB.getConnection({
                    user: process.env.ORACLE_USER,
                    password: process.env.ORACLE_PASSWORD,
                    connectString: process.env.ORACLE_CONN_STR
                });

                await connection.execute(
                    'UPDATE ACCOUNTS SET balance = balance - :amount WHERE email = :email AND balance >= :amount',
                    [amount, email]
                );

                res.status(200).send("Fundos sacados com sucesso");
            } catch (err) {
                res.status(500).send("Erro ao sacar fundos");
            } finally {
                if (connection) {
                    await connection.close();
                }
            }
        } else {
            res.status(400).send("Email e valor são obrigatórios");
        }
    };
}