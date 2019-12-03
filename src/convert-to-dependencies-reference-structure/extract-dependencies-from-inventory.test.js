const depsExtractor = require('./extract-dependencies-from-inventory')

describe('extractDependenciesToReferenceFormat', () => {
  it('returns an array of dependencies (name, version) as read from the whitesource inventory libraries, which has name and version filled in',
    () => {
      const input = [
        {
          'keyUuid': 'keyUuid-1',
          'type': 'javascript/Node.js',
          'productName': 'product-1',
          'projectName': 'project-1',
          'description': 'JSON Schema validation and specifications',
          'directDependency': false,
          'matchType': 'Filename Match',
          'sha1': 'sha-value-1',
          'name': 'json-schema-0.2.3.tgz',
          'artifactId': 'json-schema-0.2.3.tgz',
          'version': '0.2.3',
          'groupId': 'json-schema',
          'licenses': [{ 'name': 'Academic 2.1', 'references': [] }, { 'name': 'BSD', 'references': [] }, { 'name': 'BSD 3', 'references': [] }]
        },
        {
          'keyUuid': 'keyUuid-2',
          'type': 'Java',
          'productName': 'product-1',
          'projectName': 'project-1',
          'description': 'A set of annotations used for code inspection support and code documentation.',
          'directDependency': false,
          'matchType': 'Exact Match',
          'sha1': 'sha-value-2',
          'name': 'annotations-13.0.jar',
          'artifactId': 'annotations',
          'version': '13.0',
          'groupId': 'org.jetbrains',
          'licenses': [{ 'name': 'Apache 2.0', 'references': [] }]
        }
      ]
      const expectedOutput = [
        {
          'name': 'annotations',
          'version': '13.0'
        },
        {
          'name': 'json-schema',
          'version': '0.2.3'
        }
      ]
      const actualOutput = depsExtractor.extractDependenciesToReferenceFormat({
        whitesourceLibraries: input
      })
      expect(actualOutput)
        .toEqual(expectedOutput)
    })

  it('returns an empty array if the whitesource inventory libraries list is empty',
    () => {
      const input = []
      const expectedOutput = []
      const actualOutput = depsExtractor.extractDependenciesToReferenceFormat({
        whitesourceLibraries: input

      })
      expect(actualOutput)
        .toEqual(expectedOutput)
    })

  it('returns an array of dependencies (name, version) with the (unprocessed) name as it appears in whitesource, if the version is empty',
    () => {
      const inputWithEmptyVersion = [
        {
          'keyUuid': 'keyUuid-1',
          'type': 'Unknown Library',
          'productName': 'productName-1',
          'projectName': 'project-1',
          'description': '',
          'directDependency': true,
          'matchType': 'Exact Match',
          'sha1': 'sha-value-1',
          'name': 'webassemblyjs-wasm-parser-1.7.10.tgz',
          'artifactId': 'webassemblyjs-wasm-parser-1.7.10.tgz',
          'version': '',
          'groupId': '',
          'licenses': [{ 'name': 'MIT', 'references': [] }]
        }
      ]
      const expectedOutput = [
        {
          name: 'webassemblyjs-wasm-parser-1.7.10.tgz',
          version: ''
        }
      ]
      const actualOutput = depsExtractor.extractDependenciesToReferenceFormat({
        whitesourceLibraries: inputWithEmptyVersion

      })
      expect(actualOutput)
        .toEqual(expectedOutput)
    })

  it('returns an empty array if at least one of the elements in the whitesource inventory is missing a mandatory key',
    () => {
      const inputMissingNameKey = [
        {
          'keyUuid': 'keyUuid-1',
          'type': 'javascript/Node.js',
          'productName': 'productName-1',
          'projectName': 'project-1',
          'description': 'JSON Schema validation and specifications',
          'directDependency': false,
          'matchType': 'Filename Match',
          'sha1': 'sha-value-1',
          'ThisIsNotTheNameKey': 'json-schema-0.2.3.tgz',
          'artifactId': 'json-schema-0.2.3.tgz',
          'version': '0.2.3',
          'groupId': 'json-schema',
          'licenses': [{ 'name': 'Academic 2.1', 'references': [] }, { 'name': 'BSD', 'references': [] }, { 'name': 'BSD 3', 'references': [] }]
        }
      ]
      const expectedOutput = []
      let actualOutput = depsExtractor.extractDependenciesToReferenceFormat({
        whitesourceLibraries: inputMissingNameKey

      })
      expect(actualOutput)
        .toEqual(expectedOutput)

      const inputMissingVersionKey = [
        {
          'keyUuid': 'keyUuid-1',
          'type': 'javascript/Node.js',
          'productName': 'productName-1',
          'projectName': 'project-1',
          'description': 'JSON Schema validation and specifications',
          'directDependency': false,
          'matchType': 'Filename Match',
          'sha1': 'sha-value-1',
          'name': 'json-schema-0.2.3.tgz',
          'artifactId': 'json-schema-0.2.3.tgz',
          'thisIsNotTheMandatoryVersionKey': '0.2.3',
          'groupId': 'json-schema',
          'licenses': [{ 'name': 'Academic 2.1', 'references': [] }, { 'name': 'BSD', 'references': [] }, { 'name': 'BSD 3', 'references': [] }]
        }
      ]
      actualOutput = depsExtractor.extractDependenciesToReferenceFormat({
        whitesourceLibraries: inputMissingVersionKey

      })
      expect(actualOutput)
        .toEqual(expectedOutput)
    })
})

