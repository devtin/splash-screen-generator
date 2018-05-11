import test from 'ava'

process.chdir(__dirname)

const ssg = require('../../')

test('Works', async t => {
  return ssg(ssg.formats.ios, {
    destination: './splash', // folder where to store the generated files
    backgroundColor: '#27BAB4', // splash background color
    logo: './logo.png',
    // rel: 'apple-touch-startup-image',
    rotate: false // defaults to true
  }).then(metaHead => {
    t.true(Array.isArray(metaHead))
    t.log(metaHead[0])
  })
})
