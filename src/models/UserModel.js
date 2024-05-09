/**
 * Mongoose model users.
 *
 * @author Shirin Meirkhan
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Create a schema.
const schema = new mongoose.Schema({
  username: {
    type: String,
    pattern: '^[A-Za-z][A-Za-z0-9_-]{2,255}$',
    required: [true, '`{PATH}` You should write a user name!'],
    unique: [true, 'The username and/ email address is already registered']
  },
  password: {
    type: String,
    minlength: [10, '`{PATH}` ({VALUE}) is beneath the limit ({MIN}).'],
    maxLength: [256, '`{PATH}` ({VALUE}) is beneath the limit ({MIN}).'],
    writeOnly: true
  },
  email: {
    type: String,
    maxLength: [256, '`{PATH}` ({VALUE}) is beneath the limit ({MIN}).'],
    unique: [true, 'The username and/ email address is already registered']
  }
}, {
  timestamps: true,
  versionKey: false
})

// Salts and hashes password before save.
schema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 8)
})
schema.virtual('id').get(function () {
  return this._id.toHexString()
})

/**
 * Lookup the user in the database and compare.
 *
 * @param {*} username the user name string.
 * @param {*} password the password string
 * @returns {object} return the user.
 */
schema.statics.authenticate = async function (username, password) {
  const user = await this.findOne({ username })
  // If no user found or password is wrong, throw an error.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    const error = new Error('not found')
    error.message = 'Invalid login attempt.'
    error.statusCode = 401
    throw new Error('Invalid login attempt.')
  }
  // User found and password correct, return the user.
  return user
}

// Create a model using the schema.
export const UserModel = mongoose.model('User', schema)
