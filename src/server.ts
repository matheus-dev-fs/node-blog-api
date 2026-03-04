import 'dotenv/config';
import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const server: Express = express();

server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.static('public'));

server.get('/api/ping', (req: Request, res: Response): void => {
    res.json({ pong: true });
});

server.listen(process.env.SERVER_PORT ?? 4444, (): void => {
    console.log(`BLOG API está rodando na porta ${process.env.SERVER_PORT ?? 4444}`);
});