// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
adapted from:
ml5 Example
KNN Classification on Webcam Images with mobileNet. Built with p5.js
=== */

// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier();
// Create a featureExtractor that can extract the already learned features from MobileNet
const featureExtractor = ml5.featureExtractor('MobileNet', modelReady);


let video;
var cols, rows;
var w = 30;
var grid = [];
var current;
var stack = [];
var cnv;
var direction = ''
var playerX = 0
var playerY = 0

let inputDifficulty = document.querySelector("#difficulty")
let scoreForm = document.querySelector("#formDIV")
let timeScore = document.querySelector("#timescore")


//timer stuff

var minutesSpan = document.querySelector("#minutes");
var secondsSpan = document.querySelector("#seconds");
let totalSeconds = 60;
let interval;


function setTime() {
  --totalSeconds;
  secondsSpan.innerHTML = pad(totalSeconds % 60);
  minutesSpan.innerHTML = pad(parseInt(totalSeconds / 60));
}

function pad(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}

function startTimer() {
  interval = setInterval(setTime, 1000);
}

function stopTimer() {
  clearInterval(interval);
}



function resetTimer() {
  clearInterval(interval);
  totalSeconds = 60;
  secondsSpan.innerHTML = pad(totalSeconds % 60);
  minutesSpan.innerHTML = pad(parseInt(totalSeconds / 60));
}



// game buttons functions   
easyButton = document.querySelector("#easymode")
mediumButton = document.querySelector("#mediummode")
hardButton = document.querySelector("#hardmode")
scoresButton = document.querySelector("#scoreBTN")
highScoresDIV = document.querySelector("#highscoreDIV")
// diffSpan = document.querySelector("#diffSPAN")
// scoreSpan = document.querySelector("#scoreSPAN")
// nameSpan = document.querySelector("#nameSPAN")


// toggle displays
function blockView() {
  if (highScoresDIV.style.display === "none") {
    highScoresDIV.style.display = "block";
  } else {
    highScoresDIV.style.display = "none";
  }
}


function blockButton() {
  if (easyButton.style.display === "none") {
    easyButton.style.display = "block";
  } else {
    easyButton.style.display = "none";
  }
  if (mediumButton.style.display === "none") {
    mediumButton.style.display = "block";
  } else {
    mediumButton.style.display = "none";
  }
  if (hardButton.style.display === "none") {
    hardButton.style.display = "block";
  } else {
    hardButton.style.display = "none";
  }
  if (scoresButton.style.display === "none") {
    scoresButton.style.display = "block";
  } else {
    scoresButton.style.display = "none";
  }
}

// fetch("http://localhost:3000/difficulties/1")
// .then(resp => {
//   return resp.json()})
//   debugger

easyButton.addEventListener("click", function () {
  startSketch(210)
  blockButton()
  blockView()
  fetch("http://localhost:3000/difficulties/1")
    .then(resp => {
      return resp.json()
    })
    .then(diff => {
      inputDifficulty.value = diff.level
    });
});
mediumButton.addEventListener("click", function () {
  startSketch(300)
  blockButton()
  blockView()
  fetch("http://localhost:3000/difficulties/2")
    .then(resp => {
      return resp.json()
    })
    .then(diff => {
      inputDifficulty.value = diff.level
    });
});
hardButton.addEventListener("click", function () {
  startSketch(450)
  blockButton()
  blockView()
  fetch("http://localhost:3000/difficulties/3")
    .then(resp => {
      return resp.json()
    })
    .then(diff => {
      inputDifficulty.value = diff.level
    });
});

function appendScores(score) {
  // let diffSpanScore = document.querySelector("#diffSpan")
  highScoresDIV.innerHTML +=
    `<div><p>Difficulty: <span id= "diffSPAN">${score.difficulty_id}</span></p>
    <p>Name: <span id= "nameSPAN">${score.name}</span></p>
    <p>Score: <span id= "scoreSPAN">${score.time}</span></p>
    <button id= "${score.id}" class= "deletescore">Delete Score</button>
    <button class= "reverse">Reverse</button><br></div>`
}

