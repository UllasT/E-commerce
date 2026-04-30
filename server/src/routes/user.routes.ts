import Router from 'express';
import {CreateUser} from "../controller/user.controller.js"






const router = Router();

router.post('/create', CreateUser);

export default router;







