const path = require('path')
const axios = require('axios')
const crypto = require('crypto')
const https = require('https')
const fs = require('fs')
const slugify = require('slugify')
const _ = require('lodash')
const csv = require('csvtojson')
const FormData = require("form-data");

const csvFilePath = path.join(__dirname, "importData", "PLACE-Grid_view.csv")

const instance = axios.create({
  baseURL: 'http://localhost:1337/api',
  timeout: 20000,
  headers: { 'Authorization': 'Bearer c20f5caa173535b804f7a0ae5a06c9296d299d1c51093901f266440e396bf996d76b635140f51ee0d3851edce69b86226d020ef75b530a15ea634e24ae7a3a44811b35da82cdced0c8bdb28fbcafbf9edfde2d2392f72079c18a329b43e7c96dac44d0978fe2135dc5be0df86b399a8916738f9ff56a6bc604884448fc93dc4f' }
});

let masterData = {

}

async function loadMaster(name) {
  let result = await instance.get("/" + name, {
    params: {
      "pagination[limit]": -1
    }
  })
  let data = result.data.data ? result.data.data : result.data
  masterData[name] = data
  return data
}

async function initMasterData() {
  return Promise.all([
    loadMaster("upload/files"),
    loadMaster("banks"),
    loadMaster("categories"),
    loadMaster("sacred-types"),
    loadMaster("place-types"),
    loadMaster("regions"),
    loadMaster("provinces"),
    loadMaster("chinese-zodiacs"),
  ])
}

function findInMaster(type, data, findType="=") {
  if (Array.isArray(data)) {
    return data.map(dataValue => {
      if (!dataValue) return null
      let find = null
      if(findType=="="){
        find = masterData[type].find(o => o.attributes.name == _.trim(dataValue))
      }else{
        find = masterData[type].find(o => o.attributes.name.search(_.trim(dataValue)) != -1)
      }
      if (!find) console.log("---"+type+">", dataValue)

      return find.id
    }).filter(o => o)
  } else {
    let find = null


    if(findType=="="){
      find = masterData[type].find(o => {
        let attributes = o.attributes ? o.attributes : o
        return attributes.name == _.trim(data)
      })
    }else{
      find = masterData[type].find(o => {
        let attributes = o.attributes ? o.attributes : o
        return attributes.name.search(_.trim(data)) != -1
      })
    }

    if (!find) console.log("---"+type+">", data)

    return find ? find.id : null
  }
}

function findBank(DONATION) {
  if(!DONATION) return []

  let _text = DONATION.split(" ").filter(o => o).filter(o => o != ":")
  let _bank = _text[0]
  let account = _text[2]
  let no = _text[4]

  if(_bank=="ธนาคารธกส") _bank = "ธนาคารอาคารสงเคราะห์"

  let bankId = findInMaster("banks", _bank)

  return [{
    "account": account,
    "no": no,
    "bank": bankId
  }]
}

function download(url) {
  return new Promise((resolve, reject) => {
      var hash = crypto.createHash("sha1");
      console.log(url)
      hash.update(url);
      const urlHash = hash.digest("hex");

      const urls = url.split("/");
      const fileName = urls[urls.length - 1];

      const fileNames = fileName.split(".");
      const fileExt = fileNames[fileNames.length - 1];

      const destCheck = path.join(__dirname, "download");

      if(!fs.existsSync(destCheck)){
          fs.mkdirSync(destCheck);
      }

      const dest = path.join(__dirname, "download", urlHash + "." + fileExt);

      var request = https.get(url, function (response) {

          const file = fs
          .createWriteStream(dest)
          .on("finish", () => {
              // let _file = fs.createReadStream(dest)
              resolve({
                  // file: _file,
                  fileName,
                  fileExt,
                  urlHash,
                  path: dest
              });
          });

          response.pipe(file);
      }).on("error", function (err) { // Handle errors
          fs.unlink(dest, () => {
          }); // Delete the file async. (But we don't check the result)\

          reject(err);
      });

  });
}

function findGallery(text) {
  if(!text) return []

  let _text = text.split(",").map(text=>{

    let [name, urlText] = text.split(" ")
    urlText = _.trim(urlText, "(")
    urlText = _.trim(urlText, ")")

    return urlText
  })

  return _text
}

