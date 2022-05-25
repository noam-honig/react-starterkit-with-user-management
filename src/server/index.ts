import express from 'express';
import { api } from './api';
import { expressjwt } from 'express-jwt';
import { getJwtSecret } from '../components/signIn/SignInController';
import helmet from 'helmet';
import compression from 'compression';
import sslRedirect from 'heroku-ssl-redirect';
import path from 'path';
import { ServerEventsController } from '../components/realtime/server-events';
import cors from 'cors';

const app = express();
app.use(cors())
app.use(sslRedirect());
const serverEvents = new ServerEventsController();
app.use(expressjwt({
    secret: getJwtSecret(),
    credentialsRequired: false,
    algorithms: ['HS256']
}));
app.use(helmet({ contentSecurityPolicy: false }));
app.get('/api/stream', (req, res) => {
    console.log("Subscribe");
    serverEvents.subscribe(req, res,
        (message, type) => {
            console.log("filter");
            return true;
        } //return true to send the message - use this arrow function to filter the messages based on the user or other rules
    );
});
setInterval(() => {
    console.log("sending");
    serverEvents.SendMessage(new Date());
}, 1000);
app.use(compression());

app.use(api);

app.use(express.static(path.join(__dirname, '../')));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '../', 'index.html'));
});

app.listen(process.env["PORT"] || 3002, () => console.log("Server started"));
