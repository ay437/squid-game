const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0xb7c3f3, 1);

const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

// Fixed Variables
const start_position = 6;
const end_position = -start_position;
const text = document.querySelector('.text');
const time_limit = 15;
let gameState = 'loading';
let isLookingBackward = true;

const createCube = (size, posX, rotY = 0, color = 0xfbc851) => {
  const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
  const material = new THREE.MeshBasicMaterial({ color });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(posX, 0, 0);
  cube.rotation.y = rotY;
  scene.add(cube);
  return cube;
};

camera.position.z = 5;

const loader = new THREE.GLTFLoader();

const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

class Doll {
  constructor() {
    loader.load('../model/scene.gltf', (gltf) => {
      scene.add(gltf.scene);
      gltf.scene.scale.set(0.4, 0.4, 0.4);
      gltf.scene.position.set(0, -1, 0);
      this.doll = gltf.scene;
    });
  }

  lookBackward = () => {
    gsap.to(this.doll.rotation, { y: -3.1415, duration: 0.45 });
    setTimeout(() => (isLookingBackward = true), 150);
  };

  lookForward = () => {
    gsap.to(this.doll.rotation, { y: 0, duration: 0.45 });
    setTimeout(() => (isLookingBackward = false), 450);
  };

  start = async () => {
    this.lookBackward();
    await delay(Math.random() * 1000 + 1000);
    this.lookForward();
    await delay(Math.random() * 750 + 750);
    this.start();
  };
}

const createTrack = () => {
  createCube(
    { w: start_position * 2 + 0.21, h: 1.5, d: 1 },
    0,
    0,
    0xe5a716
  ).position.z = -1;
  createCube({ w: 0.2, h: 1.5, d: 1 }, start_position, -0.4);
  createCube({ w: 0.2, h: 1.5, d: 1 }, end_position, 0.4);
};

createTrack();

class Player {
  constructor() {
    const geometry = new THREE.SphereGeometry(0.3, 100, 100);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.z = 1;
    sphere.position.x = start_position - 0.4;
    scene.add(sphere);
    this.player = sphere;
    this.playerInfo = {
      positionX: start_position - 0.4,
      velocity: 0
    };
  }

  run = () => {
    this.playerInfo.velocity = 0.03;
  };

  stop = () => {
    gsap.to(this.playerInfo, { velocity: 0, duration: 0.1 });
  };

  check = () => {
    if (this.playerInfo.velocity > 0 && !isLookingBackward) {
      text.innerText = 'You lost!';
      gameState = 'over';
    }
    if (this.playerInfo.positionX < end_position + 0.8) {
      text.innerText = 'You win!';
      gameState = 'over';
    }
  };

  update = () => {
    this.check();
    this.playerInfo.positionX -= this.playerInfo.velocity;
    this.player.position.x = this.playerInfo.positionX;
  };
}

const player = new Player();

let doll = new Doll();

const init = async () => {
  await delay(1000);
  text.innerText = 'Starting in 3';
  await delay(1000);
  text.innerText = 'Starting in 2';
  await delay(1000);
  text.innerText = 'Starting in 1';
  await delay(1000);
  text.innerText = 'Go!';
  startGame();
};

const startGame = () => {
  gameState = 'started';
  const progressBar = createCube({ w: 5, h: 0.1, d: 1 }, 0);
  progressBar.position.y = 3.35;
  gsap.to(progressBar.scale, { x: 0, duration: time_limit, ease: 'none' });
  doll.start();
  setTimeout(() => {
    if (gameState != 'over') {
      text.innerText = 'You ran out of time!';
      gameState = 'over';
    }
  }, time_limit * 1000);
};

init();

function animate() {
  if (gameState == 'over') return;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
  player.update();
}
animate();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('keydown', (e) => {
  if (gameState !== 'started') return;
  if (e.key == 'ArrowUp') {
    player.run();
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key == 'ArrowUp') {
    player.stop();
  }
});
