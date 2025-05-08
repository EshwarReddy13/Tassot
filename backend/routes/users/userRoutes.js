// routes/users/userRoutes.js
import express from 'express';
import { upsertUser } from '../../controllers/users/userController.js';
const userRouter = express.Router();
userRouter.post('/', upsertUser);
export default userRouter;