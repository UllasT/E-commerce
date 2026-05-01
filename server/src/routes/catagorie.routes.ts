import Router from 'express';
import { GetCategories } from '../controller/category.controller.js';


const router = Router();
router.get('/',GetCategories)












export default router;


