/**
 * Module for WebhookRepository.
 *
 * @author Shirin Meirkhan
 * @version 1.0.0
 */

import { MongooseRepositoryBase } from './MongooseRepositoryBase.js'
import { WebhookModel } from '../models/WebhookModel.js'

/**
 * Encapsulates a game repository.
 */
export class WebhookRepository extends MongooseRepositoryBase {
  /**
   * Initializes a new instance.
   *
   * @param {WebhookModel} [model=WebhookModel] - A class with the same capabilities as WebhookModel.
   */
  constructor (model = WebhookModel) {
    super(model)
  }
}