csv()
  .fromFile(csvFilePath)
  .then(async (jsonObj) => {

    await initMasterData()

    // console.log(JSON.stringify(jsonObj, null, 2))
    // return

    // instance.post("/places", {
    //   "data": {
    //     "name": "string",
    //     "fullname": "string",
    //     "sacredTypes": [
    //       "string or id",
    //       "string or id"
    //     ],
    //     "howtoPray": "string",
    //     "masterReview": "string",
    //     "galleries": [
    //       "string or id",
    //       "string or id"
    //     ],
    //     "bankAccounts": [
    //       {
    //         "account": "string",
    //         "no": "string",
    //         "bank": "string or id",
    //         "image": "string or id"
    //       }
    //     ],
    //     "placeType": "string or id",
    //     "highlightName": "string",
    //     "history": "string",
    //     "region": "string or id",
    //     "holythings": "string",
    //     "tags": [
    //       "string or id",
    //       "string or id"
    //     ],
    //     "godOfYear": [
    //       "string or id",
    //       "string or id"
    //     ],
    //     "prayWord": "string",
    //     "moreInfo": "string",
    //     "slug": "string",
    //     "coverImages": [
    //       {
    //         "type": "pc",
    //         "image": "string or id"
    //       }
    //     ],
    //     "clips": [
    //       {
    //         "type": "youtube",
    //         "url": "string"
    //       }
    //     ],
    //     "hasDonation": true,
    //     "geolocation": "string",
    //     "province": "string or id"
    //   }
    // })

    let dataList = []

    jsonObj.forEach(o => {

      // if(o.godofyear) console.log(JSON.stringify(o, null, 2))

      // return

      let province = masterData['provinces'].find(m => m.attributes.name == o.province)
      let provinceId = province ? province.id : null

      let sacredtypes = o.sacredtype.split(",").map(o => _.trim(o))
      let sacredtypesArray = findInMaster("sacred-types", sacredtypes)

      let placeTypeId = findInMaster("place-types", o.type)

      let regionId = findInMaster("regions", o.region)

      let godofyear = o.godofyear.split(",").map(o => _.trim(o))
      let godofyearArray = findInMaster("chinese-zodiacs", godofyear, "like")

      let banks = findBank(o.DONATION)

      let galleries = findGallery(o.gallery)

      // console.log(banks)

      // console.log(sacredtypes, sacredtypesArray, JSON.stringify(o, null, 2))

      dataList.push({
        "data": {
          "slug": slugify(o.name, {
            remove: /[*+~.()'"!:@]/g
          }),
          "name": o.name,
          "templeName": o.templename,
          "sacredTypes": sacredtypesArray,
          "howtoPray": o.howtopray,
          "masterReview": o.masterreview,
          "galleries": galleries,
          "bankAccounts": banks,
          "placeType": placeTypeId,
          "highlightName": o.highlightname,
          "history": o.history,
          "region": regionId,
          "holythings": o.history.split("\n").join(","),
          "tags": [],
          "godOfYear": godofyearArray,
          "prayWord": o.prayword,
          "moreInfo": o.moreinfo,
          "coverImages": galleries.length > 0 ? [
            {
              "type": "pc",
              "image": galleries[0]
            }
          ] : [],
          "clips": [],
          "hasDonation": banks.length > 0,
          "geolocation": "{}",
          "province": provinceId,
          "publishedAt": o.isactive=="false" ? null : new Date,
        }
      })
    })

    // console.log(JSON.stringify(dataList, null, 2))

    console.log("Insert Data...")

    let medias = {}

    for (let index = 0; index < dataList.length; index++) {
      const data = dataList[index];
      if(data.data.galleries){
        let ps = data.data.galleries.map(async url=>{
          medias[url] = await download(url)
          return true
        })

        await Promise.all(ps)
      }
    }

    let mediaIndex = Object.keys(medias)

    for (let index = 0; index < mediaIndex.length; index++) {
      let url = mediaIndex[index]
      const filePath = medias[url];

      let mediaData = findInMaster("upload/files", filePath.urlHash + "." + filePath.fileExt)

      if(mediaData){
        medias[url].id = mediaData
      }else{
        const file = fs.readFileSync(filePath.path);
        const form = new FormData();

        form.append('files', file, filePath.urlHash + "." + filePath.fileExt);

        try {
          let result = await instance.post("/upload", form, {
            headers: {
              "Content-Type":'multipart/form-data'
            }
          })
          medias[url].id = result.data[0].id
        } catch (error) {
          console.log(error.response.data.error.message)
        }
      }
    }

    for (let index = 0; index < dataList.length; index++) {
      const data = dataList[index];
      if(data.data.galleries.length > 0){
        data.data.galleries = data.data.galleries.map(url => {
          return medias[url].id
        })
      }

      if(data.data.coverImages.length > 0){
        data.data.coverImages = data.data.coverImages.map(img => {
          img.image = medias[img.image].id
          return img
        })


      }

      try {
        await instance.post("/places", data)
      } catch (error) {
        if(error.response){
          console.log("ERROR-->", data, JSON.stringify(error.response.data, null ,2))
        }else{
          console.log("ERROR-->", error)
        }
      }
    }

    // let ps = dataList.map(async data=>{

    // })

    // console.log("Insert Data...")

    // try {
    //   await Promise.all(ps)
    // } catch (error) {
    //   console.log("Insert Error")
    // }


    console.log("Insert success")
    /**
     * [
     * 	{a:"1", b:"2", c:"3"},
     * 	{a:"4", b:"5". c:"6"}
     * ]
     */
  })
