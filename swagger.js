const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'
const endpointsFiles = ['./app/routes/router', './app/routes/private.route']

swaggerAutogen(outputFile, endpointsFiles)