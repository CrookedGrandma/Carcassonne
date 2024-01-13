const imageFolder = 'http://localhost:8080/imgs/cropped/';

let csvLines: string[];
let game: Game;
let controls: Controls;

function preload() {
    csvLines = loadStrings('http://localhost:8080/src_corrected.csv');
}

function setup() {
    console.log("🚀 - Setup initialized - P5 is running");

    Math.seedrandom('toyota aygo!');
    game = new Game(csvLines, 100, 5, true, 10).useSatisfactionPlayer().start();

    const canvas = createCanvas(windowWidth, windowHeight);

    controls = new Controls();
    canvas.mouseWheel(e => controls.zoom().worldZoom(e));

    noFill();
    angleMode(DEGREES);
    imageMode(CENTER);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    background(0);

    fill(255);
    textSize(25);

    game.drawUi();

    translate(controls.view.x, controls.view.y);
    scale(controls.view.zoom)
    game.draw();
}

window.mousePressed = e => controls.move().mousePressed(e as MouseEvent);
window.mouseDragged = e => controls.move().mouseDragged(e as MouseEvent);
window.mouseReleased = e => controls.move().mouseReleased(e as MouseEvent);
