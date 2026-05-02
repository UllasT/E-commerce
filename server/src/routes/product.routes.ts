import Router from 'express'
import { CreateProduct, DeleteProduct, GetProductsById, GetUserProducts, SearchProducts, UpdateProduct, GetProductBySlug } from '../controller/product.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'






const router = Router()

// Specific routes first (before :id catch-all)
router.get('/search', SearchProducts)
router.get('/user', authMiddleware, GetUserProducts)
router.get('/slug/:slug', GetProductBySlug)

// Post/Put/Delete
router.post('/create', authMiddleware, CreateProduct)
router.put('/update/:id', authMiddleware, UpdateProduct)
router.delete('/delete/:id', authMiddleware, DeleteProduct)

// Generic routes last
router.get('/:id', GetProductsById)
router.get('/', SearchProducts)


















export default router