scoresButton.addEventListener("click", function () {

  highScoresDIV.style.display = "block"
  fetch("http://localhost:3000/scores")
    .then(resp =>
      resp.json())
    .then(scores => {
      scores.forEach((score) => {
        if (score.difficulty_id == 1) {
          score.difficulty_id = "Easy"
        } else if (score.difficulty_id == 2) {
          score.difficulty_id = "Medium"
        } else if (score.difficulty_id == 3) {
          score.difficulty_id = "Hard"
        }
        appendScores(score);
      });
    });
});
highScoresDIV.addEventListener("click", (evt) => {
  // debugger
  // blockButton()
  // delBtn = document.querySelector(".deletescore")
  if (evt.target.className === "reverse") {
    // debugger
    let nameSPAN = evt.target.parentElement.querySelector("#nameSPAN")
    let userName = nameSPAN.innerText
    let newUserName = userName.split("").reverse().join("");
    let userDeleteBtn = evt.target.parentElement.querySelector(".deletescore")
    let userId = userDeleteBtn.id
    console.log(userName)
    console.log(userId)
    fetch(`http://localhost:3000/scores/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: newUserName
      }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }

    })
      .then(resp =>
        resp.json())
      .then(score => {
        nameSPAN.innerText = score.name
      })
  }

  if (evt.target.className === "deletescore") {
    let id = evt.target.id
    fetch(`http://localhost:3000/scores/${id}`, {
      method: "DELETE"

    });
    evt.target.parentElement.remove()
  };
});


function submitForm(evt) {
  evt.preventDefault()
  let difficultyInput = evt.target.level.value
  if (difficultyInput == "Easy") {
    difficultyInput = 1
  } else if (difficultyInput == "Medium") {
    difficultyInput = 2
  } else if (difficultyInput == "Hard") {
    difficultyInput = 3
  }
  let scoreInput = evt.target.score.value
  let nameInput = evt.target.playername.value

  fetch("http://localhost:3000/scores", {
    method: 'POST',
    body: JSON.stringify({
      name: nameInput,
      time: scoreInput,
      difficulty_id: difficultyInput
    }),

    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }

  })
    .then(r => r.json())
  scoreForm.style.display = "none"
  resetTimer()
  blockButton()
  scoreForm.removeEventListener("submit", submitForm)
  nameInput = ""
  difficultyInput = 0


}

