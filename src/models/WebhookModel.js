/**
 * Mongoose model users.
 *
 * @author Shirin Meirkhan
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'

// Create a schema.
const schema = new mongoose.Schema(
  {
    subscriberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subscriberUrl: {
      type: String,
      required: true
    },
    event: {
      type: String,
      required: true,
      validate: {
        validator:
        /**
         * Validates the event value by converting it to uppercase and checking if it matches "UPDATE" or "CREATE".
         *
         * @function
         * @param {string} value - The event value to validate.
         * @returns {boolean} True if the value is valid, false otherwise.
         */
          function (value) {
            const uppercaseValue = value.toUpperCase()
            return uppercaseValue === 'UPDATE' || uppercaseValue === 'CREATE'
          },
        message: 'Event must be either "UPDATE" or "CREATE" (case-insensitive)'
      }
    }
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true, // ensure virtual fields are serialized
      /**
       * Performs a transformation of the resulting object to remove sensitive information.
       *
       * @param {object} doc - The mongoose document which is being converted.
       * @param {object} ret - The plain object representation which has been converted.
       */
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret._id;
      },
    },
  }
);

schema.virtual('id').get(function () {
  return this._id.toHexString()
})

schema.plugin(mongooseLeanVirtuals)

schema.post(['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete'], function (res) {
  if (!res || !this.mongooseOptions().lean) {
    return
  }

  /**
   * Performs a transformation of the resulting lean object.
   *
   * @param {object} obj - The object to transform.
   */
  const transformLeanObject = (obj) => {
    delete obj._id
    delete obj.__v
  }

  if (Array.isArray(res)) {
    res.forEach(transformLeanObject)
  } else {
    transformLeanObject(res)
  }
})

// Create a model using the schema.
export const WebhookModel = mongoose.model('Webhook', schema)
