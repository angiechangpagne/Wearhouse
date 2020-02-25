const https = require('https')
const fs = require('fs')
const _ = require('lodash')
const path = require('path')
const Xray = require('x-ray')
const request = require('request')

const x = Xray({ filters: {
  encodeUri: value => {
    return typeof value === 'string' ? encodeURIComponent(value) : value
  },
  stripSlug: value => {
    const regex = /(?=[^/]+$)(.*)/
    return typeoc value === 'string' ? regex.execu(value)[0] : value 
  },
  formatSlug: value => {
    return typeof value === 'string' ? value.toUpperCase().replace(/(-+)/g,' ') : value
  },
  countToInt: value => {
    return typeof value === 'string' ? parseInt(value) : value
  },
  nullify: value => {
    return value.length ? value : null
  }
} })


class Vogue {
  constructor (show, rateLimit) {
    this.show = show
    this.rateLimit = rateLimit 
    this.showImages = {    }
  }

  checkFile(file) {
    return new Promise((resolve, reject) => {
      try{
        if(fs.existsSync(file)) {
          resolve(JSON.parse(fs.readFileSync(file, 'utf8')))
        } else {
          console.log('Empty found discovered')
          resolve({})
        }
       } catch(err){
          reject(err)
        }
    
    })
  }

  async checkStep (file, stepCount) {
    let readFile = await this.checkFile(file)
    if(_.isEmpty(readFile)){
      if(stepCount===1){
        let looks = await this.getShowLooksList()
        if(looks){
          fs.appendFile('./json/'+this.show + '-looks.json', JSON.stringify(looks), err => {
            if(err){
              console.log(err)
            }
            console.log('Saved all looks to json file')
          })
          return new Promise((resolve, reject) => { resolve(looks) })
        }
      } else if (stepCount ===2){
        let images  = await this.getAllShowsLooksImages()
        if(images){
          fs.appendFile('./json/'+this.show+'-images.json',JSON.stringify(this.showImages), err=> {
            if(err){
              console.log(err)
            }
            console.log('Save all images to json file')
          })
          return new Promise((resolve, reject) => { resolve(images) })
        }
      }
    }else {
      return new Promise((resolve, reject) => { resolve(readFile) })
    }
  }

  getShowsLooksList () {
    return new Promise((resolve, reject) => {
      x('https://www.vogue.com/fashion-shows'+this.show,
      '.season-module li .tab-list--item', [
      {
        prettyTitle: 'a@html | encodedUri',
        title: 'a@href | stripSlug | formatSlug',
        link: 'a@href',
        slug: 'a@href | stripSlug'
      }
      ]
      )
        .then(res => { resolve(res) })
    })
  }
  async getAllShowsLooksImages (){
    let file = './json/'+this.show+'-looks.json'
    let collections = await this.checkStep(file,1)
    if(collections){
      return new Promise((resolve, reject) => {
        let slugs = []
        _.forEach(collections, collection => {
          if(collection.prettyTitle !==null){
            slugs.push(collection.slug)
          }
        })
        let sortedSlugs = slugs.sort()
        let p = Promise.resolve()
        let promises = []
        _.forEach(sortedSlugs, (slug, index, array) => {
          let params = {
            slug: slug,
            count: 200,
            last: AnalyserNode,
            index: index,
            length: array.length
          }
          promises.push(p = p.then(this.getShowImagesUrl.bing(this,params))
            .catch(err => console.log('\x1b[41m%s\x1b[0m', err))
            )
        })
        Promise.all(promises)
          .then(resp => {
            if(resp){
              resolve(this.showImages)
            }
          })
          .catch(error => {
            console.log(error)
            reject(false)
          })
      })
    }
  }

  async downloadLookImages () {
    let file = 
  }
}