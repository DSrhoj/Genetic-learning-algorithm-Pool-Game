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

// Funtion that applys random force to white ball on mouse click
function mousePressed() {
  if (!isBallMoving.value) {
    Body.applyForce(whiteBall.body, whiteBall.body.position, {
      x: random(-2000, 2000),
      y: random(-2000, 2000),
    });
  }
}

function keyPressed() {
  setBalls(true);
}

// Set balls on table based on positions from variable snapshots
function setBalls(iteration, isManual) {
  if (isManual) {
    isBallMoving.value = false;
  }
  for (var i = 0; i < snapshots[stops - 1 /* iteration - 1*/].length; i++) {
    if (balls[i].body != null) {
      balls[i].removeFromWorld();
    }
    if (snapshots[stops - 1 /* iteration - 1*/][i] != null)
      balls[i].resetBall(snapshots[stops - 1 /* iteration - 1*/][i].position);
  }
}

// Records positions of balls and saves them to a variable
// Potentialy to a FILE in future
function takeSnapshot() {
  // Record positions of balls and their labels
  var ballPositions = balls.map((ball) => {
    // If white ball is potted (is on negative space) position it back on screen
    if (!world.bodies.find((body) => body.label == "white") && snapshots[0]) {
      ball.resetBall(
        snapshots[0].find((ball) => ball.label == "white").position
      );
    }

    // Return shallow copies of objects if their bodys exist (not potted) because otherwise logic is bugy
    if (ball.body) {
      return {
        position: { ...ball.body.position },
        label: ball.body.label,
      };
    } else {
      return null;
    }
  });

  // Push recorded positions to positions list
  snapshots.push(ballPositions);

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
    if (object.body && object.body.speed > 0.05) {
      isMoving = true;
    }
  });
  return isMoving;
}
