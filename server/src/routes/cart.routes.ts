import e from 'express'
import Router from 'express'
import { AddToCart, GetCart } from '../controller/cart.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'

const router = Router()


router.get('/',authMiddleware,GetCart)
router.post('/add',authMiddleware,AddToCart)














export default router

