import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button'
import React, { useState } from 'react';
// const crypto = require('crypto');



function App() {
  const randomValues = "1234567890qwertyuiopasdfghjklZXCVBNMQWERTYUIOPzxcvbnmASDFGHJKL"
  function generateId(salt, increment) {
    var dataString = ""
    while(dataString.length < 16){
      dataString += randomValues[Math.floor(Math.random() * randomValues.length)]
    }
    // var hasher = crypto.createHash('sha1');
    // const data = hasher.update(Buffer.from(salt + increment, 'utf16le'));
    // var hashedVal = data.digest().slice(0, 16).toString('base64');
    // hashedVal = hashedVal.substr(0, 16)
    // var dataString = hashedVal.replace(/\+/g, randomValues[Math.floor(Math.random() * randomValues.length)]).replace(/\//g, randomValues[Math.floor(Math.random() * randomValues.length)]).replace(/=/g, randomValues[Math.floor(Math.random() * randomValues.length)]);
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

  function massGenerate(amount, salt) {
    var json = tags;
    var currentBatch = {}
    for (var tagType in tags) {
      var existing = Object.keys(tags[tagType]).length
      var currentString = ""
      for (var i = 1; i < amount + 1; i++) {
        var runGenerate = function () {
          var generatedId = generateId(salt, i)
          if (json[tagType][generatedId]) {
            runGenerate()
          } else {
            json[tagType][generatedId] = {
              timeStamp: (new Date()).getTime(),
              increment: i + existing
            }
            currentString += generatedId + "\n"
          }
        }
        runGenerate()
      }
      currentBatch[tagType] = currentString
    }
    return currentBatch
  }
  return (
    <div className="App">
      <Button onClick={() => {
        var test = massGenerate(50, "saltyBOi")
        console.log(test)
      }}>
        TestLog
      </Button>
    </div>
  );
}

export default App;
