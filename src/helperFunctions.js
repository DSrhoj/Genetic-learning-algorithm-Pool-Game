// Set balls on table based on positions from variable
// Needs tweaking in use-case where ball is poted
function setBalls() {
  for (var i = 0; i < startingPositions[shots].length; i++) {
    Body.setAngle(balls[i].body, 0);
    Body.setVelocity(balls[i].body, { x: 0, y: 0 });
    Body.setAngularVelocity(balls[i].body, 0);
    Body.setPosition(balls[i].body, startingPositions[shots][i]);
  }
}

// Records positions of balls and saves them to a variable
// Potentialy to a FILE in future
function takeSnapshot() {
  console.log("TOOK SNAPSHOT");
  var ballPositions = balls.map((ball) => ball.body.position);
  startingPositions.push(ballPositions);
  console.log(startingPositions);
  shots++;
  setBalls();
  // var fs = require("fs");
  // Should write to file (dont know how w/o node.js)
  // fs.writeFile("snapshot.json", JSON.stringify(ballPositions));
}

// Check if any object from list of objects is moving faster than 0.05units
function isObjectMoving(objects) {
  var isMoving = false;
  objects.forEach((object) => {
    if (object.body.speed > 0.05) {
      isMoving = true;
    }
  });
  return isMoving;
}
