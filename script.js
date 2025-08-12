const canvas = document.getElementById('city');
const ctx = canvas.getContext('2d');
const gridSize = 10;
const cellSize = canvas.width / gridSize;
const city = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      ctx.strokeStyle = '#ccc';
      ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      if (city[y][x]) {
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(x * cellSize + 2, y * cellSize + 2, cellSize - 4, cellSize - 4);
      }
    }
  }
}

function updatePopulation() {
  const count = city.flat().filter(Boolean).length * 10;
  document.getElementById('population').textContent = count;
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / cellSize);
  const y = Math.floor((e.clientY - rect.top) / cellSize);
  city[y][x] = city[y][x] ? 0 : 1;
  draw();
  updatePopulation();
});

draw();
