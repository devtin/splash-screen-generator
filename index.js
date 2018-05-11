const gm = require('gm')
const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')
const _ = require('lodash')

const formatsLib = path.resolve(__dirname, './lib/formats')
const formats = {}

// load formats
fs.readdirSync(formatsLib).forEach(format => {
  _.merge(formats, { [path.parse(format).name]: require(path.join(formatsLib, format)) })
})

function sanitizeSize (sizeObj, statusBar) {
  const orientation = sizeObj.width <= sizeObj.height ? 'portrait' : 'landscape'

  return _.merge({}, sizeObj, {
    orientation,
    crop: {
      width: sizeObj.width * sizeObj.depth,
      height: (sizeObj.height - statusBar) * sizeObj.depth,
      media: `(device-width: ${sizeObj.width}px) and (device-height: ${sizeObj.height}px) and (-webkit-device-pixel-ratio: ${sizeObj.depth}) and (orientation: ${orientation})`
    }
  })
}

function compose (dimensionsBundle, { rotate = true } = {}) {
  const { statusBar, dimensions } = dimensionsBundle
  const newSizes = []

  dimensions.forEach(size => {
    const rotated = Object.assign({}, size)

    const { width, height } = rotated

    rotated.width = height
    rotated.height = width

    newSizes.push(sanitizeSize(size, statusBar))
    rotate && newSizes.push(sanitizeSize(rotated, statusBar))
  })

  return newSizes
}

function dimensionFilename (dimension) {
  return _.kebabCase(dimension.label + ' ' + dimension.orientation) + `-${dimension.width}-${dimension.height}@${dimension.depth}x.png`
}

async function getImageDimensions (img) {
  return new Promise((resolve, reject) => {
    gm(img)
      .size((err, value) => {
        if (err) {
          return reject(err)
        }
        resolve(value)
      })
  })
}

async function createSplash (dimension, { logo, logoDimensions, destination, backgroundColor, logoScale = 0.3 } = {}) {
  const { crop } = dimension
  const fileName = dimensionFilename(dimension)
  const file = path.join(destination, fileName)

  // console.log({ logo })
  const newLogoWidth = (crop.width * logoScale)

  const logoSize = {
    width: newLogoWidth,
    height: Math.round(newLogoWidth * logoDimensions.height / logoDimensions.width)
  }

  return new Promise(async (resolve, reject) => {
    gm(logo)
      .resize(logoSize.width, logoSize.height)
      .background(backgroundColor)
      .gravity('Center')
      .extent(crop.width, crop.height)
      .write(file, async (err, res) => {
        if (err) {
          return reject(err)
        }

        // console.log(`file ${file} written`)

        resolve(res)
      })
  })
}

function generateMetaHead (dimensionsBundle, { publicPath = '/splash/', rel = 'apple-touch-startup-image' } = {}) {
  const head = []

  dimensionsBundle.forEach(dimension => {
    const { crop: { media } } = dimension
    head.push({
      href: path.join(path.dirname(publicPath + '/.'), dimensionFilename(dimension)),
      media,
      rel
    })
  })
  return head
}

async function generate (dimensionsBundle, { publicPath, logo, destination, backgroundColor, rel, rotate, logoScale } = {}) {
  logo = path.resolve(process.cwd(), logo)
  destination = path.resolve(process.cwd(), destination)

  if (!fs.existsSync(destination)) {
    mkdirp(destination)
  }

  const dimensions = compose(dimensionsBundle, { rotate })
  const generation = []

  const logoDimensions = await getImageDimensions(logo)

  // console.log({ logoDimensions })

  dimensions.forEach(dimension => {
    generation.push(createSplash(dimension, { logo, logoDimensions, destination, backgroundColor, logoScale }))
  })

  return Promise
    .all(generation)
    .then(() => {
      return generateMetaHead(dimensions, { publicPath, rel })
    })
}

module.exports = generate

_.merge(module.exports, {
  formats,
  compose,
  getImageDimensions
})
