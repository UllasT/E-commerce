import e from 'express'
import Router from 'express'
import { AddToCart, GetCart, RemoveFromCart, UpdateCartItem } from '../controller/cart.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'

const router = Router()


router.get('/',authMiddleware,GetCart)
router.post('/add',authMiddleware,AddToCart)
router.delete('/remove/:id',authMiddleware,RemoveFromCart)
router.put('/update/:id',authMiddleware,UpdateCartItem)














export default router

