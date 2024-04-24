import { simpleGit as git } from 'simple-git'

export const getStatus = async () => {
	console.log({ __dirname })
	const s = await git({ baseDir: __dirname }).status()
	console.log(s)
}
