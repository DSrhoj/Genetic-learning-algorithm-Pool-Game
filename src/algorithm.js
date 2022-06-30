//Constants for the genetic algorithm.
const GENERATIONS = 2;
const POP_SIZE = 100; // Must be greater than 2
const MUTATION_PROBABILITY = 0.01;
const NUM_ELITES = 0;
const MATING_POOL_SIZE = Math.ceil(POP_SIZE / 2);
const CROSSOVER_PROBABILITY = 0.2;
const LOWER_BOUND = 0;
const UPPER_BOUND = 4000;
const BOUND_OFFSET = (UPPER_BOUND - LOWER_BOUND) / 2;
const SPEED_MULTIPLYER = 500;
const SHOT_DELAY_MILISECONDS = 1;

//Initial random population of shots.
var population = generateInitialPopulation();

//Generates POP_SIZE random direction shots with fitness initialized to 0.
function generateInitialPopulation() {
  let pop = [];
  for (let count = 0; count < POP_SIZE; count++) {
    x = randomNumber(-2000, 2000);
    y = Math.floor(
      randomNumber(
        -Math.sqrt(Math.pow(2000, 2) - Math.pow(x, 2)),
        Math.sqrt(Math.pow(2000, 2) - Math.pow(x, 2))
      )
    );
    let temp = {
      x,
      y,
      fitness: 0,
    };
    pop.push(temp);
  }

  return pop;
}

function crossAndMutate(population) {
  matingPool = linearRankSelection(population, MATING_POOL_SIZE);
  population = crossover(matingPool);
  population = mutate(population);
  return population;
}

function crossover(matingPool) {
  newPopulation = [];
  for (let br = 0; br < POP_SIZE - NUM_ELITES; br++) {
    ind1 = Math.floor(Math.random() * MATING_POOL_SIZE);
    do {
      ind2 = Math.floor(Math.random() * MATING_POOL_SIZE);
    } while (ind1 == ind2);
    if (Math.random() <= CROSSOVER_PROBABILITY) {
      const r = Math.random();
      const newX =
        matingPool[ind1].x + (matingPool[ind2].x - matingPool[ind1].x) * r;
      const newY =
        matingPool[ind1].y + (matingPool[ind2].y - matingPool[ind1].y) * r;
      let tempIndividual = {
        x: Math.floor(newX),
        y: Math.floor(newY),
        fitness: 0,
      };
      newPopulation.push(tempIndividual);
      console.log("Crossover reproducing a new child", tempIndividual);
    } else {
      newPopulation.push(matingPool[ind1]);
      console.log("Passing parent to new generation", matingPool[ind1]);
    }
  }
  return newPopulation;
}

function linearRankSelection(population, matingPoolSize) {
  let matingPool = [];
  population = population.sort(function (a, b) {
    return a.fitness - b.fitness;
  });
  let prev = 0;
  let q;
  population = population.map((individual, index) => {
    prev += q || 0.0;
    q =
      (2 * (index + 1)) / (population.length * (population.length + 1)) + prev;
    return {
      individual,
      q,
    };
  });
  for (let i = 0; i < matingPoolSize; i++) {
    matingPool.push(
      population.find((value) => Math.random() < value.q).individual
    );
  }
  return matingPool;
}

function mutate(population) {
  return population.map((individual) => {
    let newX = actualMutation(
      individual.x + BOUND_OFFSET,
      MUTATION_PROBABILITY,
      LOWER_BOUND,
      UPPER_BOUND
    );
    let newY = actualMutation(
      individual.y + BOUND_OFFSET,
      MUTATION_PROBABILITY,
      LOWER_BOUND,
      UPPER_BOUND
    );
    if (newX != individual.x || newY != individual.y) {
      let tempIndividual = {
        x: newX,
        y: newY,
        fitness: 0,
      };
      console.log("Successful mutation", tempIndividual);
      return tempIndividual;
    } else {
      console.log("Skipping mutation", individual);
      return individual;
    }
  });
}

function actualMutation(number, mutationProbability, lowerBound, upperBound) {
  let newGrayCode = null;
  do {
    grayDec = decToGrayDec(number);
    grayCode = grayDec.toString(2);
    newGrayCode = newGrayCode = mutateGrayCodeWithProbability(
      grayCode,
      mutationProbability
    );
    newGrayDec = parseInt(newGrayCode, 2);
    newDec = grayDecToDec(newGrayDec);
  } while (!(newDec > lowerBound && newDec < upperBound));
  return newDec - BOUND_OFFSET;
}

function mutateGrayCodeWithProbability(grayCode, mutationProbability) {
  let result = "";
  for (let i = 0; i < grayCode.length; i++) {
    let shouldWeMutate = Math.random() <= mutationProbability;
    if (shouldWeMutate) {
      if (grayCode[i] == "1") result += "0";
      else if (grayCode[i] == "0") result += "1";
      else result += "+";
    } else {
      result += grayCode[i];
    }
  }
  return result;
}

// Code taken from https://www.geeksforgeeks.org/decimal-equivalent-gray-code-inverse/
function decToGrayDec(n) {
  /* Right Shift the number by 1 taking xor with original number */
  return n ^ (n >> 1);
}

// Code taken from https://www.geeksforgeeks.org/decimal-equivalent-gray-code-inverse/
function grayDecToDec(n) {
  let dec = 0;

  for (; n; n = n >> 1) dec ^= n;

  return dec;
}

//Just automaticlly shoots the given shot after 1 second.
function AIshoot(individual) {
  let t = setTimeout(() => {
    var whiteBall = balls.find((ball) => ball && ball.id == 1);
    if (!isBallMoving.value) {
      Body.applyForce(whiteBall.body, whiteBall.body.position, {
        x: individual.x,
        y: individual.y,
      });
    }
  }, SHOT_DELAY_MILISECONDS);
}

function randomNumber(max, min) {
  return Math.floor(Math.random() * (max - min)) + min;
}
