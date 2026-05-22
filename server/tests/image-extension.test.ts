import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getImageExtension } from '../src/utils/image-extension'

test('maps supported image content types to file extensions', () => {
  assert.equal(getImageExtension('image/jpeg'), 'jpg')
  assert.equal(getImageExtension('image/png'), 'png')
  assert.equal(getImageExtension('image/webp'), 'webp')
})

test('uses bin extension for unknown content types', () => {
  assert.equal(getImageExtension('application/octet-stream'), 'bin')
})
