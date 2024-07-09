import { is } from '@electron-toolkit/utils'
import { gitMiddleware } from 'src/main/middleware/git'
import { loggerMiddleware } from 'src/main/middleware/logger'
import { persistanceMiddleware } from './persistence'
import { appMiddleware } from './app'

const developmentMiddleware = [loggerMiddleware]
const productionMiddleware = [appMiddleware, gitMiddleware, persistanceMiddleware]

export const middleware = is.dev
	? [...productionMiddleware, ...developmentMiddleware]
	: productionMiddleware
