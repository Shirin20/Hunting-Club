/**
 * Mongoose configuration.
 *
 * @author Shirin Meirkhan
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import { GameModel } from './../models/GameModel.js'
import { UserModel } from './../models/UserModel.js'
import seedData from './seedData.js'

/**
 * Establishes a connection to a database.
 *
 * @returns {Promise} Resolves to this if connection succeeded.
 */
export const connectDB = async () => {
  const { connection } = mongoose

  // Bind connection to events (to get notifications).
  connection.on('connected', () => console.log('MongoDB connection opened.'))
  connection.on('error', err => console.error(`MongoDB connection error occurred: ${err}`))
  connection.on('disconnected', () => console.log('MongoDB is disconnected.'))

  // If the Node.js process ends, close the connection.
  process.on('SIGINT', () => {
    connection.close()
    console.log('MongoDB disconnected due to application termination.')
    process.exit(0)
  })

  // Connect to the server.
  await mongoose.connect(process.env.DB_CONNECTION_STRING)

  // Clear existing data
  // await Promise.all([
  //   UserModel.deleteMany(),
  //   GameModel.deleteMany()
  // ])

  // // Insert seed data
  // await seedData()

  console.log('Seed data added successfully.')

  // Connect to the server.
  return mongoose.connect(process.env.DB_CONNECTION_STRING)
}
