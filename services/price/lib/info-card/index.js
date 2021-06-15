import pug from 'pug'
import puppeteer from 'puppeteer'
import aws from 'aws-sdk'
import fs from 'fs'
const path = require('path')
const debug = require('debug')('AiX:services:price:lib:info-card')

let compiledTemplate = pug.compileFile(
  `${__dirname}/template/info-card.pug`
)
const clipRect = {
  x: 4,
  y: 2,
  width: 805,
  height: 295
}

// const MAX_WAIT_TIME_FOR_CARD = 3 * 1000
let fileCache = {}
const basePath = `${__dirname}/tmp`
if (!fs.existsSync(basePath)) {
  debug(`The path ${basePath} does not exist! Trying to create it`)
  try {
    fs.mkdirSync(basePath)
  } catch (err) {
    // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
    if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
      throw new Error(`EACCES: permission denied, mkdir '${basePath}'`)
    }

    const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1
    if (!caughtErr || (caughtErr && basePath === path.resolve(basePath))) {
      throw err // Throw if it's just the last created dir.
    }
  }
}

const fileToBase64 = (file) => {
  if (fileCache[file]) {
    return fileCache[file]
  }
  const fileContent = fs.readFileSync(file)
  fileCache[file] = Buffer.from(fileContent).toString('base64')
  return fileCache[file]
}

export const generateCardImage = content => new Promise(async (resolve, reject) => {
  const filePath = `${basePath}/${Date.now()}.png`
  const templateVars = {
    ...content,
    poppinsUrl: `data:font/truetype;charset=utf-8;base64,${fileToBase64(`${__dirname}/template/Poppins/Poppins-Regular.otf`)}`,
    poppinsBoldUrl: `data:font/truetype;charset=utf-8;base64,${fileToBase64(`${__dirname}/template/Poppins/Poppins-Bold.otf`)}`,
    poppinsSemiBoldUrl: `data:font/truetype;charset=utf-8;base64,${fileToBase64(`${__dirname}/template/Poppins/Poppins-SemiBold.otf`)}`
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.CHROME_BIN || null,
      args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage']
      // args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage()
    await page.setContent(compiledTemplate(templateVars))
    await page.screenshot({ path: filePath, clip: clipRect, omitBackground: true })
    await browser.close()
    resolve(filePath)
  } catch (error) {
    debug('Error puppeteer')
    debug(error)
    reject(error)
  }
})

export const uploadImageToS3 = pathToImage => new Promise((resolve, reject) => {
  let s3 = new aws.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
  })

  fs.readFile(pathToImage, (err, data) => {
    if (err) {
      debug('fs.ReadFile returned ERR:', err)

      return reject(new Error('File read failed.'))
    }

    let params = {
      Body: data,
      ACL: 'public-read',
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: pathToImage,
      ContentType: 'png'
    }

    s3.upload(params, (err, data) => {
      if (err) {
        debug('s3.upload returned ERR:', err)
        return reject(new Error('File upload failed.'))
      }
      let fileUrl = data.Location
      resolve(fileUrl)
      // fs.unlink(pathToImage)
    })
  })
})
