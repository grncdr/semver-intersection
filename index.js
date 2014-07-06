'use strict';

var semver = require('semver');

module.exports = intersect;

function intersect (ranges) {
  var intersection = ranges.map(function normalizeRange (range) {
    var vrange = semver.validRange(range);
    if (vrange === null) {
      throw new TypeError('Invalid range: ' + range);
    }
    if (vrange === '*') {
      return null;
    }
    vrange = vrange.split(' ');

    if (vrange.length === 1) {
      var it = vrange[0];
      // exact version
      if (semver.valid(it)) {
        vrange = ['>=' + it, '<' + minimalIncrement(it)];
      }
      else if (it.charAt(0) === '<') {
        vrange.unshift(null);
      } else {
        vrange.push(null);
      }
    }
    return vrange;
  }).filter(Boolean).reduce(function findOverlap (intersection, range) {
    if (!range) {
      return intersection;
    }
    range.forEach(function (bound) {
      if (!bound) return;

      if (isLowerBound(bound) &&
          (!intersection[0] ||
           lowerBoundGreaterThan(intersection[0], bound)))
      {
        intersection[0] = bound;
      }

      if (isUpperBound(bound) &&
          (!intersection[1] ||
           upperBoundLessThan(intersection[1], bound)))
      {
        intersection[1] = bound;
      }
    });
    return intersection;
  }, new Array(2)).filter(Boolean);

  return rangeExists(intersection);
}

function isLowerBound (bound) { return bound.charAt(0) === '>'; }
function isUpperBound (bound) { return bound.charAt(0) === '<'; }

var BoundPartsRgx = /^([\D]+)(.+)$/;

function lowerBoundGreaterThan (a, b) {
  if (a === b) {
    return false;
  }
  a = a.match(BoundPartsRgx);
  b = b.match(BoundPartsRgx);
  var versionDiff = semver.compare(a[2], b[2]);
  if (versionDiff) {
    return versionDiff === -1;
  }
  // a strict gt is more constraining than a gte
  return a[1] === '>=';
}

function upperBoundLessThan (a, b) {
  if (a === b) {
    return false;
  }
  a = a.match(BoundPartsRgx);
  b = b.match(BoundPartsRgx);
  var versionDiff = semver.compare(a[2], b[2]);
  if (versionDiff) {
    return versionDiff === 1;
  }
  // a strict lt is more constraining than a lte
  return a[1] === '<=';
}

function minimalIncrement (version) {
  // exact version, generate the lowest possible version that still
  // sorts higher than this.
  if (version.match('-')) {
    // when tagged, just append a 0
    return version + '0';
  } else {
    // otherwise, bump the patch version and add the lowest possible tag
    return semver.inc(version, 'patch') + '-0';
  }
}

function rangeExists (range) {
  if (!range[0]) return range[1] || false;
  if (!range[1]) return range[0] || false;

  var lower = range[0].match(BoundPartsRgx);
  var upper = range[1].match(BoundPartsRgx);

  var diff = semver.compare(lower[2], upper[2]);
  if (diff < 0) {
    return range.join(' ');
  }
  else if (diff === 0 && lower[1] === '>=' && lower[1] === '<=') {
    return range.join(' ');
  }
  else {
    return false;
  }
}

intersect(['^2.1.4', '^3.0.0']);
