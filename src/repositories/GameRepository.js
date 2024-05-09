/**
 * Module for GameRepository.
 *
 * @author Shirin Meirkhan
 * @version 1.0.0
 */

import { MongooseRepositoryBase } from './MongooseRepositoryBase.js'
import { GameModel } from '../models/GameModel.js'

/**
 * Encapsulates a game repository.
 */
export class GameRepository extends MongooseRepositoryBase {
  /**
   * Initializes a new instance.
   *
   * @param {GameModel} [model=GameModel] - A class with the same capabilities as GameModel.
   */
  constructor (model = GameModel) {
    super(model)
  }
}
