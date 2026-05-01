import Router from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { AddToWishlist, GetWishlist, RemoveFromWishlist } from '../controller/wishlist.controller.js';



const router = Router()




router.post('/add',authMiddleware,AddToWishlist)
router.get('/',authMiddleware,GetWishlist)
router.delete('/remove/:id',authMiddleware,RemoveFromWishlist)








export default router
