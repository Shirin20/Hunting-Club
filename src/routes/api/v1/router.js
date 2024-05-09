/**
 * API version 1 routes.
 *
 * @author Shirin Meirkhan
 * @version 1.0.0
 */

import express from 'express'
import { router as GamesRouter } from './GamesRouter.js'
import { router as UsersRouter } from './UsersRouter.js'
import { router as WebhooksRouter } from './WebhooksRouter.js'

export const router = express.Router()

router.get('/', (req, res) => res.json(apiRootResponse(req)))

router.use('/games', GamesRouter)
router.use('/users', UsersRouter)

router.use('/webhooks', WebhooksRouter)

/**
   * Creates a collection link object for a given Express request and HTTP method.
   *
   * @function
   * @param {object} req - The Express request object.
   * @returns {object} An object containing the 'resource', 'HTTPMethod', and 'href' properties for the self link.
   */
function apiRootResponse (req) {
  return {
    Api: 'Welcome to this restful API!',
    availableServices: ['users', 'webhooks', 'games'],
    links: [
        `${req.protocol}://${req.get('host')}${req.baseUrl}/users`,
        `${req.protocol}://${req.get('host')}${req.baseUrl}/webhooks`,
        `${req.protocol}://${req.get('host')}${req.baseUrl}/games`
    ]
  }
}
