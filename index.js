const gm = require('gm')
const mkdirp = require('mkdirp')
const path = require('path')

mkdirp('./tmp')

const _ = require('lodash')
const iOS = {
  statusBar: 20,
  dimensions: [
    {
      width: 768,
      height: 1024,
      depth: 2,
      label: 'iPad'
    },
    {
      width: 768,
      height: 1024,
      depth: 1,
      label: 'iPad retina'
    },
    {
      width: 414,
      height: 736,
      depth: 3,
      label: 'iPhone 6 Plus'
    },
    {
      width: 320,
      height: 568,
      depth: 2,
      label: 'iPhone 5'
    }
  ]
}

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

function compose (dimensionsBundle) {
  const { statusBar, dimensions } = dimensionsBundle
  const newSizes = []

  dimensions.forEach(size => {
    const landscape = Object.assign({}, size)

    const { width, height } = landscape

    landscape.width = height
    landscape.height = width

    newSizes.push(sanitizeSize(size, statusBar))
    newSizes.push(sanitizeSize(landscape, statusBar))
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

async function createSplash (dimension, { logo, logoDimensions, destination, backgroundColor, logoScale = .3, logoMargin = 0 } = {}) {
  const { crop } = dimension
  const fileName = dimensionFilename(dimension)
  const file = path.resolve(process.cwd(), destination, fileName)

  // console.log({ logo })
  const newLogoWidth = (crop.width * logoScale)

  const logoSize = {
    width: newLogoWidth,
    height: Math.round(newLogoWidth * logoDimensions.height / logoDimensions.width)
  }

  const genInitialFile = async () => {
    return new Promise((resolve, reject) => {
      gm(logo)
      .resize(logoSize.width, logoSize.height)
      .crop(crop.width, crop.height)
      /*
       .background(backgroundColor)
       */
      .write(file, async (err, res) => {
        if (err) {
          return reject(err)
        }

        resolve(res)
      })
    })
  }

  return new Promise(async (resolve, reject) => {
    // await genInitialFile()
    // console.log({ logoSize })
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
      href: path.join(publicPath, dimensionFilename(dimension)),
      media,
      rel
    })
  })
  return head
}

async function generate (dimensionsBundle, { logo, destination = './tmp', backgroundColor } = {}) {
  const dimensions = compose(dimensionsBundle)
  const generation = []

  const logoDimensions = await getImageDimensions(logo)

  // console.log({ logoDimensions })

  dimensions.forEach(dimension => {
    generation.push(createSplash(dimension, { logo, logoDimensions, destination, backgroundColor }))
  })

  return Promise
  .all(generation)
  .then(() => {
    return generateMetaHead(dimensions)
  })
}

module.exports = generate

_.merge(module.exports, {
  formats: {
    iOS
  },
  compose,
  getImageDimensions
})
