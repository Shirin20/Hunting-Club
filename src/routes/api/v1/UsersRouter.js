/**
 * Users routes.
 *
 * @author Shirin Meirkhan
 * @version 1.0.0
 */

import express from 'express'

export const router = express.Router()
/**
 * Resolves a UsersController object from the IoC container.
 *
 * @param {object} req - Express request object.
 * @returns {object} An object that can act as a UsersController object.
 */
const resolveUsersController = (req) => req.app.get('container').resolve('UsersController')

router.get('/', (req, res, next) => resolveUsersController(req).usersOptions(req, res, next))
router.post('/login', (req, res, next) => resolveUsersController(req).login(req, res, next))

router.post('/register', (req, res, next) => resolveUsersController(req).registerUser(req, res, next))
