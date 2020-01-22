const utilities = require('../utilities/utilities')
const chalk = require('chalk')

const {
  warningMessage,
  errorMessage
} = require('../logger/logger')

const {
  REFERENCE_OUTPUT_NAME_KEY,
  REFERENCE_OUTPUT_VERSION_KEY,
  REFERENCE_OUTPUT_LICENSES_KEY
} = require('../constants/reference-output-keys')

const {
  WHITESOURCE_INVENTORY_NAME_KEY,
  WHITESOURCE_INVENTORY_VERSION_KEY,
  WHITESOURCE_INVENTORY_LICENSES_KEY,
  WHITESOURCE_INVENTORY_GROUPID_KEY
} = require('../constants/inventory-keys')

const determineDependencyNameFromNameAndVersionKeys = ({ wsName, wsVersion }) => {
  let name
  const dashVersion = `-${wsVersion}`
  const lastIndexOfDashVersion = wsName.lastIndexOf(dashVersion)
  if (lastIndexOfDashVersion === -1) {
    warningMessage(chalk`{yellow Could not find substring} '{red ${dashVersion}}' in library name {red ${wsName}}; extracting library name as is`)
    name = wsName
  } else {
    name = wsName.slice(0, lastIndexOfDashVersion)
  }
  return name
}

const extractNameAndVersionFrom = ({ jsonObject }) => {
  const wsNameWithVersionAndExtension = jsonObject[WHITESOURCE_INVENTORY_NAME_KEY]
  const wsVersion = jsonObject[WHITESOURCE_INVENTORY_VERSION_KEY]
  if (wsNameWithVersionAndExtension === '') {
    throw chalk`{red Empty name} in WhiteSource for library with object {blue ${jsonObject}}; throwing exception`
  }

  let name

  if (wsVersion !== '') {
    name = determineDependencyNameFromNameAndVersionKeys({ wsName: wsNameWithVersionAndExtension, wsVersion })
  } else {
    warningMessage(chalk`{yellow Empty version} found for library name {red ${wsNameWithVersionAndExtension}}; extracting library name as is`)
    name = wsNameWithVersionAndExtension
  }

  return ({
    [REFERENCE_OUTPUT_NAME_KEY]: name,
    [REFERENCE_OUTPUT_VERSION_KEY]: wsVersion
  })
}

const extractGroupIdAsNameAndVersionFrom = ({ jsonObject }) => {
  const wsVersion = jsonObject[WHITESOURCE_INVENTORY_VERSION_KEY]
  const wsGroupId = jsonObject[WHITESOURCE_INVENTORY_GROUPID_KEY]
  const wsName = jsonObject[WHITESOURCE_INVENTORY_NAME_KEY]

  let name = wsGroupId
  if (wsVersion === '' && wsGroupId === '') {
    warningMessage(chalk`{yellow Empty version and groupId} found for library with name key: {red ${wsName}}: ${JSON.stringify(jsonObject)}`)
    name = wsName
  } else if (wsGroupId === '') {
    warningMessage(chalk`{yellow Empty groupId} found for library with name key: {red ${wsName}}: ${JSON.stringify(jsonObject)}`)
    name = determineDependencyNameFromNameAndVersionKeys({ wsName, wsVersion })
  } else if (wsVersion === '') {
    warningMessage(chalk`{yellow Empty version} found for library with name key: {red ${wsName}}: ${JSON.stringify(jsonObject)}`)
  }

  return ({
    [REFERENCE_OUTPUT_NAME_KEY]: name,
    [REFERENCE_OUTPUT_VERSION_KEY]: wsVersion
  })
}

