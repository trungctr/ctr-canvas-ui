const path = require('path')
const express = require('express')
const mg = require('morgan')
const app = express()
const port = 8901

app.use(
	mg(
		'{\n user_IP: :remote-addr \n remote_user: :remote-user \n time: :date[clf] \n method: :method \n url: :url \n httpversion: :http-version \n status: :status\n res: :res[content-length] \n ref: :referrer \n user agent: :user-agent \n response time: :response-time[digits] ms \n total time: :total-time[digits] ms\n}'
	)
)
app.use(express.static('src/public'))

app.listen(port, () => {
	console.log(`App listening on port ${port}`)
})
