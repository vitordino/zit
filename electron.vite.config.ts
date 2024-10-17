import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
	main: {
		esbuild: { target: 'node20' },
		plugins: [tsconfigPaths(), externalizeDepsPlugin({ exclude: ['nanoid'] })],
	},
	preload: {
		esbuild: { target: ['node20', 'chrome130'] },
		plugins: [tsconfigPaths(), externalizeDepsPlugin({ exclude: ['reduxtron'] })],
	},
	renderer: {
		esbuild: { target: 'chrome130' },
		plugins: [
			tsconfigPaths(),
			react(),
			svgr({ include: '**/*.svg', svgrOptions: { exportType: 'default' } }),
		],
	},
})
