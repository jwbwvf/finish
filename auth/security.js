'use strict'

const crypto = require('crypto')

const iterations = 1000
const size = 16
const digest = 'SHA256'

const generateSalt = () => crypto.randomBytes(size).toString('hex')

const generateHash = (salt, password) => crypto.pbkdf2Sync(password, salt, iterations, size, digest).toString('hex')

const isPasswordValid = (password, salt, hash) => hash === crypto.pbkdf2Sync(password, salt, iterations, size, digest).toString('hex')

module.exports = {
  generateSalt,
  generateHash,
  isPasswordValid
}
