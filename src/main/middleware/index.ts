import { gitMiddleware } from 'src/main/middleware/git'
import { loggerMiddleware } from 'src/main/middleware/logger'

export const middleware = [gitMiddleware, loggerMiddleware]
