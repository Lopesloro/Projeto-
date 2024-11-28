import OracleDB from "oracledb";
import dotenv from 'dotenv';

dotenv.config();

// Configuração global do OracleDB
OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;
OracleDB.autoCommit = true; 

class Database {
    private static instance: Database;
    private pool: OracleDB.Pool | null = null;

    private constructor() { }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async initialize() {
        try {
            // Criar pool de conexões
            this.pool = await OracleDB.createPool({
                user: process.env.ORACLE_USER,
                password: process.env.ORACLE_PASSWORD,
                connectString: process.env.ORACLE_CONN_STR,
                poolMax: 10, 
                poolMin: 2,  
                poolTimeout: 60,
            });
            
            console.log('Pool de conexões Oracle inicializado com sucesso');
        } catch (err) {
            console.error('Erro ao inicializar pool de conexões:', err);
            throw err;
        }
    }

    public async getConnection(): Promise<OracleDB.Connection> {
        if (!this.pool) {
            throw new Error('Pool de conexões não inicializado');
        }
        
        try {
            return await this.pool.getConnection();
        } catch (err) {
            console.error('Erro ao obter conexão do pool:', err);
            throw err;
        }
    }

    public async executeQuery<T>(
        sql: string, 
        params: any[] = [], 
        options: OracleDB.ExecuteOptions = {}
    ): Promise<T> {
        let connection;
        try {
            connection = await this.getConnection();
            const result = await connection.execute(sql, params, options);
            return result as T;
        } catch (err) {
            console.error('Erro ao executar query:', err);
            throw err;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Erro ao fechar conexão:', err);
                }
            }
        }
    }

    public async closePool() {
        if (this.pool) {
            try {
                await this.pool.close(0);
                console.log('Pool de conexões fechado com sucesso');
            } catch (err) {
                console.error('Erro ao fechar pool de conexões:', err);
                throw err;
            }
        }
    }
}

export const db = Database.getInstance();
