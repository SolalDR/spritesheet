import { errorLog }  from '../helpers/log'

export function handleFsError(error, path) {
  switch (error.errno) {
    case -2:
      errorLog('FileSystem', `Cannot read directory with path: "${path}"`)
  }
  process.exit()
}