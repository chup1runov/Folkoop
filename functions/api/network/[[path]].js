import {createSessionHandler} from '../../../server/auth/session.mjs';
const handle=createSessionHandler();
export const onRequest=({request,env})=>handle(request,env);
