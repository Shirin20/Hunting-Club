/**
 * Webhook routes.
 *
 * @author Shirin Meirkhan
 * @version 1.0.0
 */

import express from 'express'

export const router = express.Router()
/**
 * Resolves a WebhooksController object from the IoC container.
 *
 * @param {object} req - Express request object.
 * @returns {object} An object that can act as a WebhooksController object.
 */
const resolveWebhooksController = (req) => req.app.get('container').resolve('WebhooksController')

// Provide req.Game to the route if :id is present in the route path.
router.param('id',
  (req, res, next, id) => resolveWebhooksController(req).loadWebhookSubscriber(req, res, next, id))

router.get('/', (req, res, next) => resolveWebhooksController(req).webhookOptions(req, res, next))

router.post('/register',
  (req, res, next) => resolveWebhooksController(req).authenticateWebhookSubscriber(req, res, next),
  (req, res, next) => resolveWebhooksController(req).register(req, res, next))

router.put('/:id',
  (req, res, next) => resolveWebhooksController(req).authenticateWebhookSubscriber(req, res, next),
  (req, res, next) => resolveWebhooksController(req).isWebhookSubscriber(req, res, next),
  (req, res, next) => resolveWebhooksController(req).update(req, res, next))

router.delete('/:id',
  (req, res, next) => resolveWebhooksController(req).authenticateWebhookSubscriber(req, res, next),
  (req, res, next) => resolveWebhooksController(req).isWebhookSubscriber(req, res, next),
  (req, res, next) => resolveWebhooksController(req).delete(req, res, next))
