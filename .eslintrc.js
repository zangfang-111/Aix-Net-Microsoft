var path = require('path')

module.exports = {
    "env": {
		"node": true,
		"commonjs": true,
		"es6": true,
		"jquery": false,
		"jest": true,
		"jasmine": true
	},
    "extends": [
        "standard",
        "plugin:security/recommended"
	],
    "rules": {
        "semi": ["error", "never"],
        "import/prefer-default-export": false,
        "import/first": false,
        "global-require": "error"
    },
    settings: {
        'import/resolver': {
            'eslint-import-resolver-lerna': {
                packages: path.resolve(__dirname, 'services/')
            }
        }
    }
}
