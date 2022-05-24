import { remultExpress } from 'remult/remult-express';
import { ChangePasswordController } from '../components/changePassword/changePasswordController';
import { SignInController } from '../components/signIn/SignInController';

import { User } from '../shared/users/user';
import { UsersControllers } from '../shared/users/UsersController';

export const api = remultExpress({
    controllers: [SignInController, ChangePasswordController, UsersControllers],
    entities: [User]
});
