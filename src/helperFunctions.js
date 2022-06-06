// Set balls on table based on positions from variable startingPositions
function setBalls() {
  for (var i = 0; i < startingPositions[stops].length; i++) {
    Body.setPosition(balls[i].body, startingPositions[stops][i].position);
    Body.setAngle(balls[i].body, 0);
    Body.setAngularVelocity(balls[i].body, 0);
    Body.setVelocity(balls[i].body, { x: 0, y: 0 });
  }
}

// Records positions of balls and saves them to a variable
// Potentialy to a FILE in future
function takeSnapshot() {
  // Record positions of balls and their labels
  var ballPositions = balls.map((ball) => {
    // If white ball is potted (is on negative space) position it back on screen
    if (ball.body.label == "white" && ball.body.position.x < 0) {
      ball.body.resetWhite(startingPositions[0][0].position);
    }

    // Return shallow copies of objects because otherwise logic is bugy
    return {
      position: { ...ball.body.position },
      label: { ...ball.body.label },
    };
  });

  // Push recorded positions to positions list
  startingPositions.push(ballPositions);

  // Increase number of balls stopping (recorded positions)
  stops++;

  // Set balls to make them stop moving after velocity < predefined value unless user requested setting balls
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
