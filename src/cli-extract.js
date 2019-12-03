#! /usr/bin/env node

const program = require('commander')
const fs = require('fs-extra')
const chalk = require('chalk')

const {
  setVerbose,
  infoMessage,
  warningMessage,
  errorMessage
} = require('./logger/logger')
const { hasFileExtension } = require('./file-validators/file-extension-validator')
const dependenciesExtractor = require('./convert-to-dependencies-reference-structure/extract-dependencies-from-inventory')

program
  .version('0.0.1', '-v, --version')
  .option(
    '-i, --input [file]',
    '(mandatory) specifies the inventory json filename which contains the dependencies as identified by Whitesource'
  )
  .option('-o, --output [filename]', '(optional) specifies the output filename', 'dependencies.json')
  .option('--verbose', '(optional) Verbose output of commands and errors')

  .parse(process.argv)

const { input, output, verbose } = program

const areCliInputParametersValid = ({ input }) => {
  if (!input) {
    errorMessage(chalk`{red Mandatory input parameter is missing} (run 'extract --help' for usage); program exits`)
    return false
  }

  if (!hasFileExtension({ fileName: input, extension: 'json' })) {
    errorMessage(chalk`Input file ${input} {red is not a json file}; program exits`)
    return false
  }

  return true
}

const logWhitesourceLibrariesWithEmptyVersion = ({ whitesourceLibraries }) => {
  const wslibsEmptyVersion = dependenciesExtractor.getWhitesourceLibrariesWithEmptyVersion({ whitesourceLibraries })
  if (wslibsEmptyVersion.length > 0) {
    const libNamesWithEmptyVersion = wslibsEmptyVersion.map(lib => lib.name)
    warningMessage(chalk`There are {blue ${libNamesWithEmptyVersion.length}} libraries in Whitesource with an {yellow empty version} recorded. Their names:\n\t{white ${libNamesWithEmptyVersion}}\n`)
  }
}

const readDependenciesToReferenceFormatAndWriteToFile = async ({ inputFile, dependenciesOutputFilename }) => {
  const whitesourceInventoryJsonObj = require(inputFile)
  const whitesourceLibraries = whitesourceInventoryJsonObj.libraries
  infoMessage(chalk`{blue ${whitesourceLibraries.length}} library elements read from the json file {blue ${input}}\n`)

  logWhitesourceLibrariesWithEmptyVersion({ whitesourceLibraries })
  const wsDependenciesInReferenceFormat = dependenciesExtractor.extractDependenciesToReferenceFormat({ whitesourceLibraries })
  infoMessage(
    chalk`Writing {blue ${wsDependenciesInReferenceFormat.length}} elements unique by keys name and version to {blue ${dependenciesOutputFilename}}\n`
  )

  try {
    await fs.writeJSON(dependenciesOutputFilename, wsDependenciesInReferenceFormat, { spaces: 2, eol: '\n' })
  } catch (e) {
    errorMessage(chalk`Could not write to {blue ${dependenciesOutputFilename}}`, e)
  }

  return wsDependenciesInReferenceFormat
}

const processFiles = async () => {
  setVerbose(verbose)

  infoMessage(
    chalk`extract\n Program arguments:\n    input: {blue ${input}}\n    output: {blue ${output}}\n      verbose: {blue ${verbose}}`
  )

  if (!areCliInputParametersValid({ input })) {
    return
  }

  await readDependenciesToReferenceFormatAndWriteToFile({ inputFile: input, dependenciesOutputFilename: output })
}

processFiles()
