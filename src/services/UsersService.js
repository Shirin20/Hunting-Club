/**
 * Module for the UsersService.
 *
 * @author Shirin Meirkhan
 * @version 1.0.0
 */

import { MongooseServiceBase } from './MongooseServiceBase.js'
import { UserRepository } from '../repositories/UserRepository.js'
import jwt from 'jsonwebtoken'

import createError from 'http-errors'
// import createError from 'http-errors'

/**
 * Encapsulates a  service.
 */
export class UsersService extends MongooseServiceBase {
  /**
   * Initializes a new instance.
   *
   * @param {UserRepository} [repository=new UserRepository()] - A repository instantiated from a class with the same capabilities as UserRepository.
   */
  constructor (repository = new UserRepository()) {
    super(repository)
  }

  /**
   * Generates a token.
   *
   * @param {*} username the user name string.
   * @param {*} password the password string
   * @returns {Promise<object>} Promise resolved with the removed document as a plain JavaScript object.
   */
  async generateAccessToken (username, password) {
    return this._repository.generateAccessToken(username, password)
  }

  /**
   * Verifies the provided JWT using the public key and returns the decoded payload.
   * If the token is invalid, an error will be logged and the function returns undefined.
   *
   * @param {string} token - The JSON Web Token to be verified.
   * @returns {object|undefined} The decoded payload object containing email, sub, and id, or undefined if the token is invalid.
   */
  #verifyJWT (token) {
    try {
      const payload = jwt.verify(token, process.env.PUBLIC_KEY, {
        algorithms: ['RS256']
      })

      // const payload = jwt.verify(token, Buffer.from(process.env.PUBLIC_KEY, 'base64'))
      return {
        email: payload.email,
        sub: payload.sub,
        id: payload.id
      }
    } catch (err) {
      console.log(err)
    }
  }

  /**
   * Authorize the current user.
   *
   * @param {object} resourceOwnerId - the resource owner.
   * @param {object} userId - The current user.
   */
  async isResourceOwner (resourceOwnerId, userId) {
    return userId === resourceOwnerId
  }

  /**
   * Authenticate the user a new resource.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  authenticateUser (req, res, next) {
    const token = req.headers.authorization?.split(' ')

    if (token?.[0] !== 'Bearer') {
      next(createError(401, 'Access token invalid or not provided.'))
      return
    }
    try {
      const payload = this.#verifyJWT(token[1])
      req.user = {
        email: payload.email,
        sub: payload.sub,
        id: payload.id
      }
      next()
    } catch (err) {
      console.log(err)
      next(createError(403))
    }
  }
}
