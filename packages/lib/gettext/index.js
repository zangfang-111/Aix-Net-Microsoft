var gettextParser = require('gettext-parser')
var input = require('fs').readFileSync(`${__dirname}/en.po`)
var po = gettextParser.po.parse(input)

// export the default context
export default po.translations['']
