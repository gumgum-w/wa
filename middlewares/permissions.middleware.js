const apikey = process.env.API_KEY

const levels = {
  public: (req, res, next) => next(),
  authenticated: (req, res, next) => {
    const { headers } = req
    if (!headers.apikey) {
      return res.status(401).json({ message: 'api key is required!' })
    }
    if (headers.apikey !== apikey) {
      return res.status(401).json({ message: 'api key is invalid!' })
    }

    next()
  }
};

module.exports = level => (req, res, next) => levels[level](req, res, next)
