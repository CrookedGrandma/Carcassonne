const imageFolder = 'http://localhost:8080/imgs/cropped/';

let csvLines: string[];
let records: any[][];

let imgIndex: number = 0;
let currentImage: p5.Image;

function preload() {
  csvLines = loadStrings('http://localhost:8080/src_fix.csv', lines => {
    records = parse(csvLines);
  });
}

function setup() {
  console.log("🚀 - Setup initialized - P5 is running");

  createCanvas(windowWidth, windowHeight)
  rectMode(CENTER).noFill().frameRate(30);

  nextImage();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
   // CLEAR BACKGROUND
  background(0);

  // CENTER OF SCREEN
  translate(width / 2,height / 2);

  fill(255);
  textSize(25);
  text(records[imgIndex][1], 0, -50);
  if (currentImage)
    image(currentImage, 0, 0, 105, 105);
}

function keyPressed() {
  if (keyCode == LEFT_ARROW) {
    let arr: string[] = Array.from(records[imgIndex][1]);
    arr.push(arr.shift());
    records[imgIndex][1] = arr.join('');
  }
  if (keyCode == RIGHT_ARROW) {
    let arr: string[] = Array.from(records[imgIndex][1]);
    arr.unshift(arr.pop());
    records[imgIndex][1] = arr.join('');
  }
  if (keyCode == ENTER) {
    if (imgIndex + 1 >= records.length) {
      const text = records.map(r => r.join(';')).join('\n');
      console.log(text);
      noLoop();
    }
    else {
      nextImage();
    }
  }
}

function nextImage() {
  imgIndex++;
  console.log(`Loadimg record ${imgIndex + 1} of ${records.length}`);
  loadImage(imageFolder + records[imgIndex][3], img => currentImage = img);
}

function parse(csv: string[]) {
  return csv.filter(l => !!l).map(l => l.split(';'));
}
