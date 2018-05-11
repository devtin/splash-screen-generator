import test from 'ava'
import SplashScreenGenerator from '../'
import _ from 'lodash'
import path from 'path'

const resolveSrc = file => {
  return path.join(__dirname, './src', file)
}

test('Resizes image', async t => {
  const size = await SplashScreenGenerator.getImageDimensions('./pixel.png')
  t.true(typeof size === 'object')
  t.true(size.hasOwnProperty('width'))
  t.true(size.hasOwnProperty('height'))
  t.is(size.width, 1)
  t.is(size.height, 1)
})

test('Compose dimensions', async t => {
  t.true(typeof SplashScreenGenerator === 'function')
  t.true(typeof SplashScreenGenerator.formats.iOS === 'object')
  t.true(SplashScreenGenerator.formats.iOS.hasOwnProperty('statusBar'))
  t.true(SplashScreenGenerator.formats.iOS.hasOwnProperty('dimensions'))

  const splashScreens = SplashScreenGenerator.compose(SplashScreenGenerator.formats.iOS)

  t.true(Array.isArray(splashScreens))
  t.is(splashScreens.length, SplashScreenGenerator.formats.iOS.dimensions.length * 2)

  const sampleSplash = _.sample(splashScreens)
  t.true(typeof sampleSplash === 'object')
  t.true(sampleSplash.hasOwnProperty('width'))
  t.true(sampleSplash.hasOwnProperty('height'))
  t.true(sampleSplash.hasOwnProperty('crop'))
  t.true(typeof sampleSplash.crop === 'object')
  t.true(sampleSplash.crop.hasOwnProperty('width'))
  t.true(sampleSplash.crop.hasOwnProperty('height'))

  // console.log({ sampleSplash })

  const metaHead = await SplashScreenGenerator(SplashScreenGenerator.formats.iOS, {
    backgroundColor: '#ffcc00',
    logo: resolveSrc('logo-full.png')
  })

  // const metaHead = await t.notThrows()
  console.log({ metaHead })
  t.true(Array.isArray(metaHead))
})
