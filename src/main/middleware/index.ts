import { is } from '@electron-toolkit/utils'
import { gitMiddleware } from 'src/main/middleware/git'
import { loggerMiddleware } from 'src/main/middleware/logger'
import { persistanceMiddleware } from './persistence'

const developmentMiddleware = [loggerMiddleware]
const productionMiddleware = [gitMiddleware, persistanceMiddleware]

export const middleware = is.dev
	? [...productionMiddleware, ...developmentMiddleware]
	: productionMiddleware
