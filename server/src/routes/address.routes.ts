import Router from 'express'
import { AddAddress, GetAddresses, UpdateAddress, DeleteAddress } from '../controller/address.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'

const router = Router()

router.post('/add', authMiddleware, AddAddress)
router.get('/list', authMiddleware, GetAddresses)
router.put('/update/:id', authMiddleware, UpdateAddress)
router.delete('/delete/:id', authMiddleware, DeleteAddress)

export default router
