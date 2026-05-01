import Router from 'express'
import { CreateProduct, DeleteProduct, GetProductsById, GetUserProducts, UpdateProduct } from '../controller/product.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'






const router = Router()

router.get('/user',authMiddleware,GetUserProducts)
router.post('/create',authMiddleware,CreateProduct)
router.get('/:id',GetProductsById)
router.delete('/delete/:id',authMiddleware,DeleteProduct)
router.put('/update/:id',authMiddleware,UpdateProduct)


















export default router