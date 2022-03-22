import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button'
import React, { useState, useEffect } from 'react';
import cryptoJs from 'crypto-js';
import Table from 'react-bootstrap/Table'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'

function App() {
  const randomValues = "1234567890qwertyuiopasdfghjklZXCVBNMQWERTYUIOPzxcvbnmASDFGHJKL"
  function generateId(salt, increment) {

    var hash = cryptoJs.SHA256(salt + increment)
    var dataString = hash.toString(cryptoJs.enc.Base64)
    // Remove special characters
    dataString = dataString.replace(/\+/g, randomValues[Math.floor(Math.random() * randomValues.length)]).replace(/\//g, randomValues[Math.floor(Math.random() * randomValues.length)]).replace(/=/g, randomValues[Math.floor(Math.random() * randomValues.length)]);
    // gather random 16 characters
    var start = Math.floor(Math.random() * (dataString.length - 16))
    var end = start + 16
    dataString = dataString.substring(start, end)
    return dataString;

  }

  const [tags, setTags] = useState({
    202202: {},
    202203: {},
    202204: {},
    202205: {},
    202206: {},
    202207: {},
    202208: {},
    202209: {},
    202210: {},
    202211: {},
    202212: {},
    202213: {}
  })
  const [tagState, setTagState] = useState({
    202202: true,
    202203: true,
    202204: true,
    202205: true,
    202206: true,
    202207: true,
    202208: true,
    202209: true,
    202210: true,
    202211: true,
    202212: true,
    202213: true
  })
  const [amount, setAmount] = useState("")
  const [salt, setSalt] = useState("")
  const [oldNewJson, setOldNew] = useState()
  const [stringData, setStringData] = useState({})
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
    for (var i = 0; i < 50; i++) {
      estObj["estKey"]["202202"][i] = { estData: generateId(Date.now(), i) }
    }
    var timestampEnd = Date.now()
    //calculate time in ms per 50 keys stored (estimate)
    var estTime = timestampEnd - timestampStart
    console.log(estTime)
    setEstimate(estTime)
  }, [])

  function msToTime(duration) {
    var returnString = "Too long to calculate";
    if (!isNaN(new Date(Date.now() + duration))) {
      returnString = new Date(Date.now() + duration).toLocaleDateString() + " " + new Date(Date.now() + duration).toLocaleTimeString()
    }
    return returnString
  }

  function massGenerate(amount, salt) {
    var duplicates = 0

    var timestampStart = Date.now()
    var json = {};
    var newJson = {}
    for (var key in tags) {
      newJson[key] = {}
      json[key] = { ...tags[key] }
    }
    var currentBatch = {}
    for (var tagType in tags) {
      //if tag is selected
      if (tagState[tagType]) {
        //Gather current amount of tags
        // var existing = Object.keys(tags[tagType]).length
        var currentString = ""
        //Generate a given amount of tags
        for (var i = 1; i < amount + 1; i++) {
          var runGenerate = function () {
            // var generatedId = generateId(salt, i + existing)
            var generatedId = generateId(salt, i)
            //if tag is duplicate
            if (json[tagType][generatedId]) {
              console.log("duplicate: " + generatedId)
              duplicates++
              runGenerate()
            } else { //else store generated value
              json[tagType][generatedId] = {
                timeStamp: (new Date()).getTime(),
                // increment: i + existing
              }
              newJson[tagType][generatedId] = {
                timeStamp: (new Date()).getTime(),
                // increment: i + existing
              }
              currentString += generatedId + "\n"
            }
          }
          runGenerate()
        }
        currentBatch[tagType] = currentString
      }
    }
    setOldNew({ json, newJson })
    setStringData()
    var timestampEnd = Date.now()

    console.log((timestampEnd - timestampStart) * 0.001)
  }
  return (
    <div className="App" style={{ margin: "20vw" }}>
      <div id="control" style={{ marginBottom: "2px", display: 'flex' }}>
        <Button onClick={() => {
          massGenerate(amount, salt)
        }}>
          Generate
        </Button>
        <Button onClick={() => {
          var newState = {}
          var allSelected = true;
          for (var key in tagState) {
            newState[key] = false;
            if (!tagState[key]) {
              allSelected = false;
              break;
            }
          }
          if (!allSelected) {
            for (var key in tagState) {
              newState[key] = true;
            }
          }
          setTagState(newState)
        }}>Select/Deselect all</Button>
        <Button disabled={oldNewJson ? false : true} onClick={() => {
          console.log(oldNewJson)
          setTags(oldNewJson.json)
          setOldNew()
        }}>
          Download/store
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
            {Object.keys(tags).map((key, i) => {
              let existing = Object.keys(tags[key]).length
              return (
                <tr onClick={() => setTagState(
                  {
                    ...tagState,
                    [key]: !tagState[key]
                  })}
                  style={{ background: tagState[key] ? "#0d6efd9e" : "" }}>
                  {
                    [
                      <td>{key}</td>,
                      <td>Need api</td>,
                      <td>{existing}</td>,
                      <td>{tagState[key] ? msToTime(amount === "" ? 0 : ((amount / 50) * (existing + 1) * storageEstimate) * i): "--/--/---- --:--:-- --"} </td>
                    ]}
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>

    </div>
  );
}

export default App;
