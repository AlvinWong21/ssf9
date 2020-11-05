//load libraries
const express = require('express')
const handlebars = require('express-handlebars')
const fetch = require('node-fetch')
const withQuery = require('with-query').default
const md5 = require('md5')

//configure PORT
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

//create an instance of express
const app = express()

//configure handlebars
app.engine('hbs', handlebars({defaultLayout: 'default.hbs'}))
app.set('view engine', 'hbs')

//declare API parameters
const BASE_URL = "https://gateway.marvel.com/"
const CHARACTERS = "v1/public/characters"
const PUB_KEY = "f4d07c26c04c3938b8b72d67d3e84934"
const PVT_KEY = "c3641c2ccfdccdf3cd30b82a592ea9a81a006a0e"
let charId = 0
//apps
app.get('/', (req, resp) => {
    resp.status(200)
    resp.type('text/html')
    resp.render('index')
})

app.get('/search', async (req, resp) => {
    let ts = new Date().getTime()
    let hash = md5(ts+PVT_KEY+PUB_KEY)
    let searchName = req.query['charName']
    let url = withQuery(
        BASE_URL + CHARACTERS, 
        {
            ts, 
            apikey: PUB_KEY,
            hash,
            limit: 100,
            nameStartsWith: searchName,
        }
    )

    console.info(url)
    
    let searchResult = await fetch(url)
    searchResult = await searchResult.json()

    const resultEntries = searchResult.data.results

    // const searchResultII = searchResult.data.results
    // const resultEntries = searchResultII.map(v => {return {name: v.name, thumbnail: v.thumbnail, charId: v.id}})

    resp.status(200)
    resp.type('text/html')
    resp.render('search', {resultEntries, searchName})
})

// app.get('/characters/:id', async (req, resp) => {
//     let ts = new Date().getTime()
//     let hash = md5(ts+PVT_KEY+PUB_KEY)
//     let charId = req.params.id
//     console.info(`>> ${charId} <<`)
//     resp.status(200)
//     resp.type('text/html')
//     resp.render('characters')
// })

app.get('/characters/:charId', async (req, resp) => {
    let ts = new Date().getTime()
    let hash = md5(ts+PVT_KEY+PUB_KEY)
    const charId = req.params.charId
    console.info(charId)
    let url = withQuery(
        BASE_URL + CHARACTERS + `/${charId}`, 
        {
            ts, 
            apikey: PUB_KEY,
            hash
        })
    let result = await fetch(url)
    result = await result.json()
    let charInfo = result.data.results[0]
    // console.info(url)
    // console.info(charInfo)

    const charName = charInfo.name
    const charImg = charInfo.thumbnail.path
    const charImgEx = charInfo.thumbnail.extension
    const comicsAvail = charInfo.comics.available
    const comicsLink = charInfo.comics.collectionURI
    const seriesAvail = charInfo.series.available
    const seriesLink = charInfo.series.collectionURI
   

    console.info(charName)
    console.info(charImg)
    console.info(comicsLink)
    
    resp.status(200)
    resp.type('text/html')
    resp.render('characters', {charName, charImg, charImgEx, comicsAvail, comicsLink, seriesAvail, seriesLink})
})

//load statics
app.use(express.static(__dirname + "/static"))

//start app server
app.listen(PORT, () => {
    console.info(`Application started at port ${PORT} on ${new Date()}.`)
})