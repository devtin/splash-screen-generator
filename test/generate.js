import test from 'ava'
import rimraf from 'rimraf'
import mkdirp from 'mkdirp'
import SplashScreenGenerator from '../'
import _ from 'lodash'
import path from 'path'

const resolveSrc = file => {
  return path.join(__dirname, './src', file)
}

const tmpDir = path.join(__dirname, './tmp')

test.before(async () => {
  rimraf.sync(tmpDir)
  mkdirp(tmpDir)
})

test.after(async () => {
})

test('Resizes image', async t => {
  const size = await SplashScreenGenerator.getImageDimensions(resolveSrc('pixel.png'))
  t.true(typeof size === 'object')
  t.true(size.hasOwnProperty('width'))
  t.true(size.hasOwnProperty('height'))
  t.is(size.width, 1)
  t.is(size.height, 1)
})

test('Compose dimensions', async t => {
  t.true(typeof SplashScreenGenerator === 'function')
  t.true(typeof SplashScreenGenerator.formats.ios === 'object')
  t.true(SplashScreenGenerator.formats.ios.hasOwnProperty('statusBar'))
  t.true(SplashScreenGenerator.formats.ios.hasOwnProperty('dimensions'))

  const splashScreens = SplashScreenGenerator.compose(SplashScreenGenerator.formats.ios)

  t.true(Array.isArray(splashScreens))
  t.is(splashScreens.length, SplashScreenGenerator.formats.ios.dimensions.length * 2)

  const sampleSplash = _.sample(splashScreens)
  t.true(typeof sampleSplash === 'object')
  t.true(sampleSplash.hasOwnProperty('width'))
  t.true(sampleSplash.hasOwnProperty('height'))
  t.true(sampleSplash.hasOwnProperty('crop'))
  t.true(typeof sampleSplash.crop === 'object')
  t.true(sampleSplash.crop.hasOwnProperty('width'))
  t.true(sampleSplash.crop.hasOwnProperty('height'))
})

test('Generate files', async t => {
  const metaHead = await SplashScreenGenerator(SplashScreenGenerator.formats.ios, {
    destination: tmpDir,
    backgroundColor: '#27BAB4',
    logo: resolveSrc('logo-full.png')
  })

  const fs = require('fs')

  t.true(Array.isArray(metaHead))
  const files = fs.readdirSync(tmpDir)
  t.is(files.length, metaHead.length)
  const sep = `\n`
  t.log(`Written in ${tmpDir}:${sep}${files.join(sep)}`)
})
