import handlers from './handers'

const router = {
  hello: handlers.hello,
  notFound: handlers.notFound
}

export default router
