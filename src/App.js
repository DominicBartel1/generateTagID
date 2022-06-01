import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button'
import React, { useState, useEffect } from 'react';
import cryptoJs from 'crypto-js';
import Table from 'react-bootstrap/Table'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import getTypes from "./components/getTypes"
import getCount from "./components/getCount"

function App() {


  const [tagState, setTagState] = useState({
    202202: {
      selected: true,
      productName: "test",
      existing: 123
    }
  })
  const [amount, setAmount] = useState("")
  const [salt, setSalt] = useState("")
  const [tempTagBucket, setTempBucket] = useState()
  const [storageEstimate, setEstimate] = useState()


  //Quick block to get an estimate for calculating storage times
  useEffect(() => {
    var estObj = {}
    estObj["estKey"] = {
      202202: {}
    }
    //start time
    var timestampStart = Date.now()
    //Generate 50 keys
    // for (var i = 0; i < 50; i++) {
    //   estObj["estKey"]["202202"][i] = { estData: generateId(Date.now(), i) }
    // }
    var timestampEnd = Date.now()
    //calculate time in ms per 50 keys stored (estimate)
    var estTime = timestampEnd - timestampStart
    console.log(estTime)
    setEstimate(estTime)
    getTypes().then(res => {
      getCount({ tagNumber: Object.keys(res) }).then(res2 => {
        for (var key in res2) {
          res[key].existing = res2[key]
        }
        setTagState(res)
      })
    })
  }, [])



  //function to iterate requested types, generate and store them ascync
  async function massGenerate(options) {
    var url = !window.ENV.dev ? window.ENV.functions_url + "storeTags" + window.ENV.functionSecret : window.ENV.dev_url + "storeTags";
    //ammount of tagvalues to attempt storing in one increment
    const storageIncrementAmount = 50

    const randomValues = "1234567890qwertyuiopasdfghjklZXCVBNMQWERTYUIOPzxcvbnmASDFGHJKL"
    function generateId() {
      var hash = cryptoJs.SHA256(options.salt)
      var dataString = hash.toString(cryptoJs.enc.Base64)
      // Remove special characters
      dataString = dataString.replace(/\+/g, randomValues[Math.floor(Math.random() * randomValues.length)]).replace(/\//g, randomValues[Math.floor(Math.random() * randomValues.length)]).replace(/=/g, randomValues[Math.floor(Math.random() * randomValues.length)]);
      // gather random 16 characters
      var start = Math.floor(Math.random() * (dataString.length - 16))
      var end = start + 16
      dataString = dataString.substring(start, end)
      return dataString;
    }



    async function iterateType(type) {
      var stored = {}

      async function storeBlock(block) {
        let data = {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
        data.body = JSON.stringify({ tags: block })

        await fetch(url, data)
          .then(res => res.json())
          .then(
            (result) => {
              console.log(result)
              let errorVals = 0
              for (var tag in result) {
                if (tag !== "type") {
                  if (result[tag].error) {
                    errorVals++
                  } else {
                    stored[tag] = {
                      ...result[tag]
                    }
                  }
                }

              }
              if (errorVals) {
                recursiveCreate(result.type, errorVals)
              } else if (Object.keys(stored).length >= amount) {
                console.log(stored)
                setTagState({
                  ...tagState,
                  [result.type]: {
                    ...tagState[result.type],
                    existing: tagState[result.type].existing + Object.keys(stored).length,
                  },
                })
              }
            },
            (error) => {

            }
          )
      }
      async function recursiveCreate(type, amount) {
        var block = {}
        for (var j = 0; j < amount; j++) {
          let id = generateId()
          block[id] = {
            salt: options.salt,
            timeStamp: new Date().getTime(),
            idValue: id,
            tagNumber: type
          }
        }
        storeBlock(block)
      }
      for (var i = options.amount; i > 0; i = i - storageIncrementAmount) {
        if (i - storageIncrementAmount > -1) {
          recursiveCreate(type, storageIncrementAmount)
        } else if (i > 0) {
          recursiveCreate(type, i)
        }
      }
    }

    for (var type in options.tagState) {
      if (options.tagState[type].selected) {
        iterateType(type)
      }
    }
  }


  function msToTime(duration) {
    var returnString = "Too long to calculate";
    if (!isNaN(new Date(Date.now() + duration))) {
      returnString = new Date(Date.now() + duration).toLocaleDateString() + " " + new Date(Date.now() + duration).toLocaleTimeString()
    }
    return returnString
  }

  function listAllProduct() {
    var returnArray = []
    var tagKeys = Object.keys(tagState)
    var multiplier = 1
    for (var i in tagKeys) {
      let key = tagKeys[i]
      let existing = tagState[key].existing
      if (multiplier > 0 && !tagState[tagKeys[i]].selected) {
        multiplier--
      }

      var estimateComplete = "--/--/---- --:--:-- --"
      if (tagState[key].selected) {
        estimateComplete = msToTime(amount === "" ? 0 : ((amount / 50) * (existing + 1) * storageEstimate) * multiplier)
      }

      returnArray.push(
        <tr onClick={() => setTagState(
          {
            ...tagState,
            [key]: {
              ...tagState[key],
              selected: !tagState[key].selected
            }
          })}
          style={{ background: tagState[key].selected ? "#0d6efd9e" : "" }}>
          {
            [
              <td>{key}</td>,
              <td>{tagState[key].productName}</td>,
              <td>{existing}</td>,
              <td>{estimateComplete} </td>
            ]}
        </tr>
      )
      multiplier++
    }
    return returnArray

  }
  // async function massGenerate(amount, salt) {
  //   var duplicates = 0

  //   var timestampStart = Date.now()
  //   var json = {};
  //   var newJson = {}
  //   for (var key in tags) {
  //     newJson[key] = {}
  //     json[key] = { ...tags[key] }
  //   }
  //   var currentBatch = {}
  //   for (var tagType in tags) {
  //     //if tag is selected
  //     if (tagState[tagType]) {
  //       //Gather current amount of tags
  //       // var existing = Object.keys(tags[tagType]).length
  //       var currentString = ""
  //       //Generate a given amount of tags
  //       for (var i = 1; i < amount + 1; i++) {
  //         var runGenerate = function () {
  //           // var generatedId = generateId(salt, i + existing)
  //           var generatedId = generateId(salt, i)
  //           //if tag is duplicate
  //           if (json[tagType][generatedId]) {
  //             console.log("duplicate: " + generatedId)
  //             duplicates++
  //             runGenerate()
  //           } else { //else store generated value
  //             json[tagType][generatedId] = {
  //               timeStamp: (new Date()).getTime(),
  //               // increment: i + existing
  //             }
  //             newJson[tagType][generatedId] = {
  //               timeStamp: (new Date()).getTime(),
  //               // increment: i + existing
  //             }
  //             currentString += generatedId + "\n"
  //           }
  //         }
  //         runGenerate()
  //       }
  //       currentBatch[tagType] = currentString
  //     }
  //   }
  //   setOldNew({ json, newJson })
  //   setStringData()
  //   var timestampEnd = Date.now()

  //   console.log((timestampEnd - timestampStart) * 0.001)
  // }
  return (
    <div className="App" style={{ margin: "5vw" }}>
      <div id="control" style={{ marginBottom: "2px", display: 'flex' }}>
        <Button onClick={() => {
          var newState = JSON.parse(JSON.stringify(tagState))
          var allSelected = true;
          for (var key in tagState) {
            newState[key].selected = false;
            if (!tagState[key].selected) {
              allSelected = false;
              break;
            }
          }
          if (!allSelected) {
            for (var key in tagState) {
              newState[key].selected = true;
            }
          }
          setTagState(newState)
        }}>Select/Deselect all</Button>
        <Button disabled={amount && salt ? false : true} onClick={() => {
          massGenerate({
            salt: salt,
            amount: amount,
            tagState: tagState,
          })
          // setTags(oldNewJson.json)
          // setOldNew()
        }}>
          Generate/Download
        </Button>
      </div>
      <div id="control" style={{ marginBottom: "2px", display: 'flex' }}>
        <InputGroup >
          <InputGroup.Text>Amount</InputGroup.Text>
          <FormControl
            placeholder="ID to generate per type"
            value={amount}
            onChange={(data) => {
              if (data.target.value === "") {
                setAmount("")
              } else if (!isNaN(data.target.value)) {
                setAmount(parseInt(data.target.value))
              } else {
                setAmount("")
              }
            }}
          />
        </InputGroup>
        <InputGroup>
          <InputGroup.Text>Salt</InputGroup.Text>
          <FormControl
            placeholder="Value to increase security of key"
            value={salt}
            onChange={(data) => {
              setSalt(data.target.value)
            }}
          />
        </InputGroup>
      </div>
      <div class="selectTypes" style={{ display: "flex" }}>

        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Type</th>
              <th>Product</th>
              <th>Existing</th>
              <th>Estimated completion</th>
            </tr>
          </thead>
          <tbody>
            {listAllProduct()}
          </tbody>
        </Table>
      </div>

    </div>
  );
}

export default App;
