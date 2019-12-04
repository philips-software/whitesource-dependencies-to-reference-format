const utilities = require('../utilities/utilities')
const chalk = require('chalk')

const {
  warningMessage,
  errorMessage
} = require('../logger/logger')

const {
  REFERENCE_OUTPUT_NAME_KEY,
  REFERENCE_OUTPUT_VERSION_KEY
} = require('../constants/reference-output-keys')

const {
  WHITESOURCE_INVENTORY_NAME_KEY,
  WHITESOURCE_INVENTORY_VERSION_KEY
} = require('../constants/inventory-keys')

const extractNameAndVersionFrom = ({ jsonObject }) => {
  const wsNameWithVersionAndExtension = jsonObject[WHITESOURCE_INVENTORY_NAME_KEY]
  const wsVersion = jsonObject[WHITESOURCE_INVENTORY_VERSION_KEY]
  if (wsNameWithVersionAndExtension === '') {
    throw chalk`{red Empty name} in WhiteSource for library with object {blue ${jsonObject}}; throwing exception`
  }

  let name

  if (wsVersion !== '') {
    const dashVersion = `-${wsVersion}`
    const lastIndexOfDashVersion = wsNameWithVersionAndExtension.lastIndexOf(dashVersion)
    if (lastIndexOfDashVersion === -1) {
      warningMessage(chalk`{yellow Could not find substring} '{red ${dashVersion}}' in library name {red ${wsNameWithVersionAndExtension}}; extracting library name as is`)
      name = wsNameWithVersionAndExtension
    } else {
      name = wsNameWithVersionAndExtension.slice(0, lastIndexOfDashVersion)
    }
  } else {
    warningMessage(chalk`{yellow Empty version} found for library name {red ${wsNameWithVersionAndExtension}}; extracting library name as is`)
    name = wsNameWithVersionAndExtension
  }

  return ({
    [REFERENCE_OUTPUT_NAME_KEY]: name,
    [REFERENCE_OUTPUT_VERSION_KEY]: wsVersion
  })
}

const extractDependenciesToReferenceFormat = ({ whitesourceLibraries }) => {
  if (whitesourceLibraries.length === 0) {
    warningMessage(chalk`{yellow Input array is empty}; returning empty array.\n`)
    return []
  }

  const mandatoryKeys = [ WHITESOURCE_INVENTORY_NAME_KEY, WHITESOURCE_INVENTORY_VERSION_KEY ]

  if (!utilities.everyElementHasAllKeys({ jsonArray: whitesourceLibraries, keys: mandatoryKeys })) {
    errorMessage(chalk`There are objects {red missing at least one of the mandatory keys ${mandatoryKeys}}; please make sure they are present. Returning empty array\n`)
    return []
  }

  const dependenciesInReferenceFormat = whitesourceLibraries.map(element =>
    extractNameAndVersionFrom({ jsonObject: element })
  )
  const uniqueDependenciesInReferenceFormat = utilities.getUniquesByKeyValues({
    jsonArray: dependenciesInReferenceFormat,
    keys: [REFERENCE_OUTPUT_NAME_KEY, REFERENCE_OUTPUT_VERSION_KEY]
  })
  return utilities.sortByNameAndVersionCaseInsensitive(uniqueDependenciesInReferenceFormat)
}

const getWhitesourceLibrariesWithEmptyVersion = ({ whitesourceLibraries }) => {
  return utilities.filterForKeyValues({ jsonArray: whitesourceLibraries, key: WHITESOURCE_INVENTORY_VERSION_KEY, keyValuesToMatchTo: [''] })
}

module.exports = {
  extractDependenciesToReferenceFormat,
  getWhitesourceLibrariesWithEmptyVersion
}
