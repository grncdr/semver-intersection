# semver-intersection

Find the intersection of 2 semver ranges.

## Synopsis

```javascript
var assert = require('assert');
var intersect = require('./'); // [Function intersect]
```

This module exports a single function `intersect` that takes an array of semver
ranges and returns a single range that represents the intersection.

```javascript
assert.equal(intersect(['2.5.x', '^2.3.1']), '>=2.5.0-0 <2.6.0-0');
```

A useful property of the intersection is that it's a semver range that will
satisfy all of the input ranges.

Of course, a specific version also represents a valid range:

```javascript
assert.equal(intersect(['1.2.1']), '>=1.2.1 <1.2.2-0');
```

You can include as many ranges as you like:

```javascript
assert.equal(intersect(['^2.1.4', '^2.3.1', '<4.0.0']), '>=2.3.1-0 <3.0.0-0');
```

If there is no intersection between the two ranges, `intersect` will return
`false`:

```javascript
assert.equal(intersect(['^2.1.4', '^3.0.0']), false);
```

## License

MIT
