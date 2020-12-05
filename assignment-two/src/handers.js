import os from 'os'

export default {
  hello(data, callback) {
    // Get user PC info
    callback(200, {
      message: `Hello ${os.userInfo().username}`,
      'System information': {
        username: os.userInfo().username,
        hostname: os.hostname().split('-')[0],
        platform: os.platform(),
        architecture: os.arch(),
      }
    })
  },

  notFound(data, callback) {
    callback(404, { message: 'Not found' })
  }
}
