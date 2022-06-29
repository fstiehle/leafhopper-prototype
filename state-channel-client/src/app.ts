import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import beginRouter from './routes/begin.route';

const PORT = 9000;
const app: Express = express();

app.use(helmet());
app.use('/begin', beginRouter);

app.get('/', (req: Request, res: Response) => {
    res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Running on ${PORT} ⚡`));