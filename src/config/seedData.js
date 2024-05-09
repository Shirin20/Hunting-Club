// seedData.js

import { UserModel } from './../models/UserModel.js'
import { GameModel } from './../models/GameModel.js'
import bcrypt from 'bcryptjs'

const users = [
  { username: 'User-1', password: 'User-1-user', email: 'User-1-user@example.com' },
  { username: 'User-2', password: 'User-2-user', email: 'User-2-user@example.com' }
]

const species = [
  'Moose', 'Red deer', 'Fallow deer', 'Roe deer', 'Wild boar', 'Blue hare', 'Brown hare', 'Rabbit', 'Beaver', 'Muskrat',
  'Brown bear', 'Red fox', 'American mink', 'Polecat', 'Pine marten', 'Badger', 'Pheasant'
]

const cities = [
  'Blekinge län', 'Dalarnas län', 'Gotlands län', 'Gävleborgs län', 'Hallands län', 'Jämtlands län', 'Jönköpings län',
  'Kalmar län', 'Kronobergs län', 'Norrbottens län', 'Skåne län', 'Stockholms län', 'Södermanlands län', 'Uppsala län',
  'Värmlands län', 'Västerbottens län', 'Västernorrlands län'
]

/**
 * Returns a random element from the given array.
 *
 * @param {Array} array - The array from which to pick a random element.
 * @returns {*} A random element from the given array.
 */
function getRandomElement (array) {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Asynchronously generates the specified number of game objects and inserts them into the GameModel.
 *
 * @param {number} numGames - The number of game objects to generate.
 *
 */
async function generateGames (numGames) {
  try {
    const users = await UserModel.find({}).lean()
    const games = []

    for (let i = 0; i < numGames; i++) {
      const game = {
        hunter: getRandomElement(users)._id,
        specie: getRandomElement(species),
        position: {
          latitude: Math.random() * (69.0 - 55.0) + 55.0,
          longitude: Math.random() * (24.0 - 11.0) + 11.0
        },
        city: getRandomElement(cities),
        weight: Math.random() * (500 - 10) + 10,
        length: Math.random() * (3 - 0.5) + 0.5,
        imageUrl: `https://example.com/${getRandomElement(species)}.jpg`
      }
      games.push(game)
    }

    await GameModel.insertMany(games)
    console.log(`Generated ${numGames} game objects successfully.`)
  } catch (error) {
    console.error('Error while generating game objects:', error)
  }
}

/**
 * Asynchronously hashes the passwords for an array of users.
 *
 * @returns {Promise<Array>} An array of user objects with hashed passwords.
 *
 */
async function hashPasswords () {
  const hashedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 8)
      return { ...user, password: hashedPassword }
    })
  )
  return hashedUsers
}

/**
 * Seeds the database with initial data for users and games.
 * Logs a success message for each collection seeded, or an error message if the seeding fails.
 *
 * @returns {Promise<void>} A promise that resolves when all seed data has been inserted.
 * @throws {Error} If an error occurs while seeding data.
 */
export default async function seedData () {
  try {
    const hashedUsers = await hashPasswords()

    await UserModel.insertMany(hashedUsers)
    console.log('User seed data added successfully.')

    // Generate games
    await generateGames(100)
    console.log('Generated game objects successfully.')
  } catch (error) {
    console.error('Error while seeding data:', error)
  }
}
