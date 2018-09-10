'use strict'
const jsonWebToken = require('jsonwebtoken')

// const verifyToken = token => jsonWebToken.verify(token, publicKey, { algorithm })

// const generateToken = (payload, expirationInDays = 2) => jsonWebToken.sign(
//   payload, { key: privateKey, passphrase }, { algorithm, expiresIn: `${expirationInDays}d` })

const generateJwt = (id) => {
  var expiry = new Date()
  expiry.setDate(expiry.getDate() + 7) // set expire in seven days

  return jsonWebToken.sign({
    id: id,
    exp: parseInt(expiry.getTime() / 1000)
  }, process.env.JWT_SECRET)
}

const verifyJwt = (token) => jsonWebToken.verify(token, process.env.JWT_SECRET)

module.exports = {
  verifyJwt,
  generateJwt
}
