require('dotenv').config()
const path = require('path')
const routes = require('./src/routes')

const lti = require('ltijs').Provider

// Setup

lti.setup(process.env.LTI_KEY,
  {
    url: 'mongodb://' + process.env.DB_HOST + '/' + process.env.DB_NAME + '?authSource=admin',
    connection: { user: process.env.DB_USER, pass: process.env.DB_PASS }
  }, {
    staticPath: path.join(__dirname, './public'), // Path to static files
    cookies: {
      secure: false, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: '' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: true // Set DevMode to true if the testing platform is in a different domain and https is not being used
  })

// When receiving successful LTI launch redirects to app
lti.onConnect(async (token, req, res) => {
  return res.sendFile(path.join(__dirname, './public/index.html'))
})

// When receiving deep linking request redirects to deep screen
lti.onDeepLinking(async (token, req, res) => {
  return lti.redirect(res, '/deeplink', { newResource: true })
})

// Setting up routes
lti.app.use(routes)

// Setup function
const setup = async () => {
  await lti.deploy({ port: 80 })

  /**
   * Register platform
   */
  await lti.registerPlatform({
    url: 'https://blackboard.com',
    name: 'Platform',
    clientId: 'e6ee71b5-519d-40c0-bb36-e481afe6585d',
    authenticationEndpoint: 'https://developer.anthology.com/api/v1/gateway/oidcauth',
    accesstokenEndpoint: 'https://developer.anthology.com/api/v1/gateway/oauth2/jwttoken',
    authConfig: { method: 'JWK_SET', key: 'https://developer.anthology.com/api/v1/management/applications/e6ee71b5-519d-40c0-bb36-e481afe6585d/jwks.json' }
  }) 
}

setup()
