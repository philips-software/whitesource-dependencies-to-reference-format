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

  it('returns a depenencies array containing the dependency name as it appears in whitesource\'s library name (unprocessed), if the version is not empty and the library name does not contain the -<version> substring',
    () => {
      const inputLibrariesVersionNotSubstringInName = [
        {
          'keyUuid': 'keyUuid-0',
          'type': 'Source Library',
          'productName': 'product-1',
          'projectName': 'project-3',
          'description': 'Node.js JavaScript runtime :sparkles::turtle::rocket::sparkles:',
          'directDependency': true,
          'matchType': 'Best Match',
          'sha1': 'sha-value-0',
          'name': 'io.js',
          'artifactId': 'io.js',
          'version': 'v0.9.2',
          'groupId': 'iojs',
          'licenses': [{ 'name': 'MIT X11', 'references': [] }, { 'name': 'BSD 3', 'references': [] }, { 'name': 'GPL 2.0', 'references': [] }]
        }
      ]
      const expectedOutput = [
        {
          name: 'io.js',
          version: 'v0.9.2'
        }
      ]
      const actualOutput = depsExtractor.extractDependenciesToReferenceFormat({
        whitesourceLibraries: inputLibrariesVersionNotSubstringInName
      })
      expect(actualOutput)
        .toEqual(expectedOutput)
    }
  )

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

