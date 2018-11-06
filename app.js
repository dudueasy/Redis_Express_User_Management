require('dotenv').config()
const app = require('express')()


const PORT = process.env.SERVER_PORT 

app.use('*',(req, res, next)=>{
  res.send('<h1>Hello World</h1>')
})

app.listen(PORT, ()=>{
  console.log(`server is running on ${PORT}`)
})

