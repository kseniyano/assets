// Create Matter.js engine and world
const { Engine, Render, Runner, Bodies, Body, World, Events} = Matter;
const engine = Engine.create();
const world = engine.world;

// Set up the render
const container = document.getElementById("new-drop-container");
const render = Render.create({
  element: container,
  engine: engine,
  options: {
    width: container.offsetWidth,
    height: container.offsetHeight,
    background: "transparent",
    wireframes: false // Render as solid objects
  }
});
Render.run(render);

const container_width = render.options.width;
const container_height = render.options.height;

// Create a static boundaries
 const boundaries = [
  //Bodies.rectangle(container_width / 2, 0, container_width, 1, { isStatic: true }), // Top
  Bodies.rectangle(0, container_height / 2, 1, container_height, { isStatic: true, restitution: 0, friction: 1, render:{ visible: false }}), // Left
  Bodies.rectangle(container_width, container_height / 2, 1, container_height, { isStatic: true, restitution: 0, friction: 1, render:{ visible: false }}), // Right
  Bodies.rectangle(container_width / 2, container_height, container_width, 1, { isStatic: true, restitution: 0, friction: 1, render:{ visible: false}}), // Bottom
];
World.add(world, boundaries);

// Function to create a rounded rectangle
function createRoundedRectangle(x, y, width, height, cornerRadius) {
  // Create the main rectangle
  const mainRect = Bodies.rectangle(x, y, width, height);

  // Create circles for corners
  const topLeft = Bodies.circle(x - width / 2, y - height / 2 + cornerRadius, cornerRadius);
  const topRight = Bodies.circle(x + width / 2, y - height / 2 + cornerRadius, cornerRadius);
  const bottomLeft = Bodies.circle(x - width / 2, y + height / 2 - cornerRadius, cornerRadius);
  const bottomRight = Bodies.circle(x + width / 2, y + height / 2 - cornerRadius, cornerRadius);

  // Combine into a compound body
  const compoundBody = Body.create({
    parts: [mainRect, topLeft, topRight, bottomLeft, bottomRight],
    isStatic: true,
    restitution: 0,
    friction: 1,
    density: 1,
    inertia: 1000,
    frictionAir: 0.05,
    render: { visible: false }
  });

  return compoundBody;
}

// Function to check for overlaps
function isOverlapping(x, y, radius) {
    for (let body of bodies) {
        let dx = body.position.x - x;
        let dy = body.position.y - y;
        let distance = Math.sqrt(dx ** 2 + dy ** 2);

        // Get the stored radius of the existing body
        let bodyRadius = body.customRadius; 

        if (distance < radius + bodyRadius + padding) {
            return true; // Overlapping, reject this position
        }
    }
    return false; // No overlap, valid position
}

let padding, baseRad;
if (container_width < 960){
  padding = 20;
  baseRad = 10;
}else {
  padding = 30;
  baseRad = 30;
}

const bodies = [];
// Generate blue button body
const btnBlueDiv = document.getElementById("fallingButtonBlue");
const btnBlueBody = createRoundedRectangle(Math.random() * (container_width - btnBlueDiv.offsetWidth) + btnBlueDiv.offsetWidth/2,
  Math.random() * (container_height - btnBlueDiv.offsetHeight) + btnBlueDiv.offsetHeight/2, 
  btnBlueDiv.offsetWidth - btnBlueDiv.offsetHeight, btnBlueDiv.offsetHeight, btnBlueDiv.offsetHeight/2);
btnBlueBody.customRadius = btnBlueDiv.offsetWidth / 2;
bodies.push(btnBlueBody);
// Generate red button body
const btnRedDiv = document.getElementById("fallingButtonRed");
let x, y, radius;
do {
      radius = btnRedDiv.offsetWidth / 2;
      x = Math.random() * (container_width - btnRedDiv.offsetWidth) + btnRedDiv.offsetWidth/2;
      y = Math.random() * (container_height - btnRedDiv.offsetHeight) + btnRedDiv.offsetHeight/2;
    } while (isOverlapping(x, y, radius)); // Keep generating until no overlap

const btnRedBody = createRoundedRectangle(x, y, btnRedDiv.offsetWidth - btnRedDiv.offsetHeight, btnRedDiv.offsetHeight, btnRedDiv.offsetHeight/2);
btnRedBody.customRadius = btnRedDiv.offsetWidth / 2;
bodies.push(btnRedBody);

const divs = [btnBlueDiv, btnRedDiv];

let failedAttempts = 0; // Count failed placement attempts
const maxFailures = 100; // Stop after too many failed tries

// Generate non-overlapping bodies
while (failedAttempts < maxFailures) {
    let x, y, radius;
    let shapeColor = Math.random() < 0.5 ? "falling-circle-blue" : "falling-circle-red";
    let tries = 0;

    do {
        radius = Math.ceil(Math.random() * 50 + baseRad); // Random radius
        x = Math.random() * (container_width - radius * 2) + radius;
        y = Math.random() * (container_height - radius * 2) + radius;
        tries++;
    } while (isOverlapping(x, y, radius) && tries < 10); // Try 10 times before giving up

    if (tries >= 10) {
        failedAttempts++; // Count as a failure
        continue; // Skip this iteration and try again
    }

    failedAttempts = 0; // Reset failure count when a circle is placed
    
    // Create body
    let body = Matter.Bodies.circle(x, y, radius, {
        isStatic: true,
        restitution: 0,
        friction: 1,
        density: 0.9, 
        inertia: Infinity,
        frictionAir: 0.05,
        render: { visible: false }
    });

		body.customRadius = radius;
    bodies.push(body);

    let div = document.createElement("div");
    div.classList.add(shapeColor);
    div.style.width = `${radius * 2}px`;
    div.style.height = `${radius * 2}px`;
    container.appendChild(div);
    
    divs.push(div);
}

const initialPositions = bodies.map(body => ({ x: body.position.x, y: body.position.y }));
const bodySizes = bodies.map(body => ({ width: body.bounds.max.x - body.bounds.min.x, height: body.bounds.max.y - body.bounds.min.y }));

World.add(world, bodies);

let timeoutId;

function dropBodies() {
  bodies.forEach(body => {
    Body.setStatic(body, false);
  });

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(() => {
    bodies.forEach(body => {
      Body.setStatic(body, true);
    });
  }, 4000);
}

//Scroll Trigger 
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.create({
  trigger: container, // The element to watch
  start: "top 30%", // When the top of container reaches 75% of the viewport
  once: true, // Trigger only once
  onEnter: () => dropBodies() // Call drop function when scrolled into view
});

// Reset Button Logic
const dropButton = document.getElementById("resetButton");

dropButton.addEventListener("click", () => {
    // Reset Bodies
    bodies.forEach((body, index) => {
      Body.setPosition(body, initialPositions[index]);
      Body.setAngle(body, 0);
      Body.setVelocity(body, { x: 0, y: 0 });
      if (!body.isStatic) {Body.setStatic(body, true)};
    });
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    //Drop again
    setTimeout(() => {
       dropBodies();
    }, 300);
});

Events.on(engine, "afterUpdate", () => {
  bodies.map((body, index) => { 
    divs[index].style.transform = `translate(${body.position.x - bodySizes[index].width / 2 }px, ${body.position.y - bodySizes[index].height / 2}px) rotate(${body.angle}rad)`
  });
  }
);

// Run the physics engine
Runner.run(Runner.create(), engine); 

engine.timing.timeScale = 0.9; // Slow down physics a bit to improve stability
engine.constraintIterations = 12; // Improve collision resolution