describe('extractDependenciesToExtendedReferenceFormat', () => {
  it('returns an array of dependencies (name, version, licenses) as read from the whitesource inventory libraries, which has name, version and licenses filled in',
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
          'version': '13.0',
          'licenses': ['Apache 2.0']
        },
        {
          'name': 'json-schema',
          'version': '0.2.3',
          'licenses': ['Academic 2.1', 'BSD', 'BSD 3']

        }
      ]
      const actualOutput = depsExtractor.extractDependenciesToExtendedReferenceFormat({
        whitesourceLibraries: input
      })
      expect(actualOutput)
        .toEqual(expectedOutput)
    })

  it('returns an empty array if the whitesource inventory libraries list is empty',
    () => {
      const input = []
      const expectedOutput = []
      const actualOutput = depsExtractor.extractDependenciesToExtendedReferenceFormat({
        whitesourceLibraries: input

      })
      expect(actualOutput)
        .toEqual(expectedOutput)
    })

  it('returns a dependencies array containing the dependency name as it appears in whitesource\'s library name (unprocessed), if the version is not empty and the library name does not contain the -<version> substring',
    () => {
      const inputLibrariesVersionNotSubstringInName = [
        {
          'keyUuid': 'keyUuid-0',
          'type': 'Source Library',
          'productName': 'product-1',
          'projectName': 'project-3',
          'description': 'Node.js JavaScript runtime :sparkles::turtle::rocket::sparkles:',
          'directDependency': true,
          'matchType': 'Best Match',
          'sha1': 'sha-value-0',
          'name': 'io.js',
          'artifactId': 'io.js',
          'version': 'v0.9.2',
          'groupId': 'iojs',
          'licenses': [{ 'name': 'MIT X11', 'references': [] }, { 'name': 'BSD 3', 'references': [] }, { 'name': 'GPL 2.0', 'references': [] }]
        }
      ]
      const expectedOutput = [
        {
          name: 'io.js',
          version: 'v0.9.2',
          'licenses': ['MIT X11', 'BSD 3', 'GPL 2.0']

        }
      ]
      const actualOutput = depsExtractor.extractDependenciesToExtendedReferenceFormat({
        whitesourceLibraries: inputLibrariesVersionNotSubstringInName
      })
      expect(actualOutput)
        .toEqual(expectedOutput)
    }
  )

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
          version: '',
          'licenses': ['MIT']
        }
      ]
      const actualOutput = depsExtractor.extractDependenciesToExtendedReferenceFormat({
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
          'THIS_IS_NOT_THE_NAME_KEY': 'json-schema-0.2.3.tgz',
          'artifactId': 'json-schema-0.2.3.tgz',
          'version': '0.2.3',
          'groupId': 'json-schema',
          'license': [{ 'name': 'Academic 2.1', 'references': [] }, { 'name': 'BSD', 'references': [] }, { 'name': 'BSD 3', 'references': [] }]
        }
      ]
      const expectedOutput = []
      let actualOutput = depsExtractor.extractDependenciesToExtendedReferenceFormat({
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
      actualOutput = depsExtractor.extractDependenciesToExtendedReferenceFormat({
        whitesourceLibraries: inputMissingVersionKey

      })
      expect(actualOutput)
        .toEqual(expectedOutput)

      const inputMissingLicenseKey = [
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
          'version': '0.2.3',
          'groupId': 'json-schema',
          'THIS_IS_NOT_THE_LICENSES_KEY': [{ 'name': 'Academic 2.1', 'references': [] }, { 'name': 'BSD', 'references': [] }, { 'name': 'BSD 3', 'references': [] }]
        }
      ]
      actualOutput = depsExtractor.extractDependenciesToExtendedReferenceFormat({
        whitesourceLibraries: inputMissingLicenseKey

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

describe('extractDependenciesToReferenceFormat', () => {
  it('reads dependencies names from the groupId, when called with a parameter specifying this, and when the inventory elements have the groupId filled in',
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
          'name': 'json-schema',
          'version': '0.2.3'
        },
        {
          'name': 'org.jetbrains',
          'version': '13.0'
        }
      ]
      const actualOutput = depsExtractor.extractDependenciesToReferenceFormat({
        whitesourceLibraries: input,
        readNameFromGroupId: true
      })
      expect(actualOutput)
        .toEqual(expectedOutput)
    })

  it('returns an empty array when the groupId key is missing and a parameter specifies it should read the name from groupId',
    () => {
      const input = [
        {
          'keyUuid': 'keyUuid-0',
          'type': 'Unknown Library',
          'productName': 'product name',
          'projectName': 'project name',
          'directDependency': true,
          'matchType': 'Exact Match',
          'sha1': 'some_sha_value',
          'name': 'fixtures.tgz',
          'artifactId': 'fixtures.tgz',
          'licenses': [
            {
              'name': 'Unspecified License',
              'references': []
            }
          ]
        }
      ]
      const expectedOutput = [
      ]
      const actualOutput = depsExtractor.extractDependenciesToReferenceFormat({
        whitesourceLibraries: input,
        readNameFromGroupId: true
      })
      expect(actualOutput)
        .toEqual(expectedOutput)
    })

  it('when called with a parameter that specifies it should read the name from groupId, returns a dependencies array containing the dependency name as it appears in whitesource\'s library name (unprocessed), if:' +
    '- the groupId is empty' +
    '- the version is not empty' +
    '- the name keyvalue does not contain the -<version> substring',
  () => {
    const inputLibrariesVersionNotSubstringInName = [
      {
        'keyUuid': 'keyUuid-0',
        'type': 'Source Library',
        'productName': 'product-1',
        'projectName': 'project-3',
        'description': 'Node.js JavaScript runtime :sparkles::turtle::rocket::sparkles:',
        'directDependency': true,
        'matchType': 'Best Match',
        'sha1': 'sha-value-0',
        'name': 'io.js',
        'artifactId': 'io.js',
        'version': 'v0.9.2',
        'groupId': 'iojs',
        'licenses': [{ 'name': 'MIT X11', 'references': [] }, { 'name': 'BSD 3', 'references': [] }, { 'name': 'GPL 2.0', 'references': [] }]
      }
    ]
    const expectedOutput = [
      {
        name: 'iojs',
        version: 'v0.9.2'
      }
    ]
    const actualOutput = depsExtractor.extractDependenciesToReferenceFormat({
      whitesourceLibraries: inputLibrariesVersionNotSubstringInName,
      readNameFromGroupId: true
    })
    expect(actualOutput)
      .toEqual(expectedOutput)
  }
  )

  it('when called with a parameter that specifies it should read the name from groupId, returns an array of dependencies (name, version) with the (unprocessed) name as it appears in whitesource, if:' +
    '- the groupId is empty' +
    '- the version is empty',
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
      whitesourceLibraries: inputWithEmptyVersion,
      readNameFromGroupId: true
    })
    expect(actualOutput)
      .toEqual(expectedOutput)
  })
})
