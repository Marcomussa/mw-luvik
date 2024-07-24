const AUTH_KEY = process.env.AUTH_KEY 
console.log(AUTH_KEY)

const authenticate = (req, res, next) => {
  const authKey = req.headers['x-auth-key']
    
  if (!authKey || authKey !== AUTH_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  next()
}

module.exports = authenticate
