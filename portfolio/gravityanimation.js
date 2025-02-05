// Create Matter.js engine and world
const { Engine, Render, Runner, Bodies, Body, World, Events} = Matter;
const engine = Engine.create();
const world = engine.world;

// Set up the render
const container = document.getElementById("drop-container");
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
  Bodies.rectangle(0, container_height / 2, 1, container_height, { isStatic: true, render:{ visible: false }}), // Left
  Bodies.rectangle(container_width, container_height / 2, 1, container_height, { isStatic: true, render:{ visible: false }}), // Right
  Bodies.rectangle(container_width / 2, container_height, container_width, 1, { isStatic: true, render:{ visible: false}}), // Bottom
];
World.add(world, boundaries);

// Function to create a rounded rectangle
function createRoundedRectangle(x, y, width, height, cornerRadius) {
  // Create the main rectangle
  const mainRect = Bodies.rectangle(x, y, width, height, { 
    isStatic: true,
  });

  // Create circles for corners
  const topLeft = Bodies.circle(x - width / 2, y - height / 2 + cornerRadius, cornerRadius);
  const topRight = Bodies.circle(x + width / 2, y - height / 2 + cornerRadius, cornerRadius);
  const bottomLeft = Bodies.circle(x - width / 2, y + height / 2 - cornerRadius, cornerRadius);
  const bottomRight = Bodies.circle(x + width / 2, y + height / 2 - cornerRadius, cornerRadius);

  // Combine into a compound body
  const compoundBody = Body.create({
    parts: [mainRect, topLeft, topRight, bottomLeft, bottomRight],
    friction: 0.5,
    restitution: 0.5,
    isStatic: true,
    render: { visible: false },
  });

  return compoundBody;
}

// Create bodies
const imgSDiv = document.getElementById("fallingImage1");
const imgSBody = Bodies.rectangle(250, 100, imgSDiv.offsetWidth, imgSDiv.offsetHeight, { isStatic: true, restitution: 0.3, angularDamping: 0.5, render: { visible: false } });

const btnBlueDiv = document.getElementById("fallingButtonBlue");
const btnBlueBody = createRoundedRectangle(400, 300, btnBlueDiv.offsetWidth - btnBlueDiv.offsetHeight, btnBlueDiv.offsetHeight, btnBlueDiv.offsetHeight/2);

const btnRedDiv = document.getElementById("fallingButtonRed");
const btnRedBody = createRoundedRectangle(700, 200, btnRedDiv.offsetWidth - btnRedDiv.offsetHeight, btnRedDiv.offsetHeight, btnRedDiv.offsetHeight/2);

const blueCircleDiv = document.getElementById("fallingCircleBlue");
const blueCircleBody = Bodies.circle(500, 200, 60,  { isStatic: true, restitution: 0.3, angularDamping: 0.5, render: { visible: false } });

const redCircleDiv = document.getElementById("fallingCircleRed");
const redCircleBody = Bodies.circle(900, 100, 40,  { isStatic: true, restitution: 0.3, angularDamping: 0.5, render: { visible: false } });

const divs = [imgSDiv, btnBlueDiv, btnRedDiv, blueCircleDiv, redCircleDiv];
const bodies = [imgSBody, btnBlueBody, btnRedBody, blueCircleBody, redCircleBody];

const initialPositions = bodies.map(body => ({ x: body.position.x, y: body.position.y }));
const bodySizes = bodies.map(body => ({ width: body.bounds.max.x - body.bounds.min.x, height: body.bounds.max.y - body.bounds.min.y }));

World.add(world, bodies);


// Button Logic
let isDropped = false;
const dropButton = document.getElementById("dropButton");

dropButton.addEventListener("click", () => {
  if (!isDropped) {
    // Drop Bodies
    bodies.forEach(body => {
      Body.setStatic(body, false);
    });
    dropButton.textContent = "Reset";
  } else {
    // Reset Bodies
    bodies.forEach((body, index) => {
      Body.setPosition(body, initialPositions[index]);
      Body.setAngle(body, 0);
      Body.setVelocity(body, { x: 0, y: 0 });
      Body.setStatic(body, true);
    });
    dropButton.textContent = "Drop";
  }
  isDropped = !isDropped;
});

Events.on(engine, "afterUpdate", () => {
  bodies.map((body, index) => { 
    divs[index].style.transform = `translate(${body.position.x - bodySizes[index].width / 2 }px, ${body.position.y - bodySizes[index].height / 2}px) rotate(${body.angle}rad)`
  });
  }
);

// Run the physics engine
Runner.run(Runner.create(), engine); 