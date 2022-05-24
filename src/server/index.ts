import express from 'express';
import { api } from './api';
import { expressjwt } from 'express-jwt';
import { getJwtSecret } from '../components/signIn/SignInController';


const app = express();
app.use(expressjwt({
    secret: getJwtSecret(),
    credentialsRequired: false,
    algorithms: ['HS256']
}));
app.use(api);

app.listen(3002, () => console.log("Server started"));