describe('getWhitesourceLibrariesWithEmptyVersion', () => {
  it('returns an empty array of elements if the input array is empty',
    () => {
      const inputArray = []
      const expectedOutput = []
      const actualOutput = depsExtractor.getWhitesourceLibrariesWithEmptyVersion({
        whitesourceLibraries: inputArray
      })
      expect(actualOutput)
        .toEqual(expectedOutput)
    })
  it('returns an array with only those elements (in whitesource format) that have an empty value for the version in whitesource',
    () => {
      const inputWithOneEmptyVersionAndOneNonempty = [
        {
          'keyUuid': 'keyUuid-1',
          'type': 'Unknown Library',
          'productName': 'productName-1',
          'projectName': 'project-1',
          'description': '',
          'directDependency': true,
          'matchType': 'Exact Match',
          'sha1': 'sha-value-1',
          'name': 'webassemblyjs-wasm-parser-1.7.10.tgz',
          'artifactId': 'webassemblyjs-wasm-parser-1.7.10.tgz',
          'version': '',
          'groupId': '',
          'licenses': [{ 'name': 'MIT', 'references': [] }]
        },
        {
          'keyUuid': 'keyUuid-2',
          'type': 'Java',
          'productName': 'product-1',
          'projectName': 'project-1',
          'description': 'A set of annotations used for code inspection support and code documentation.',
          'directDependency': false,
          'matchType': 'Exact Match',
          'sha1': 'sha-value-2',
          'name': 'annotations-13.0.jar',
          'artifactId': 'annotations',
          'version': '13.0',
          'groupId': 'org.jetbrains',
          'licenses': [{ 'name': 'Apache 2.0', 'references': [] }]
        }
      ]

      const expectedOutput = [
        {
          'keyUuid': 'keyUuid-1',
          'type': 'Unknown Library',
          'productName': 'productName-1',
          'projectName': 'project-1',
          'description': '',
          'directDependency': true,
          'matchType': 'Exact Match',
          'sha1': 'sha-value-1',
          'name': 'webassemblyjs-wasm-parser-1.7.10.tgz',
          'artifactId': 'webassemblyjs-wasm-parser-1.7.10.tgz',
          'version': '',
          'groupId': '',
          'licenses': [{ 'name': 'MIT', 'references': [] }]
        }
      ]
      const actualOutput = depsExtractor.getWhitesourceLibrariesWithEmptyVersion({
        whitesourceLibraries: inputWithOneEmptyVersionAndOneNonempty
      })
      expect(actualOutput)
        .toEqual(expectedOutput)
    })
})