const extractDependenciesToReferenceFormat = ({ whitesourceLibraries, readNameFromGroupId = false }) => {
  if (whitesourceLibraries.length === 0) {
    warningMessage(chalk`{yellow Input array is empty}; returning empty array.\n`)
    return []
  }

  let mandatoryKeys = [ WHITESOURCE_INVENTORY_NAME_KEY, WHITESOURCE_INVENTORY_VERSION_KEY ]
  if(readNameFromGroupId){
    mandatoryKeys = [ WHITESOURCE_INVENTORY_GROUPID_KEY ]
  }

  if (!utilities.everyElementHasAllKeys({ jsonArray: whitesourceLibraries, keys: mandatoryKeys })) {
    errorMessage(chalk`There are objects {red missing at least one of the mandatory keys ${mandatoryKeys}}; please make sure they are present. Returning empty array\n`)
    return []
  }

  const dependenciesInReferenceFormat = whitesourceLibraries.map(element => {
    if(readNameFromGroupId){
      return extractGroupIdAsNameAndVersionFrom({ jsonObject: element })
    } else {
      return extractNameAndVersionFrom( { jsonObject: element })
    }
  })
  const uniqueDependenciesInReferenceFormat = utilities.getUniquesByKeyValues({
    jsonArray: dependenciesInReferenceFormat,
    keys: [REFERENCE_OUTPUT_NAME_KEY, REFERENCE_OUTPUT_VERSION_KEY]
  })
  return utilities.sortByNameAndVersionCaseInsensitive(uniqueDependenciesInReferenceFormat)
}

const extractDependenciesToExtendedReferenceFormat = ({ whitesourceLibraries, readNameFromGroupId = false }) => {
  if (whitesourceLibraries.length === 0) {
    warningMessage(chalk`{yellow Input array is empty}; returning empty array.\n`)
    return []
  }

  let mandatoryKeys = [ WHITESOURCE_INVENTORY_NAME_KEY, WHITESOURCE_INVENTORY_VERSION_KEY, WHITESOURCE_INVENTORY_LICENSES_KEY ]
  if(readNameFromGroupId){
    mandatoryKeys = [WHITESOURCE_INVENTORY_GROUPID_KEY, WHITESOURCE_INVENTORY_LICENSES_KEY]
  }

  if (!utilities.everyElementHasAllKeys({ jsonArray: whitesourceLibraries, keys: mandatoryKeys })) {
    errorMessage(chalk`There are objects {red missing at least one of the mandatory keys ${mandatoryKeys}}; please make sure they are present. Returning empty array\n`)
    return []
  }

  const dependenciesInExtendedReferenceFormat = whitesourceLibraries.map(element => {
    let referenceObjectNameAndVersion
    if(readNameFromGroupId){
      referenceObjectNameAndVersion = extractGroupIdAsNameAndVersionFrom({ jsonObject: element })
    } else {
      referenceObjectNameAndVersion = extractNameAndVersionFrom({ jsonObject: element })
    }
    const elemInExtendedFormat = ({
      ...referenceObjectNameAndVersion,
      [REFERENCE_OUTPUT_LICENSES_KEY]:
        element[WHITESOURCE_INVENTORY_LICENSES_KEY].map(license => license.name)
    })
    return elemInExtendedFormat
  }
  )
  const uniqueDependenciesInReferenceFormat = utilities.getUniquesByKeyValues({
    jsonArray: dependenciesInExtendedReferenceFormat,
    keys: [REFERENCE_OUTPUT_NAME_KEY, REFERENCE_OUTPUT_VERSION_KEY]
  })
  return utilities.sortByNameAndVersionCaseInsensitive(uniqueDependenciesInReferenceFormat)
}

const getWhitesourceLibrariesWithEmptyVersion = ({ whitesourceLibraries }) => {
  return utilities.filterForKeyValues({ jsonArray: whitesourceLibraries, key: WHITESOURCE_INVENTORY_VERSION_KEY, keyValuesToMatchTo: [''] })
}

module.exports = {
  extractDependenciesToReferenceFormat,
  getWhitesourceLibrariesWithEmptyVersion,
  extractDependenciesToExtendedReferenceFormat
}
