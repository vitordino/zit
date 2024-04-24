import { is } from '@electron-toolkit/utils'
import { gitMiddleware } from 'src/main/middleware/git'
import { loggerMiddleware } from 'src/main/middleware/logger'

export const middleware = is.dev ? [gitMiddleware, loggerMiddleware] : [gitMiddleware]
