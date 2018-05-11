# splash-screen-generator

Generates splash screens for your PWA's!

## Installation
``` bash
$ npm install splash-screen-generator
```

## Usage
``` js
const ssg = require('splash-screen-generator')

ssg(ssg.formats.ios, {
    // folder where to store the generated files
    destination: './splash',
    
    // Default size of the logo respect with the canvas
    // default .3
    logoScale: .5,
    
    // splash background color
    backgroundColor: '#27BAB4',
    
    // location of the logo
    logo: './logo.png',
    
    // rel: 'apple-touch-startup-image',
    
    rotate: false // defaults to true
  }).then(metaHead => {
    // t.true(Array.isArray(metaHead))
    console.log(metaHead)
  })
  
/*
[ 
  ...
  { href: '/splash/i-pad-retina-portrait-768-1024@1x.png',
    media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 1) and (orientation: portrait)',
    rel: 'apple-touch-startup-image' },
  ...
]
*/ 
```


## Use it with Nuxt
``` js
// nuxt.config.js
module.exports = {
  ...
  head: {
    link: ssg(ssg.formats.ios, {
      destination: './client/static/splash',
      backgroundColor: '#27BAB4',
      logo: './client/static/logo.png',
    })
  }
  ... 
}
```

## TODO

- Add more formats
- Add position support for logo