// p5 only stuff
function startSketch(width) {
  var sketch = function (p) {

    w = 30;
    grid = [];
    stack = [];
    direction = ''
    playerX = 0
    playerY = 0

    p.setup = function () {
      // Create canvas on side
      img = p.loadImage('erichead.png')
      cnv = p.createCanvas(width, width);
      cnv.position(p.windowWidth - width - 25, 80);
      p.background(255, 255, 0);
      cols = p.floor(width / w);
      rows = p.floor(width / w);

      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var cell = new Cell(x, y);
          grid.push(cell)
        }
      }
      current = grid[0];
      // Create a video element
      video = p.createCapture(p.VIDEO);
      // Append it to the videoContainer DOM element
      video.parent('videoContainer');
      // Create the UI buttons
      createButtons();
      // noLoop();




    } // creates maze
    p.draw = function () {
      p.background(200)
      for (var i = 0; i < grid.length; i++) {
        grid[i].show();
      }
      current.visited = true;
      current.highlight()
      //step 1
      var next = current.checkNeighbors()
      if (next) {
        next.visited = true;
        //step 2
        stack.push(current);
        //step 3
        removeWalls(current, next);
        //step 4
        current = next;
      } else if (stack.length > 0) {
        current = stack.pop();



      }
      // creates start and end points on maze
      if (stack.length == 0) {
        p.fill(255, 0, 0)
        p.rect((cols - 1) * w + 4, (rows - 1) * w + 4, w - 8, w - 8)
        p.fill(0, 255, 0)
        p.rect(playerX * w + 8, playerY * w + 8, w - 16, w - 16)
      }
      // reach end point
      if (playerX == cols - 1 && playerY == rows - 1) {
        stopTimer()
        p.textSize(width / 10)
        p.fill(0, 0, 255)
        p.text("You Win!", width / 2 - width / 5, width / 2)
        setTimeout(removeCanvas, 3000)
        timeScore.value = totalSeconds


        // show score form
        function scoreDisplay() {
          scoreForm.style.display = "block"
        }
        setTimeout(scoreDisplay, 3000)
        // creating score instance
        scoreForm.addEventListener("submit", submitForm)

        p.noLoop()

      }
    }
    // maze stuff
    function Cell(x, y) {
      this.x = x;
      this.y = y;
      // this.walls [top, right, bottom, left];
      this.walls = [true, true, true, true];
      this.visited = false;


      this.show = function () {
        var xcord = this.x * w;
        var ycord = this.y * w;
        p.stroke(100);
        // top
        if (this.walls[0]) {
          p.line(xcord, ycord, xcord + w, ycord);
        }
        // right
        if (this.walls[1]) {
          p.line(xcord + w, ycord, xcord + w, ycord + w);
        }
        // bottom
        if (this.walls[2]) {
          p.line(xcord + w, ycord + w, xcord, ycord + w);
        }
        // left
        if (this.walls[3]) {
          p.line(xcord, ycord + w, xcord, ycord);
        }

        if (this.visited) {
          // debugger
          p.noStroke();
          p.fill(255, 0, 0, 100)
          p.rect(xcord, ycord, w, w);
        }
        //  else if (this.visited == grid[399].visited) {
        //   grid[399].visited = false

        //  }





      }
      this.highlight = function () {
        var xcord = this.x * w;
        var ycord = this.y * w;
        p.noStroke();
        p.fill(0, 0, 255, 255);
        p.rect(xcord + 4, ycord + 4, w - 8, w - 8);
      }

      this.checkNeighbors = function () {
        var neighbors = [];
        // var index = x + y * cols
        var top = grid[index(x, y - 1)]
        var right = grid[index(x + 1, y)]
        var bottom = grid[index(x, y + 1)]
        var left = grid[index(x - 1, y)]

        if (top && !top.visited) {
          neighbors.push(top);
        }
        if (right && !right.visited) {
          neighbors.push(right);
        }
        if (bottom && !bottom.visited) {
          neighbors.push(bottom);
        }
        if (left && !left.visited) {
          neighbors.push(left);
        }
        if (neighbors.length > 0) {
          var r = p.floor(p.random(0, neighbors.length));
          return neighbors[r];
        } else {
          return undefined;
        }
      }

    };
    // noFill();
    function removeCanvas() {

      mazeCanvas = document.querySelector("#defaultCanvas0")
      // if (mazeCanvas.style.display === "none") {
      //   mazeCanvas.style.display = "block";
      // } else {
      //   mazeCanvas.style.display = "none";
      // }
      mazeCanvas.parentElement.removeChild(mazeCanvas)
    }

    function removeWalls(a, b) {

      var d = a.x - b.x;
      if (d === 1) {
        a.walls[3] = false;
        b.walls[1] = false;
      } else if (d === -1) {
        a.walls[1] = false;
        b.walls[3] = false;
      }
      var u = a.y - b.y;
      if (u === 1) {
        a.walls[0] = false;
        b.walls[2] = false;
      } else if (u === -1) {
        a.walls[2] = false;
        b.walls[0] = false;
      }



    }
    function index(x, y) {
      if (x < 0 || y < 0 || x > cols - 1 || y > rows - 1) {
        return -1
      }
      return x + y * cols;
    }

    // admin controls for the game
    p.keyPressed = function () {
      if (p.keyCode === p.UP_ARROW) {
        if (grid[grid.length - ((rows - 1) - playerY) * rows - ((cols - 1) - playerX) - 1].walls[0] == false) {

          playerY--;
        }
      } else if (p.keyCode === p.RIGHT_ARROW) {
        if (grid[grid.length - ((rows - 1) - playerY) * rows - ((cols - 1) - playerX) - 1].walls[1] == false) {

          playerX++;
        }
      } else if (p.keyCode === p.DOWN_ARROW) {
        if (grid[grid.length - ((rows - 1) - playerY) * rows - ((cols - 1) - playerX) - 1].walls[2] == false) {

          playerY++;
        }
      } else if (p.keyCode === p.LEFT_ARROW) {
        if (grid[grid.length - ((rows - 1) - playerY) * rows - ((cols - 1) - playerX) - 1].walls[3] == false) {

          playerX--;
        }
      }
    }
  }
  var myp5 = new p5(sketch)


}










