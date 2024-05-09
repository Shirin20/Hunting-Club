/**
 * Module for the WebhooksService.
 *
 * @author Shirin Meirkhan
 * @version 1.0.0
 */

import { MongooseServiceBase } from './MongooseServiceBase.js'
import { WebhookRepository } from '../repositories/WebhookRepository.js'

/**
 * Encapsulates a Webhook service.
 */
export class WebhooksService extends MongooseServiceBase {
  /**
   * Initializes a new instance.
   *
   * @param {WebhookRepository} [repository=new WebhookRepository()] - A repository instantiated from a class with the same capabilities as WebhookRepository.
   */
  constructor (repository = new WebhookRepository()) {
    super(repository)
  }

  /**
   * Triggers webhooks for a specific event.
   *
   * @param {string} event - The event name to trigger the webhooks for.
   * @param {object} method - the HTTP method that was used.
   * @param {object} data - The data payload to send with the webhook.
   * @returns {Promise<void>} - Returns a promise that resolves when all webhooks have been processed.
   */
  async trigger (event, method, data) {
    const webhooksToTrigger = await this._repository.get()

    webhooksToTrigger.forEach(async (webhook) => {
      if (webhook.event === method) {
        try {
          const response = await fetch(webhook.subscriberUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ event, data })
          })

          if (response.ok) {
            console.log(`Webhook ${webhook.id} triggered successfully`)
          } else {
            console.error(`Webhook ${webhook.id} failed with status ${response.status}`)
          }
        } catch (error) {
          console.error(`Webhook ${webhook.id} failed with error: ${error.message}`)
        }
      }
    })
  }
}
