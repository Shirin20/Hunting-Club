/**
 * Module for the GamesService.
 *
 * @author Shirin Meirkhan
 * @version 1.0.0
 */

import { MongooseServiceBase } from './MongooseServiceBase.js'
import { GameRepository } from '../repositories/GameRepository.js'

/**
 * Encapsulates a Game service.
 */
export class GamesService extends MongooseServiceBase {
  /**
   * Initializes a new instance.
   *
   * @param {GameRepository} [repository=new GameRepository()] - A repository instantiated from a class with the same capabilities as GameRepository.
   */
  constructor (repository = new GameRepository()) {
    super(repository)
  }
}
