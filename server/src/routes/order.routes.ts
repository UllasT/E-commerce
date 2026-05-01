import Router from 'express'
import { CreateOrder, GetOrders, GetOrderById, UpdateOrder, CancelOrder } from '../controller/order.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'

const router = Router()

router.post('/create', authMiddleware, CreateOrder)
router.get('/my', authMiddleware, GetOrders)
router.get('/:id', authMiddleware, GetOrderById)
router.put('/update/:id', authMiddleware, UpdateOrder)
router.post('/cancel/:id', authMiddleware, CancelOrder)

export default router
