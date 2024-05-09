/**
 * resource routes.
 *
 * @author Shirin Meirkhan
 * @version 1.0.0
 */

import express from 'express'

export const router = express.Router()

/**
 * Resolves a GamesController object from the IoC container.
 *
 * @param {object} req - Express request object.
 * @returns {object} An object that can act as a GamesController object.
 */
const resolveGamesController = (req) => req.app.get('container').resolve('GamesController')

// Provide req.Game to the route if :id is present in the route path.
router.param('id',
  (req, res, next, id) => resolveGamesController(req).loadGame(req, res, next, id))

// GET Games
router.get('/',
  (req, res, next) => resolveGamesController(req).findAll(req, res, next))

// GET Games/:id
router.get('/:id',
  (req, res, next) => resolveGamesController(req).find(req, res, next))

// POST Games
router.post('/',
  (req, res, next) => resolveGamesController(req).authenticateHunter(req, res, next),
  (req, res, next) => resolveGamesController(req).create(req, res, next))

// PUT Games/:id
router.put('/:id',
  (req, res, next) => resolveGamesController(req).authenticateHunter(req, res, next),
  (req, res, next) => resolveGamesController(req).isGameHunter(req, res, next),
  (req, res, next) => resolveGamesController(req).update(req, res, next))

// DELETE Games/:id
router.delete('/:id',
  (req, res, next) => resolveGamesController(req).authenticateHunter(req, res, next),
  (req, res, next) => resolveGamesController(req).isGameHunter(req, res, next),
  (req, res, next) => resolveGamesController(req).delete(req, res, next))
