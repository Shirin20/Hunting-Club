/**
 * Module for the UsersController.
 *
 * @author Shirin Meirkhan
 * @version 1.0.0
 */

import { UsersService } from '../services/UsersService.js'
import createError from 'http-errors'

/**
 * Encapsulates a controller.
 */
export class UsersController {
  /**
   * The service.
   *
   * @type {UsersService}
   */
  #service

  /**
   * Initializes a new instance.
   *
   * @param {UsersService} service - A service instantiated from a class with the same capabilities as UsersService.
   */
  constructor (service = new UsersService()) {
    this.#service = service
  }

  /**
   * Returns the users urls.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async usersOptions (req, res, next) {
    const response = {
      users: 'welcome to the users service',
      registerLink: 'http://localhost:8091/api/users/register/',
      loginLink: 'http://localhost:8091/api/users/login/'
    }
    res.json(response)
  }

  /**
   * Sends the new users information.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async registerUser (req, res, next) {
    try {
      // Create a new new user...
      const user = await this.#service.insert({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email

      })

      res
        .status(201)
        .json({ id: user._id })
    } catch (error) {
      console.log(error)
      let err = error
      if (error.name === 'ValidationError') {
        err = createError(400)
        err.innerException = error
      } else if (error.name === 'MongoServerError') {
        err = createError(409)
        err.innerException = 'The username and/or email address is already registered'
      }
      next(err)
    }
  }

  /**
   * Sends a login form and authenticates the user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async login (req, res, next) {
    try {
      const accessToken = await this.#service.generateAccessToken(req.body.username, req.body.password)

      res
        .status(201)
        .json({
          access_token: accessToken
        })
    } catch (error) {
      console.log(error)
      const err = createError(401)
      err.innerException = error

      next(err)
    }
  }
}
