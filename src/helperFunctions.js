// Function that handles collisions between objects
function handleCollision(event) {
  const { pairs } = event;
  pairs.forEach((pair) => {
    const { bodyA, bodyB } = pair;
    if (bodyA.label.includes("hole")) {
      // If bodyA is hole delete bodyB
      for (var i = 0; i < balls.length; i++) {
        if (balls[i].body == bodyB) {
          // Removing is actually translating to invisible area
          switch (bodyB.label) {
            case "white":
              balls[i].removeFromWorld();
              break;
            case "black":
              balls[i].removeFromWorld();
              break;
            case "player1":
              balls[i].removeFromWorld();
              break;
            case "player2":
              balls[i].removeFromWorld();
              break;
            default:
              null;
              break;
          }
        }
      }
    } else if (bodyB.label.includes("hole")) {
      // If bodyA is hole delete bodyB
      for (var i = 0; i < balls.length; i++) {
        if (balls[i].body == bodyA) {
          // Removing is actually translating to invisible area
          switch (bodyA.label) {
            case "white":
              balls[i].removeFromWorld();
              break;
            case "black":
              balls[i].removeFromWorld();
              break;
            case "player1":
              balls[i].removeFromWorld();
              break;
            case "player2":
              balls[i].removeFromWorld();
              break;
            default:
              null;
              break;
          }
        }
      }
    }
  });
}


// Funtion that applys random force to white ball (id=1) on mouse click
function mousePressed() {
  var whiteBall = balls.find((ball) => ball && ball.id == 1);
  let cuePosition = getPositionOfCue(
    whiteBall.body.position,
    mConstraint.mouse.position
  );
  let forceAmplitude = getForceAmplitude(whiteBall.body.position, cuePosition);
  console.log(forceAmplitude);
  World.remove(world, mConstraint);
  if (!isBallMoving.value) {
    Body.applyForce(whiteBall.body, whiteBall.body.position, {
      x: forceAmplitude.x,
      y: forceAmplitude.y,
    });
  }
}


//Clears the table of all balls.
function cleanTable() {
  balls.forEach((ball) => {
    if (ball.body) ball.removeFromWorld();
  });
}


//Creats new balls accordingly to the last snapshot.
function addBallsFromSnapshot(snapshot) {
  snapshot.forEach((ball, index) => {
    if (ball) {
      balls[index].resetBall(ball.position);
    }
  });
}


// Set balls on table based on positions from variable snapshot.
function setBalls(snapshot) {
  cleanTable();
  addBallsFromSnapshot(snapshot);
}


// Records positions of balls and saves them to a variable (Potentialy to a FILE in future)
function takeSnapshot() {
  // Record positions of balls and their labels
  var ballPositions = balls.map((ball) => {
    var tempBall = ball;
    // If white ball is potted (is on negative space) position it back on screen
    if (!world.bodies.find((body) => body.label == "white") && snapshots[0]) {
      ball.resetBall(
        snapshots[0].find((ball) => ball.label == "white").position
      );
    }
    // Return shallow copies of objects if their bodys exist (not potted) because otherwise logic is bugy
    if (tempBall.body) {
      return {
        position: { ...tempBall.body.position },
        label: tempBall.body.label,
        id: tempBall.id,
      };
    } else {
      return null;
    }
  });
  // Push recorded positions to positions list
  snapshots.push(ballPositions);
  // Increase number of balls stopping (recorded positions)
  stops++;
  // Set balls to make them stop moving after velocity < predefined value
  setBalls(snapshots[snapshots.length - 1]);
}


function takeCheckpoint(snapshot) {
  checkpoints.push(snapshot);
}


// Check if any object from list of objects is moving faster than 0.05units
function isObjectMoving(objects) {
  var isMoving = false;
  objects.forEach((object) => {
    if (object.body && object.body.speed > 0.05) {
      isMoving = true;
    }
  });
  return isMoving;
}

// Checks if a players ball has been potted. Compares the number of players balls before and after the shot.
function hasPottedOwn(previousCheckpoint, currentCheckpoint, player) {

  var playersBallCountPrevious = previousCheckpoint.filter(ball => { 
    if(ball){ return ball.label==player; }
    else return false;
  }).length;

  var playersBallCountCurrent = currentCheckpoint.filter(ball => { 
    if(ball){return ball.label==player; }
    else return false;
  }).length;


  if(playersBallCountPrevious > playersBallCountCurrent) {
    return true;
  }
  return false;
}


// Changes the header text for the current player.
function changeCurrentPlayer() {
  var currentPlayer = document.getElementById("currentPlayer").innerText;
  if (currentPlayer == "YOU") {
    document.getElementById("currentPlayer").innerText = "COMPUTER";
  } else document.getElementById("currentPlayer").innerText = "YOU";
}

function getForceAmplitude(ball, cue) {
  return {
    x: (ball.x - cue.x) * 10,
    y: (ball.y - cue.y) * 10,
  };
}

function getPositionOfCue(ball, mouse) {
  let radius = 200;
  let derivation = (mouse.y - ball.y) / (mouse.x - ball.x);
  let temp = Math.pow(radius, 2) / (1 + Math.pow(derivation, 2));
  let a = 1;
  let b = -2 * ball.x;
  let c = Math.pow(ball.x, 2) - temp;

  x1 = squarePolynomial(a, b, c, "+");
  x2 = squarePolynomial(a, b, c, "-");
  let point1 = {
    x: x1,
    y: ball.y + derivation * (x1 - ball.x),
  };

  let point2 = {
    x: x2,
    y: ball.y + derivation * (x2 - ball.x),
  };

  if (distance(ball, mouse) > 200 && mouse.x > ball.x) {
    return point1;
  } else if (distance(ball, mouse) > 200 && mouse.x < ball.x) {
    return point2;
  } else {
    return mouse;
  }
}

function squarePolynomial(a, b, c, operand) {
  let root;
  if (operand == "+") {
    root = Math.sqrt(Math.pow(b, 2) - 4 * a * c);
  } else {
    root = -Math.sqrt(Math.pow(b, 2) - 4 * a * c);
  }
  return (-b + root) / (2 * a);
}

function distance(point1, point2) {
  return Math.sqrt(
    Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
  );
}
