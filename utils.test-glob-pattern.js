const Minimatch = require('minimatch').Minimatch

/**
 * @util test glob pattern
 *
 * @param {Array<string>} patterns
 * @param {string} target
 * @return {boolean} result
 */
function testGlobPattern(patterns, target) {
  const negatePatternMatchers = []

  const nonNegatePatternMatchers = []

  // identify negate patterns
  patterns.forEach(pattern => {
    const patternMatcher = new Minimatch(pattern, { dot: true })
    if (patternMatcher.negate) {
      negatePatternMatchers.push(patternMatcher)
    } else {
      nonNegatePatternMatchers.push(patternMatcher)
    }
  })

  // compare negate pattern
  for (const patternMatcher of negatePatternMatchers) {
    if (!patternMatcher.match(target)) {
      return false
    }
  }

  // compare non negate pattern
  for (const patternMatcher of nonNegatePatternMatchers) {
    if (patternMatcher.match(target)) {
      return true
    }
  }

  return false
}

module.exports = {
  testGlobPattern,
}
