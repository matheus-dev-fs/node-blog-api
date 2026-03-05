import 'dotenv/config';
import express, { type Express } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { mainRoutes } from './routes/main.route';
import { adminRoutes } from './routes/admin.route';
import { authRoutes } from './routes/auth.route';

const server: Express = express();

server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.static('public'));

server.use('/api/auth', authRoutes);
server.use('/api/admin', adminRoutes);
server.use('/api', mainRoutes);

server.listen(process.env.SERVER_PORT ?? 4444, (): void => {
    console.log(`BLOG API está rodando na porta ${process.env.SERVER_PORT ?? 4444}`);
});