/* ml5 stuff
*/

function modelReady() {
  document.querySelector('#status').innerText = 'FeatureExtractor(mobileNet model) Loaded';
}

// Add the current frame from the video to the classifier
function addExample(label) {
  // Get the features of the input video
  const features = featureExtractor.infer(video);
  // You can also pass in an optional endpoint, defaut to 'conv_preds'
  // const features = featureExtractor.infer(video, 'conv_preds');
  // You can list all the endpoints by calling the following function
  // console.log('All endpoints: ', featureExtractor.mobilenet.endpoints)

  // Add an example with a label to the classifier
  knnClassifier.addExample(features, label);
  updateExampleCounts();
}

// Predict the current frame.
function classify() {
  // Get the total number of classes from knnClassifier
  const numClasses = knnClassifier.getNumClasses();
  if (numClasses <= 0) {
    console.error('There is no examples in any class');
    return;
  }
  // Get the features of the input video
  const features = featureExtractor.infer(video);

  // Use knnClassifier to classify which class do these features belong to
  // You can pass in a callback function `gotResults` to knnClassifier.classify function
  knnClassifier.classify(features, gotResults);
  // You can also pass in an optional K value, K default to 3
  // knnClassifier.classify(features, 3, gotResults);

  // You can also use the following async/await function to call knnClassifier.classify
  // Remember to add `async` before `function predictClass()`
  // const res = await knnClassifier.classify(features);
  // gotResults(null, res);
}

// A util function to create UI buttons
function createButtons() {
  // When the A button is pressed, add the current frame
  // from the video with a label of "Up" to the classifier
  buttonA = document.querySelector('#addClassUp');
  buttonA.addEventListener("click", function () {
    addExample('Up');
  });

  // When the B button is pressed, add the current frame
  // from the video with a label of "Down" to the classifier
  buttonB = document.querySelector('#addClassDown');
  buttonB.addEventListener("click", function () {
    addExample('Down');
  });

  // When the C button is pressed, add the current frame
  // from the video with a label of "Left" to the classifier
  buttonC = document.querySelector('#addClassLeft');
  buttonC.addEventListener("click", function () {
    addExample('Left');
  });

  buttonD = document.querySelector('#addClassRight');
  buttonD.addEventListener("click", function () {
    addExample('Right');
  });

  buttonE = document.querySelector('#addClassStill');
  buttonE.addEventListener("click", function () {
    addExample('Still');
  });
  // Reset buttons
  resetBtnA = document.querySelector('#resetUp');
  resetBtnA.addEventListener("click", function () {
    clearClass('Up');
  });

  resetBtnB = document.querySelector('#resetDown');
  resetBtnB.addEventListener("click", function () {
    clearClass('Down');
  });

  resetBtnC = document.querySelector('#resetLeft');
  resetBtnC.addEventListener("click", function () {
    clearClass('Left');
  });

  resetBtnD = document.querySelector('#resetRight');
  resetBtnD.addEventListener("click", function () {
    clearClass('Right');
  });

  resetBtnE = document.querySelector('#resetStill');
  resetBtnE.addEventListener("click", function () {
    clearClass('Still');
  });

  // Predict button
  buttonPredict = document.querySelector('#buttonPredict');
  buttonPredict.addEventListener("click", function () {
    classify();
    resetTimer()
    startTimer();
  });

  // Clear all classes button
  buttonClearAll = document.querySelector('#clearAll');
  buttonClearAll.addEventListener("click", clearAllClasses);

  // Load saved classifier dataset
  // buttonSetData = document.querySelector('#load');
  // buttonSetData.addEventListener("click",loadDataset);

  // // Get classifier dataset
  // buttonGetData = document.querySelector('#save');
  // buttonGetData.addEventListener("click",saveDataset);
}

