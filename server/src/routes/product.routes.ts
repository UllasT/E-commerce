import Router from 'express'
import { CreateProduct } from '../controller/product.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'






const router = Router()

router.post('/create',authMiddleware,CreateProduct)


















export default router