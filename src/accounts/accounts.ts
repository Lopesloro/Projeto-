import { Request, Response, RequestHandler } from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv'; 
dotenv.config();

OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

/*
    Nampespace que contém tudo sobre "contas de usuários"
*/
export namespace AccountsHandler {
    
    /**
     * Tipo UserAccount
     */
    export type UserAccount = {
        id: number | undefined;
        completeName:string;
        email:string;
        password:string | undefined;
    };
    // função de login no banco de dados
    async function login(email: string, password: string) {
        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let accounts = await connection.execute(
            'SELECT * FROM ACCOUNTS WHERE email = :email AND password = :password',
            [email, password]
        );

        await connection.close();

        console.log(accounts.rows);
    }
    // função de login do site
    export const loginHandler: RequestHandler = async (req: Request, res: Response) => {
        const pEmail = req.get('email');
        const pPassword = req.get('password');
        if (pEmail && pPassword) {
            await login(pEmail, pPassword);
            res.status(200).send("Login feito com sucesso");
        } else {
            res.status(400).send("Email e senha são obrigatórios");
        }
    };

    // função de cadastro de usuário
    export const signUpHandler: RequestHandler = async (req: Request, res: Response) => {
        const { completeName, email, password } = req.body;
        if (completeName && email && password) {
            let connection = await OracleDB.getConnection({
                user: process.env.ORACLE_USER,
                password: process.env.ORACLE_PASSWORD,
                connectString: process.env.ORACLE_CONN_STR
            });

            await connection.execute(
                'INSERT INTO ACCOUNTS (completeName, email, password) VALUES (:completeName, :email, :password)',
                [completeName, email, password]
            );

            await connection.close();
            res.status(201).send("Usuario registrado com sucesso");
        } else {
            res.status(400).send("Nome completo, email e senha são obrigatórios");
        }
    };

    
}
