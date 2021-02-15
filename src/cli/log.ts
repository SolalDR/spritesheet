import chalk from 'chalk'

export const errorLog = (
  title: string,
  description = '',
  extended: string = null,
) => {
  console.log()
  console.log(
    chalk.bold.underline.red(title) + chalk.bold.red(': ' + description),
  )
  if (extended) {
    console.log(chalk.red(extended))
  }
}

export const actionLog = (
  title: string,
  description = '',
  extended: string = null,
) => {
  console.log()
  console.log(
    chalk.bold.underline.cyan(title) + chalk.bold.cyan(': ' + description),
  )
  if (extended) {
    console.log(chalk.cyan(extended))
  }
}

export const warningLog = (
  title: string,
  description = '',
  extended: string = null,
) => {
  console.log()
  console.log(
    chalk.bold.underline.yellow(title) + chalk.bold.yellow(': ' + description),
  )
  if (extended) {
    console.log(chalk.yellow(extended))
  }
}

export const successLog = (
  title: string,
  description = '',
  extended: string = null,
) => {
  console.log()
  console.log(
    chalk.bold.underline.green(title) + chalk.green(': ' + description),
  )
  if (extended) {
    console.log(chalk.green(extended))
  }
}
