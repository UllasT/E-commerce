import Router from 'express';
import {CreateUser, GetUser, LoginUser} from "../controller/user.controller.js"
import authMiddleware from '../middleware/auth.middleware.js';






const router = Router();

router.post('/create', CreateUser);
router.post('/login', LoginUser);
router.get('/profile',authMiddleware ,GetUser);

export default router;







