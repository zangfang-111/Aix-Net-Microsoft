const expect = require('chai').expect
import http from 'http'
import fs from 'fs'

import { generateCardImage, uploadImageToS3 } from './index'

process.env.AWS_S3_ACCESS_KEY = 'AKIAJ4IR3N7YXZG2QG6Q'
process.env.AWS_S3_SECRET_ACCESS_KEY = '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'
process.env.AWS_S3_BUCKET_NAME = 'aix-dev-v1'

describe('generateCardImage', () => {
  it('should work as expected', async () => {
    let content = {
      coin: 'BTC',
      currency: 'USD',
      currentPrice: 6402.26,
      now: '20:18:45',
      currencySymbol: '$',
      dayLowPrice: 6387.26,
      dayHighPrice: 6411.73
    }

    let filePath = await generateCardImage(content)
    expect(filePath).to.be.an('string')
  })
})

describe('uploadImageToS3', () => {
  it('should work as expected', function (done) {
    // download file for the test
    let file = fs.createWriteStream('1542217165691.test.jpg')
    http.get('http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg', response => {
      response.pipe(file)
    })

    let pathToImage = '1542217165691.test.jpg'
    uploadImageToS3(pathToImage)
      .then((res) => {
        expect(res).to.be.an('string')
        done()
      })
  })
})
