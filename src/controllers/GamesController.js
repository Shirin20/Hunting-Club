/**
 * Module for the ResourceController.
 *
 * @author Shirin Meirkhan
 * @version 1.0.0
 */

import createError from 'http-errors'
import { GamesService } from '../services/GamesService.js'
import { WebhooksService } from '../services/WebhooksService.js'
import { UsersService } from '../services/UsersService.js'
import { LinksService } from '../services/LinksService.js'

/**
 * Encapsulates a controller.
 */
export class GamesController {
  /**
   * The service.
   *
   * @type {GamesService}
   */
  #service
  #webhookService
  #userService
  #linksService
  #schemaRequiredFields = ['specie', 'position', 'city']

  /**
   * Initializes a new instance.
   *
   * @param {GamesService} service - A service instantiated from a class with the same capabilities as GamesService.
   * @param {WebhooksService} webhookService - A service instantiated from a class with the same capabilities as WebhookService.
   * @param {UsersService} userService - A service instantiated from a class with the same capabilities as userService.
   * @param {LinksService} linksService - A service instantiated from a class with the same capabilities as LinkService.
   */
  constructor (service = new GamesService(),
    webhookService = new WebhooksService(),
    userService = new UsersService(),
    linksService = new LinksService()) {
    this.#service = service
    this.#webhookService = webhookService
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
  authenticateHunter (req, res, next) {
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
  async isGameHunter (req, res, next) {
    await this.#userService.isResourceOwner(req.game.hunter.toString(), req.user.id)
      ? next()
      : next(createError(
        403, `The request contained valid data and was understood by the server,
           but the server is refusing action due to the authenticated user not
            having the necessary permissions for the resource.`
      ))
  }

  /**
   * Provide req.Game to the route if :id is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The value of the id for the Game to load.
   */
  async loadGame (req, res, next, id) {
    try {
      // Get the game.
      const game = await this.#service.getById(id)

      // If no game found send a 404 (Not Found).
      if (!game) {
        next(createError(404, 'The requested resource was not found.'))
        return
      }

      // Provide the game to req.
      req.game = game

      // Next middleware.
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing a game.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async find (req, res, next) {
    const game = req.game
    const gameId = game.id
    const links = [
      this.#linksService.createLink(req, 'Self', 'GET', `${gameId}`),
      this.#linksService.createPostLink(req, 'game'),
      this.#linksService.createUpdateLink(req, 'game', `${this.#schemaRequiredFields}`, `${gameId}`),
      this.#linksService.createLink(req, 'game', 'DELETE', `${gameId}`),
      this.#linksService.createCollectionLink(req, 'List', 'GET')
    ]
    // console.log(req.game)
    res.json({ data: game, links })
  }

  /**
   * Sends a JSON response containing all Games.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async findAll (req, res, next) {
    try {
      const games = await this.#service.get()
      const gamesWithLinks = games.map((game) => {
        return {
          ...game, // Convert Mongoose document to a plain JS object
          links:
              this.#linksService.createLink(req, 'game', 'GET', `${game.id}`)
        }
      })
      res
        .status(200)
        .json(gamesWithLinks)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Creates a new game.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async create (req, res, next) {
    try {
      const game = await this.#service.insert({
        hunter: req.user.id,
        specie: req.body.specie,
        position: {
          latitude: req.body.position.latitude,
          longitude: req.body.position.longitude
        },
        city: req.body.city,
        weight: req.body.weight,
        length: req.body.length,
        imageUrl: req.body.imageUrl
      })

      const location = new URL(
        `${req.protocol}://${req.get('host')}${req.baseUrl}/${game.id}`
      )

      await this.#webhookService.trigger('game.created', 'create', game)

      const gameId = game.id
      const links = [
        this.#linksService.createLink(req, 'Self', 'GET', `${gameId}`),
        this.#linksService.createPostLink(req, 'game'),
        this.#linksService.createUpdateLink(req, 'game', `${this.#schemaRequiredFields}`, `${gameId}`),
        this.#linksService.createLink(req, 'game', 'DELETE', `${gameId}`),
        this.#linksService.createCollectionLink(req)
      ]

      res
        .setHeader('Content-Type', 'application/json')
        .location(location.href)
        .status(201)
        .json({ data: game, links })
    } catch (error) {
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
      const { specie, position, city } = req.body

      if (!specie || !position || !city) {
        next(createError(400, 'All required parameters not supplied.'))
        return
      }

      await this.#service.update(req.params.id, { specie, position, city })

      await this.#webhookService.trigger('game.updated', 'update', req.body)

      const links = [
        this.#linksService.createUpdateLink(req, 'Self', `${this.#schemaRequiredFields}`, `${req.params.id}`),
        this.#linksService.createLink(req, 'game', 'GET', `${req.params.id}`),
        this.#linksService.createLink(req, 'game', 'DELETE', `${req.params.id}`),
        this.#linksService.createCollectionLink(req)
      ]

      res
        .setHeader('Content-Type', 'application/json')
        .status(200)
        .json({
          message: 'Game updated successfully',
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