// Show the results
function gotResults(err, result) {
  // Display any error
  if (err) {
    console.error(err);
  }

  if (result.confidencesByLabel) {
    const confidence = result.confidencesByLabel;
    // result.label is the label that has the highest confidence
    if (result.label) {
      document.querySelector('#result').innerText = (result.label);
      document.querySelector('#confidence').innerText = (`${confidence[result.label] * 100} %`);
      if (result.label == 'Up') {
        if (grid[grid.length - ((rows - 1) - playerY) * rows - ((cols - 1) - playerX) - 1].walls[0] == false) {

          playerY--;
        }
      }
      else if (result.label == "Right") {
        if (grid[grid.length - ((rows - 1) - playerY) * rows - ((cols - 1) - playerX) - 1].walls[1] == false) {

          playerX++;
        }
      }
      else if (result.label == "Down") {
        if (grid[grid.length - ((rows - 1) - playerY) * rows - ((cols - 1) - playerX) - 1].walls[2] == false) {

          playerY++;
        }
      }
      else if (result.label == "Left") {
        if (grid[grid.length - ((rows - 1) - playerY) * rows - ((cols - 1) - playerX) - 1].walls[3] == false) {

          playerX--;
        }
      }
      else if (result.label == "Still") {

      }
    }

    document.querySelector('#confidenceUp').innerText = (`${confidence['Up'] ? confidence['Up'] * 100 : 0} %`);
    document.querySelector('#confidenceDown').innerText = (`${confidence['Down'] ? confidence['Down'] * 100 : 0} %`);
    document.querySelector('#confidenceLeft').innerText = (`${confidence['Left'] ? confidence['Left'] * 100 : 0} %`);
    document.querySelector('#confidenceRight').innerText = (`${confidence['Right'] ? confidence['Right'] * 100 : 0} %`);
    document.querySelector('#confidenceStill').innerText = (`${confidence['Still'] ? confidence['Still'] * 100 : 0} %`);
  }

  classify();
}

// Update the example count for each class	
function updateExampleCounts() {
  const counts = knnClassifier.getClassExampleCountByLabel();

  document.querySelector('#exampleUp').innerText = (counts['Up'] || 0);
  document.querySelector('#exampleDown').innerText = (counts['Down'] || 0);
  document.querySelector('#exampleLeft').innerText = (counts['Left'] || 0);
  document.querySelector('#exampleRight').innerText = (counts['Right'] || 0);
  document.querySelector('#exampleStill').innerText = (counts['Still'] || 0);
}

// Clear the examples in one class
function clearClass(classLabel) {
  knnClassifier.clearClass(classLabel);
  updateExampleCounts();
}

// Clear all the examples in all classes
function clearAllClasses() {
  knnClassifier.clearAllClasses();
  updateExampleCounts();
}

// Save dataset as myKNNDataset.json
// function saveDataset() {
//   knnClassifier.saveDataset('myDataset');
// }

// // Load dataset to the classifier
// function loadDataset() {
//   knnClassifier.loadDataset('./myDataset.json', updateExampleCounts);
// }