/**
 * Module for UserRepository.
 *
 * @author Shirin Meirkhan
 * @version 1.0.0
 */

import { MongooseRepositoryBase } from './MongooseRepositoryBase.js'
import { UserModel } from '../models/UserModel.js'
import jwt from 'jsonwebtoken'

/**
 * Encapsulates a game repository.
 */
export class UserRepository extends MongooseRepositoryBase {
  /**
   * Initializes a new instance.
   *
   * @param {UserModel} [model=UserModel] - A class with the same capabilities as UserModel.
   */
  constructor (model = UserModel) {
    super(model)
    this.model = model
  }

  /**
   * Authenticates a user by verifying their username and password.
   *
   * @async
   * @param {string} username - The user's username.
   * @param {string} password - The user's password.
   * @returns {Promise<object>} The authenticated user object.
   * @throws {Error} If the authentication fails.
   */
  async generateAccessToken (username, password) {
    const user = await this.model.authenticate(username, password)
    const payload = {
      id: user.id,
      sub: user.username,
      email: user.email
    }

    // Create the access token with the shorter lifespan.
    const accessLife = parseInt(process.env.ACCESS_TOKEN_LIFE)
    const accessToken = jwt.sign(payload, process.env.PRIVATE_KEY, {
      algorithm: 'RS256',
      expiresIn: accessLife
    })

    // const accessToken = jwt.sign(payload, Buffer.from(process.env.PRIVATE_KEY, 'base64'), {
    //   algorithm: 'RS256',
    //   expiresIn: process.env.ACCESS_TOKEN_LIFE
    // })
    return accessToken
  }
}
