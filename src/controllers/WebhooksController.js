// controllers/WebhooksController.js

import { WebhooksService } from '../services/WebhooksService.js'
import { UsersService } from '../services/UsersService.js'
import createError from 'http-errors'
import { LinksService } from '../services/LinksService.js'

/**
 * Encapsulates a controller.
 */
export class WebhooksController {
  /**
   * The service.
   *
   * @type {WebhooksService}
   */
  #service
  #userService
  #linksService
  #schemaRequiredFields = ['subscriberUrl', 'event']

  /**
   * Initializes a new instance.
   *
   * @param {WebhooksService} service - A service instantiated from a class with the same capabilities as WebhooksService.
   * @param {UsersService} userService - A service instantiated from a class with the same capabilities as userService.
   * @param {LinksService} linksService - A service instantiated from a class with the same capabilities as LinkService.
   */
  constructor (service = new WebhooksService(), userService = new UsersService(), linksService = new LinksService()) {
    this.#service = service
    this.#userService = userService
    this.#linksService = linksService
  }

  /**
   * Authenticate the user a new resource.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  authenticateWebhookSubscriber (req, res, next) {
    this.#userService.authenticateUser(req, res, next)
  }

  /**
   * Authorize the logged user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Function} next - Express next middleware function.
   */
  async isWebhookSubscriber (req, res, next) {
    await this.#userService.isResourceOwner(req.webhookSubscriber.subscriberId.toString(), req.user.id)
      ? next()
      : next(
        createError(
          403, `The request contained valid data and was understood by the server,
           but the server is refusing action due to the authenticated user not
            having the necessary permissions for the resource.`))
  }

  /**
   * Provide req.Game to the route if :id is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The value of the id for the Game to load.
   */
  async loadWebhookSubscriber (req, res, next, id) {
    try {
      // Get the game.
      const webhookSubscriber = await this.#service.getById(id)

      // If no game found send a 404 (Not Found).
      if (!webhookSubscriber) {
        next(createError(404, 'The requested resource was not found.'))
        return
      }

      // Provide the game to req.
      req.webhookSubscriber = webhookSubscriber

      // Next middleware.
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Returns the webhooks options and urls.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async webhookOptions (req, res, next) {
    const response = {
      webhooks: 'welcome to the webhooks service',
      availableEvents: ['UPDATE', 'CREATE'],
      registerLink: 'http://localhost:8091/api/webhooks/register/',
      links: [
        this.#linksService.createLink(req, 'Self', 'GET', ''),
        this.#linksService.createLink(req, 'webhook', 'POST', 'register')
      ]
    }
    res.json(response)
  }

  /**
   * Sends a JSON response containing all webhooks.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async findAll (req, res, next) {
    try {
      const allSubscribers = await this.#service.get()
      res
        .status(200)
        .json(allSubscribers)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Register a new service url.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async register (req, res, next) {
    try {
      const webhook = await this.#service.insert({
        subscriberUrl: req.body.subscriberUrl,
        subscriberId: req.user.id,
        event: req.body.event
      })

      const location = new URL(
        `${req.protocol}://${req.get('host')}${req.baseUrl}/${webhook.id}`
      )

      const links = [
        this.#linksService.createLink(req, 'self', 'POST', 'register'),
        this.#linksService.createUpdateLink(req, 'webhook', `${this.#schemaRequiredFields}`, `${webhook.id}`),
        this.#linksService.createLink(req, 'webhook', 'DELETE', `${webhook.id}`),
        this.#linksService.createCollectionLink(req)
      ]

      res
        .setHeader('Content-Type', 'application/json')
        .location(location.href)
        .status(201)
        .json({
          data: webhook,
          links
        })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  /**
   * Updates a specific game.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async update (req, res, next) {
    try {
      const { subscriberUrl } = req.body

      if (!subscriberUrl) {
        next(createError(400, 'Required parameter is not supplied.'))
        return
      }

      await this.#service.update(req.params.id, { subscriberUrl })
      const links = [
        this.#linksService.createUpdateLink(req, 'Self', `${this.#schemaRequiredFields}`, `${req.params.id}`),
        this.#linksService.createLink(req, 'webhook', 'POST', 'register'),
        this.#linksService.createLink(req, 'webhook', 'DELETE', `${req.params.id}`),
        this.#linksService.createCollectionLink(req)
      ]

      res
        .setHeader('Content-Type', 'application/json')
        .status(200)
        .json({
          message: 'webhook is updated successfully',
          links
        })
        .end()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Deletes a game.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async delete (req, res, next) {
    try {
      await this.#service.delete(req.params.id)

      res
        .setHeader('Content-Type', 'application/json')
        .status(204)
        .end()
    } catch (error) {
      next(error)
    }
  }
}
