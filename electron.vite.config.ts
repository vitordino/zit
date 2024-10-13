import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
	main: {
		plugins: [tsconfigPaths(), externalizeDepsPlugin({ exclude: ['nanoid'] })],
	},
	preload: {
		plugins: [tsconfigPaths(), externalizeDepsPlugin({ exclude: ['reduxtron'] })],
	},
	renderer: {
		plugins: [
			tsconfigPaths(),
			react(),
			svgr({ include: '**/*.svg', svgrOptions: { exportType: 'default' } }),
		],
	},
})
