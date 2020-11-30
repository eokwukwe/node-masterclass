import fs from 'fs'
import http from 'http'
import https from 'https'

import config from './config'
import unifiedServer from './unifiedServer'

// Create HTTPS server options
const httpsServerOption = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
}

// Create instances of HTTP and HTTPS
const httpServer = http.createServer((req, res) => unifiedServer(req, res))
const httpsServer = https.createServer(httpsServerOption, (req, res) =>
  unifiedServer(req, res)
)

httpServer.listen(config.httpPort, () => {
  console.log(`Server running on ${config.httpPort}`)
})

httpsServer.listen(config.httpsPort, () => {
  console.log(`Server running on ${config.httpsPort}`)
})
