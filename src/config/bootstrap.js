/**
 * Module for bootstrapping.
 *
 * @author Shirin Meirkhan
 * @version 1.0.0
 */

import { IoCContainer } from '../util/IoCContainer.js'
import { GameModel } from '../models/GameModel.js'
import { GameRepository } from '../repositories/GameRepository.js'
import { GamesService } from '../services/GamesService.js'
import { GamesController } from '../controllers/GamesController.js'
import { UserModel } from '../models/UserModel.js'
import { UserRepository } from '../repositories/UserRepository.js'
import { UsersService } from '../services/UsersService.js'
import { UsersController } from '../controllers/UsersController.js'
import { WebhookModel } from '../models/WebhookModel.js'
import { WebhookRepository } from '../repositories/WebhookRepository.js'
import { WebhooksService } from '../services/WebhooksService.js'
import { WebhooksController } from '../controllers/WebhooksController.js'
import { LinksService } from '../services/linksService.js'

const iocContainer = new IoCContainer()

iocContainer.register('ConnectionString', process.env.DB_CONNECTION_STRING)
// Users
iocContainer.register('UserModelType', UserModel, { type: true })
iocContainer.register('UserRepositorySingleton', UserRepository, {
  dependencies: [
    'UserModelType'
  ],
  singleton: true
})

iocContainer.register('UsersServiceSingleton', UsersService, {
  dependencies: [
    'UserRepositorySingleton'
  ],
  singleton: true
})
iocContainer.register('UsersController', UsersController, {
  dependencies: [
    'UsersServiceSingleton'
  ]
})

// Links
iocContainer.register('LinksServiceSingleton', LinksService, {
  singleton: true
})

// Game
iocContainer.register('GameModelType', GameModel, { type: true })

iocContainer.register('GameRepositorySingleton', GameRepository, {
  dependencies: [
    'GameModelType'
  ],
  singleton: true
})

iocContainer.register('GamesServiceSingleton', GamesService, {
  dependencies: [
    'GameRepositorySingleton'
  ],
  singleton: true
})

iocContainer.register('GamesController', GamesController, {
  dependencies: [
    'GamesServiceSingleton',
    'WebhooksServiceSingleton',
    'UsersServiceSingleton',
    'LinksServiceSingleton'
  ]
})

// webhook
iocContainer.register('WebhookModelType', WebhookModel, { type: true })
iocContainer.register('WebhookRepositorySingleton', WebhookRepository, {
  dependencies: [
    'WebhookModelType'
  ],
  singleton: true
})
iocContainer.register('WebhooksServiceSingleton', WebhooksService, {
  dependencies: [
    'WebhookRepositorySingleton'
  ],
  singleton: true
})
iocContainer.register('WebhooksController', WebhooksController, {
  dependencies: [
    'WebhooksServiceSingleton',
    'UsersServiceSingleton',
    'LinksServiceSingleton'
  ]
})

export const container = Object.freeze(iocContainer)
