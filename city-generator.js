class CityGenerator {
    constructor() {
        this.canvas = document.getElementById('cityCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isGenerating = false;
        
        this.cityData = {
            buildings: [],
            roads: [],
            parks: [],
            waterBodies: [],
            population: 0,
            area: 0,
            name: '',
            founded: '',
            climate: '',
            economy: ''
        };
        
        this.cityNames = [
            'Aurora Falls', 'Crystal Bay', 'Emerald Heights', 'Golden Valley',
            'Silver Springs', 'Azure Harbor', 'Crimson Peak', 'Verdant Grove'
        ];
        
        this.climates = ['Temperate', 'Mediterranean', 'Tropical', 'Continental'];
        this.economies = ['Technology', 'Tourism', 'Manufacturing', 'Finance'];
        
        // Road hierarchy system
        this.roadTypes = {
            highway: { width: 16, color: '#2c3e50', lanes: 4 },
            arterial: { width: 12, color: '#34495e', lanes: 3 },
            collector: { width: 8, color: '#5d6d7e', lanes: 2 },
            local: { width: 6, color: '#85929e', lanes: 1 }
        };
        
        // Terrain generation for realistic pathfinding
        this.terrain = this.generateTerrain();
        
        this.setupEventListeners();
        this.initializeSliders();
        this.generateCity();
    }
    
    generateTerrain() {
        // Generate realistic terrain using multiple noise layers
        const terrain = [];
        const width = Math.ceil(this.canvas.width / 10);
        const height = Math.ceil(this.canvas.height / 10);
        
        for (let y = 0; y < height; y++) {
            terrain[y] = [];
            for (let x = 0; x < width; x++) {
                // Multiple noise layers for realistic terrain
                const baseNoise = this.noise(x * 0.02, y * 0.02);
                const detailNoise = this.noise(x * 0.1, y * 0.1) * 0.3;
                const mountainNoise = this.noise(x * 0.005, y * 0.005) * 2;
                
                let elevation = baseNoise + detailNoise + mountainNoise;
                
                // Create valleys and hills
                const distanceFromCenter = Math.sqrt((x - width/2) ** 2 + (y - height/2) ** 2);
                const centerInfluence = Math.max(0, 1 - distanceFromCenter / (Math.min(width, height) / 2));
                elevation += centerInfluence * 0.5;
                
                terrain[y][x] = Math.max(0, Math.min(1, elevation));
            }
        }
        
        return terrain;
    }
    
    noise(x, y) {
        // Simple 2D noise function
        const n = x + y * 57;
        return (Math.sin(n) * 43758.5453) % 1;
    }
    
    getElevation(x, y) {
        const terrainX = Math.floor(x / 10);
        const terrainY = Math.floor(y / 10);
        
        if (terrainX < 0 || terrainX >= this.terrain[0].length || 
            terrainY < 0 || terrainY >= this.terrain.length) {
            return 0.5;
        }
        
        return this.terrain[terrainY][terrainX];
    }
    
    calculatePathCost(fromX, fromY, toX, toY) {
        const fromElevation = this.getElevation(fromX, fromY);
        const toElevation = this.getElevation(toX, toY);
        
        // Calculate horizontal distance
        const horizontalDist = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
        
        // Calculate elevation difference
        const elevationDiff = Math.abs(toElevation - fromElevation);
        
        // Calculate slope (rise over run)
        const slope = elevationDiff / horizontalDist;
        
        // Non-linear cost function based on Rune's research
        // Power of 2 penalizes steep slopes more than linearly
        const slopeCost = Math.pow(slope * 10, 2);
        
        // Base cost is horizontal distance
        const baseCost = horizontalDist;
        
        // Combine costs with slope penalty
        return baseCost + slopeCost * 5;
    }
    
    findNaturalPath(startX, startY, endX, endY, roadType) {
        // A* pathfinding with terrain-aware cost function
        const openSet = [{x: startX, y: startY, g: 0, h: 0, f: 0, parent: null}];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        
        gScore.set(`${startX},${startY}`, 0);
        fScore.set(`${startX},${startY}`, this.heuristic(startX, startY, endX, endY));
        
        while (openSet.length > 0) {
            // Find node with lowest f score
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            
            if (current.x === endX && current.y === endY) {
                // Reconstruct path
                return this.reconstructPath(cameFrom, current);
            }
            
            const currentKey = `${current.x},${current.y}`;
            closedSet.add(currentKey);
            
            // Check neighbors (8 directions)
            const neighbors = this.getNeighbors(current.x, current.y);
            
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                
                if (closedSet.has(neighborKey)) continue;
                
                const tentativeG = gScore.get(currentKey) + 
                    this.calculatePathCost(current.x, current.y, neighbor.x, neighbor.y);
                
                if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentativeG);
                    fScore.set(neighborKey, tentativeG + this.heuristic(neighbor.x, neighbor.y, endX, endY));
                    
                    const neighborNode = {
                        x: neighbor.x, y: neighbor.y, 
                        g: tentativeG, 
                        h: this.heuristic(neighbor.x, neighbor.y, endX, endY),
                        f: tentativeG + this.heuristic(neighbor.x, neighbor.y, endX, endY),
                        parent: current
                    };
                    
                    if (!openSet.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
                        openSet.push(neighborNode);
                    }
                }
            }
        }
        
        // No path found, return straight line
        return [{x: startX, y: startY}, {x: endX, y: endY}];
    }
    
    getNeighbors(x, y) {
        const neighbors = [];
        const step = 10; // Grid size
        
        // 8-directional movement
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                
                const newX = x + dx * step;
                const newY = y + dy * step;
                
                if (newX >= 0 && newX < this.canvas.width && 
                    newY >= 0 && newY < this.canvas.height) {
                    neighbors.push({x: newX, y: newY});
                }
            }
        }
        
        return neighbors;
    }
    
    heuristic(x1, y1, x2, y2) {
        // Manhattan distance heuristic
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    }
    
    reconstructPath(cameFrom, current) {
        const path = [];
        while (current) {
            path.unshift({x: current.x, y: current.y});
            current = cameFrom.get(`${current.x},${current.y}`);
        }
        return path;
    }
    
    setupEventListeners() {
        document.getElementById('generateBtn').addEventListener('click', () => {
            if (!this.isGenerating) {
                this.generateCity();
            }
        });
        
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveCity();
        });
        
        document.getElementById('shareBtn').addEventListener('click', () => {
            this.shareCity();
        });
        
        document.getElementById('buildingDensity').addEventListener('input', (e) => {
            document.getElementById('densityValue').textContent = e.target.value;
        });
        
        document.getElementById('parkRatio').addEventListener('input', (e) => {
            document.getElementById('parkValue').textContent = e.target.value;
        });
        
        document.getElementById('waterBodies').addEventListener('input', (e) => {
            document.getElementById('waterValue').textContent = e.target.value;
        });
    }
    
    initializeSliders() {
        document.getElementById('densityValue').textContent = document.getElementById('buildingDensity').value;
        document.getElementById('parkValue').textContent = document.getElementById('parkRatio').value;
        document.getElementById('waterValue').textContent = document.getElementById('waterBodies').value;
    }
    
    generateCity() {
        if (this.isGenerating) return;
        
        this.isGenerating = true;
        this.showLoading(true);
        
        setTimeout(() => {
            this.performGeneration();
            this.isGenerating = false;
            this.showLoading(false);
        }, 10);
    }
    
    performGeneration() {
        this.clearCanvas();
        
        this.cityData = {
            buildings: [], roads: [], parks: [], waterBodies: [],
            population: 0, area: 0, name: '', founded: '', climate: '', economy: ''
        };
        
        const settings = this.getSettings();
        
        this.generateCityDetails();
        this.generateWaterBodies(settings.waterCount, settings.citySize);
        this.generateTerrainAwareRoadNetwork(settings.roadPattern, settings.citySize);
        this.generateBuildings(settings.buildingStyle, settings.citySize, settings.buildingDensity);
        this.generateParks(settings.citySize, settings.parkRatio);
        this.generateLandmarks(settings.citySize, settings.buildingStyle);
        
        this.calculateStats();
        this.updateStats();
    }
    
    getSettings() {
        return {
            citySize: document.getElementById('citySize').value,
            buildingStyle: document.getElementById('buildingStyle').value,
            roadPattern: document.getElementById('roadPattern').value,
            buildingDensity: parseFloat(document.getElementById('buildingDensity').value),
            parkRatio: parseFloat(document.getElementById('parkRatio').value),
            waterCount: parseInt(document.getElementById('waterBodies').value),
            timeOfDay: document.getElementById('timeOfDay').value,
            renderQuality: document.getElementById('renderQuality').value
        };
    }
    
    showLoading(show) {
        const overlay = document.querySelector('.canvas-overlay');
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
    
    clearCanvas() {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    generateCityDetails() {
        this.cityData.name = this.cityNames[Math.floor(Math.random() * this.cityNames.length)];
        this.cityData.founded = Math.floor(Math.random() * 200) + 1800;
        this.cityData.climate = this.climates[Math.floor(Math.random() * this.climates.length)];
        this.cityData.economy = this.economies[Math.floor(Math.random() * this.economies.length)];
    }
    
    generateWaterBodies(count, size) {
        for (let i = 0; i < count; i++) {
            const water = this.createWaterBody(size);
            this.drawWaterBody(water);
            this.cityData.waterBodies.push(water);
        }
    }
    
    createWaterBody(size) {
        const baseSize = size === 'small' ? 40 : size === 'medium' ? 60 : size === 'large' ? 80 : 100;
        const type = Math.random() < 0.5 ? 'lake' : 'river';
        
        if (type === 'river') {
            return {
                type: 'river',
                x: 0,
                y: Math.random() * this.canvas.height,
                width: this.canvas.width,
                height: 15 + Math.random() * 10,
                color: '#2980b9'
            };
        } else {
            return {
                type: 'lake',
                x: Math.random() * (this.canvas.width - baseSize),
                y: Math.random() * (this.canvas.height - baseSize),
                width: baseSize + Math.random() * baseSize,
                height: baseSize + Math.random() * baseSize,
                color: '#3498db'
            };
        }
    }
    
    drawWaterBody(water) {
        this.ctx.fillStyle = water.color;
        
        if (water.type === 'river') {
            this.ctx.fillRect(water.x, water.y, water.width, water.height);
        } else {
            this.ctx.beginPath();
            this.ctx.ellipse(water.x + water.width/2, water.y + water.height/2, 
                           water.width/2, water.height/2, 0, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }
    
    generateTerrainAwareRoadNetwork(pattern, size) {
        switch(pattern) {
            case 'grid':
                this.generateTerrainAwareGrid(size);
                break;
            case 'organic':
                this.generateTerrainAwareOrganic(size);
                break;
            case 'radial':
                this.generateTerrainAwareRadial(size);
                break;
            case 'spiral':
                this.generateTerrainAwareSpiral(size);
                break;
            case 'fractal':
                this.generateTerrainAwareFractal(size);
                break;
            case 'mixed':
                this.generateTerrainAwareMixed(size);
                break;
        }
    }
    
    generateTerrainAwareGrid(size) {
        // Generate major highways using terrain-aware pathfinding
        this.generateTerrainAwareHighways(size);
        
        // Generate arterial roads
        this.generateTerrainAwareArterials(size);
        
        // Generate collector roads
        this.generateTerrainAwareCollectors(size);
        
        // Generate local streets
        this.generateTerrainAwareLocals(size);
        
        // Add interchanges at major intersections
        this.generateInterchanges();
    }
    
    generateTerrainAwareHighways(size) {
        const numHighways = size === 'small' ? 2 : size === 'medium' ? 3 : 4;
        const roadType = this.roadTypes.highway;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        this.ctx.lineCap = 'round';
        
        // Create highway network using terrain-aware pathfinding
        const highwayPoints = this.generateHighwayPoints(numHighways);
        
        for (let i = 0; i < highwayPoints.length - 1; i++) {
            const start = highwayPoints[i];
            const end = highwayPoints[i + 1];
            
            const path = this.findNaturalPath(start.x, start.y, end.x, end.y, roadType);
            this.drawTerrainAwareRoad(path, roadType);
            
            this.cityData.roads.push({
                path: path,
                type: 'highway',
                direction: 'terrain-aware'
            });
        }
    }
    
    generateHighwayPoints(numHighways) {
        const points = [];
        
        // Add edge points for highways to cross the city
        points.push({x: 0, y: this.canvas.height / 2});
        points.push({x: this.canvas.width, y: this.canvas.height / 2});
        points.push({x: this.canvas.width / 2, y: 0});
        points.push({x: this.canvas.width / 2, y: this.canvas.height});
        
        // Add some internal connection points
        for (let i = 0; i < numHighways - 2; i++) {
            points.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height
            });
        }
        
        return points;
    }
    
    generateTerrainAwareArterials(size) {
        const numArterials = size === 'small' ? 4 : size === 'medium' ? 6 : 8;
        const roadType = this.roadTypes.arterial;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        
        for (let i = 0; i < numArterials; i++) {
            const startX = Math.random() * this.canvas.width;
            const startY = Math.random() * this.canvas.height;
            const endX = Math.random() * this.canvas.width;
            const endY = Math.random() * this.canvas.height;
            
            const path = this.findNaturalPath(startX, startY, endX, endY, roadType);
            this.drawTerrainAwareRoad(path, roadType);
            
            this.cityData.roads.push({
                path: path,
                type: 'arterial',
                direction: 'terrain-aware'
            });
        }
    }
    
    generateTerrainAwareCollectors(size) {
        const numCollectors = size === 'small' ? 8 : size === 'medium' ? 12 : 16;
        const roadType = this.roadTypes.collector;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        
        for (let i = 0; i < numCollectors; i++) {
            const startX = Math.random() * this.canvas.width;
            const startY = Math.random() * this.canvas.height;
            const endX = Math.random() * this.canvas.width;
            const endY = Math.random() * this.canvas.height;
            
            const path = this.findNaturalPath(startX, startY, endX, endY, roadType);
            this.drawTerrainAwareRoad(path, roadType);
            
            this.cityData.roads.push({
                path: path,
                type: 'collector',
                direction: 'terrain-aware'
            });
        }
    }
    
    generateTerrainAwareLocals(size) {
        const numLocals = size === 'small' ? 15 : size === 'medium' ? 25 : 35;
        const roadType = this.roadTypes.local;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        
        for (let i = 0; i < numLocals; i++) {
            const startX = Math.random() * this.canvas.width;
            const startY = Math.random() * this.canvas.height;
            const endX = Math.random() * this.canvas.width;
            const endY = Math.random() * this.canvas.height;
            
            const path = this.findNaturalPath(startX, startY, endX, endY, roadType);
            this.drawTerrainAwareRoad(path, roadType);
            
            this.cityData.roads.push({
                path: path,
                type: 'local',
                direction: 'terrain-aware'
            });
        }
    }
    
    drawTerrainAwareRoad(path, roadType) {
        if (path.length < 2) return;
        
        // Draw main road path
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);
        
        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(path[i].x, path[i].y);
        }
        
        this.ctx.stroke();
        
        // Draw lane dividers
        this.drawTerrainAwareLaneDividers(path, roadType);
    }
    
    drawTerrainAwareLaneDividers(path, roadType) {
        const laneWidth = roadType.width / roadType.lanes;
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        
        for (let i = 1; i < roadType.lanes; i++) {
            const offset = (i * laneWidth) - (roadType.width / 2);
            
            this.ctx.beginPath();
            this.ctx.moveTo(path[0].x, path[0].y + offset);
            
            for (let j = 1; j < path.length; j++) {
                this.ctx.lineTo(path[j].x, path[j].y + offset);
            }
            
            this.ctx.stroke();
        }
        
        // Reset stroke style
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
    }
    
    generateTerrainAwareOrganic(size) {
        // Generate organic roads that follow terrain contours
        this.generateTerrainAwareArterials(size);
        this.generateTerrainAwareCollectors(size);
        this.generateTerrainAwareLocals(size);
    }
    
    generateTerrainAwareRadial(size) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const numRadials = size === 'small' ? 6 : size === 'medium' ? 8 : 12;
        const roadType = this.roadTypes.highway;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        
        for (let i = 0; i < numRadials; i++) {
            const angle = (i / numRadials) * 2 * Math.PI;
            const endX = centerX + Math.cos(angle) * this.canvas.width * 0.8;
            const endY = centerY + Math.sin(angle) * this.canvas.height * 0.8;
            
            const path = this.findNaturalPath(centerX, centerY, endX, endY, roadType);
            this.drawTerrainAwareRoad(path, roadType);
            
            this.cityData.roads.push({
                path: path,
                type: 'highway',
                direction: 'radial'
            });
        }
    }
    
    generateTerrainAwareSpiral(size) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(this.canvas.width, this.canvas.height) / 2;
        const roadType = this.roadTypes.highway;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        
        // Generate spiral using terrain-aware pathfinding
        const spiralPoints = [];
        for (let angle = 0; angle < 6 * Math.PI; angle += 0.2) {
            const radius = (angle / (6 * Math.PI)) * maxRadius;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            spiralPoints.push({x: x, y: y});
        }
        
        this.drawTerrainAwareRoad(spiralPoints, roadType);
        
        this.cityData.roads.push({
            path: spiralPoints,
            type: 'highway',
            direction: 'spiral'
        });
    }
    
    generateTerrainAwareFractal(size) {
        this.generateFractalBranch(this.canvas.width / 2, this.canvas.height / 2, 
                                  Math.min(this.canvas.width, this.canvas.height) / 3, 0, 4);
    }
    
    generateFractalBranch(x, y, length, angle, depth) {
        if (depth === 0) return;
        
        const endX = x + length * Math.cos(angle);
        const endY = y + length * Math.sin(angle);
        
        const roadType = depth > 2 ? this.roadTypes.arterial : 
                        depth > 1 ? this.roadTypes.collector : this.roadTypes.local;
        
        const path = this.findNaturalPath(x, y, endX, endY, roadType);
        this.drawTerrainAwareRoad(path, roadType);
        
        this.cityData.roads.push({
            path: path,
            type: roadType === this.roadTypes.arterial ? 'arterial' : 
                  roadType === this.roadTypes.collector ? 'collector' : 'local',
            direction: 'fractal'
        });
        
        const newLength = length * 0.7;
        this.generateFractalBranch(endX, endY, newLength, angle + Math.PI/4, depth - 1);
        this.generateFractalBranch(endX, endY, newLength, angle - Math.PI/4, depth - 1);
    }
    
    generateTerrainAwareMixed(size) {
        this.generateTerrainAwareGrid(size);
        this.generateTerrainAwareOrganic(size);
    }
    
    generateInterchanges() {
        // Find highway intersections and create interchanges
        const highways = this.cityData.roads.filter(road => road.type === 'highway');
        
        highways.forEach(highway1 => {
            highways.forEach(highway2 => {
                if (highway1 !== highway2) {
                    const intersection = this.findPathIntersection(highway1.path, highway2.path);
                    if (intersection) {
                        this.drawInterchange(intersection);
                    }
                }
            });
        });
    }
    
    findPathIntersection(path1, path2) {
        // Simple intersection detection between two paths
        for (let i = 0; i < path1.length - 1; i++) {
            for (let j = 0; j < path2.length - 1; j++) {
                const intersection = this.lineIntersection(
                    path1[i], path1[i + 1], path2[j], path2[j + 1]
                );
                if (intersection) return intersection;
            }
        }
        return null;
    }
    
    lineIntersection(p1, p2, p3, p4) {
        const x1 = p1.x, y1 = p1.y;
        const x2 = p2.x, y2 = p2.y;
        const x3 = p3.x, y3 = p3.y;
        const x4 = p4.x, y4 = p4.y;
        
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 0.001) return null;
        
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
        
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: x1 + t * (x2 - x1),
                y: y1 + t * (y2 - y1)
            };
        }
        
        return null;
    }
    
    drawInterchange(intersection) {
        const radius = 20;
        
        // Draw interchange circle
        this.ctx.fillStyle = '#34495e';
        this.ctx.beginPath();
        this.ctx.arc(intersection.x, intersection.y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Draw ramp connections
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 4;
        
        for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 2) {
            const startX = intersection.x + Math.cos(angle) * radius;
            const startY = intersection.y + Math.sin(angle) * radius;
            const endX = intersection.x + Math.cos(angle) * (radius + 15);
            const endY = intersection.y + Math.sin(angle) * (radius + 15);
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
    }
    
    generateBuildings(style, size, density) {
        const baseNumBuildings = size === 'small' ? 20 : size === 'medium' ? 35 : 50;
        const numBuildings = Math.floor(baseNumBuildings * density);
        
        for (let i = 0; i < numBuildings; i++) {
            const building = this.createBuilding(style, size);
            if (building) {
                this.drawBuilding(building);
                this.cityData.buildings.push(building);
            }
        }
    }
    
    createBuilding(style, size) {
        const minSize = size === 'small' ? 12 : size === 'medium' ? 15 : 20;
        const maxSize = size === 'small' ? 30 : size === 'medium' ? 40 : 50;
        
        const width = minSize + Math.random() * (maxSize - minSize);
        const height = minSize + Math.random() * (maxSize - minSize);
        
        for (let attempts = 0; attempts < 50; attempts++) {
            const x = Math.random() * (this.canvas.width - width);
            const y = Math.random() * (this.canvas.height - height);
            
            if (!this.isOnRoad(x, y, width, height) && !this.isOnWater(x, y, width, height)) {
                return {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    style: style,
                    color: this.getBuildingColor(style),
                    floors: Math.floor(Math.random() * 3) + 1
                };
            }
        }
        
        return null;
    }
    
    isOnRoad(x, y, width, height) {
        const roadBuffer = 15;
        for (let road of this.cityData.roads) {
            if (road.path) {
                // Check if building intersects with any road path
                for (let i = 0; i < road.path.length - 1; i++) {
                    const roadX1 = road.path[i].x;
                    const roadY1 = road.path[i].y;
                    const roadX2 = road.path[i + 1].x;
                    const roadY2 = road.path[i + 1].y;
                    
                    if (x < Math.max(roadX1, roadX2) + roadBuffer && 
                        x + width > Math.min(roadX1, roadX2) - roadBuffer &&
                        y < Math.max(roadY1, roadY2) + roadBuffer && 
                        y + height > Math.min(roadY1, roadY2) - roadBuffer) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    isOnWater(x, y, width, height) {
        for (let water of this.cityData.waterBodies) {
            if (x < water.x + water.width && x + width > water.x &&
                y < water.y + water.height && y + height > water.y) {
                return true;
            }
        }
        return false;
    }
    
    getBuildingColor(style) {
        const colors = {
            modern: ['#3498db', '#2980b9', '#5dade2'],
            classical: ['#e67e22', '#d35400', '#f39c12'],
            futuristic: ['#9b59b6', '#8e44ad', '#bb8fce'],
            gothic: ['#2c3e50', '#34495e', '#7f8c8d'],
            asian: ['#e74c3c', '#c0392b', '#f39c12'],
            mixed: ['#3498db', '#e67e22', '#9b59b6', '#2ecc71']
        };
        
        const styleColors = colors[style] || colors.mixed;
        return styleColors[Math.floor(Math.random() * styleColors.length)];
    }
    
    drawBuilding(building) {
        this.ctx.fillStyle = building.color;
        this.ctx.fillRect(building.x, building.y, building.width, building.height);
        
        this.ctx.fillStyle = '#f1c40f';
        const windowSize = 2;
        const spacing = 4;
        
        for (let floor = 0; floor < building.floors; floor++) {
            const floorY = building.y + (building.height / building.floors) * floor + spacing;
            const windowsInRow = Math.min(3, Math.floor(building.width / (windowSize + spacing)) - 1);
            
            for (let i = 0; i < windowsInRow; i++) {
                const windowX = building.x + spacing + (i * (windowSize + spacing));
                this.ctx.fillRect(windowX, floorY, windowSize, windowSize);
            }
        }
        
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(building.x, building.y, building.width, building.height);
    }
    
    generateParks(size, ratio) {
        const baseNumParks = size === 'small' ? 2 : size === 'medium' ? 4 : 6;
        const numParks = Math.floor(baseNumParks * ratio * 10);
        
        for (let i = 0; i < numParks; i++) {
            const park = this.createPark(size);
            if (park) {
                this.drawPark(park);
                this.cityData.parks.push(park);
            }
        }
    }
    
    createPark(size) {
        const baseSize = size === 'small' ? 25 : size === 'medium' ? 35 : 45;
        const parkSize = baseSize + Math.random() * baseSize * 0.5;
        
        for (let attempts = 0; attempts < 30; attempts++) {
            const x = Math.random() * (this.canvas.width - parkSize);
            const y = Math.random() * (this.canvas.height - parkSize);
            
            if (!this.isOnRoad(x, y, parkSize, parkSize) && !this.isOnWater(x, y, parkSize, parkSize)) {
                return {
                    x: x,
                    y: y,
                    size: parkSize,
                    trees: Math.floor(Math.random() * 5) + 3
                };
            }
        }
        
        return null;
    }
    
    drawPark(park) {
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(park.x, park.y, park.size, park.size);
        
        this.ctx.fillStyle = '#2d5a27';
        for (let i = 0; i < park.trees; i++) {
            const treeX = park.x + Math.random() * park.size;
            const treeY = park.y + Math.random() * park.size;
            const treeSize = 3 + Math.random() * 3;
            
            this.ctx.beginPath();
            this.ctx.arc(treeX, treeY, treeSize, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }
    
    generateLandmarks(size, style) {
        const numLandmarks = size === 'small' ? 1 : size === 'medium' ? 2 : 3;
        
        for (let i = 0; i < numLandmarks; i++) {
            const landmark = this.createLandmark(style);
            this.drawLandmark(landmark);
        }
    }
    
    createLandmark(style) {
        return {
            x: Math.random() * (this.canvas.width - 50),
            y: Math.random() * (this.canvas.height - 50),
            width: 30 + Math.random() * 20,
            height: 40 + Math.random() * 30,
            style: style
        };
    }
    
    drawLandmark(landmark) {
        this.ctx.fillStyle = '#f39c12';
        this.ctx.fillRect(landmark.x, landmark.y, landmark.width, landmark.height);
        
        this.ctx.strokeStyle = '#e67e22';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(landmark.x, landmark.y, landmark.width, landmark.height);
    }
    
    calculateStats() {
        let population = 0;
        let area = 0;
        
        for (let building of this.cityData.buildings) {
            const buildingArea = building.width * building.height;
            area += buildingArea;
            population += Math.floor(buildingArea / 8) * building.floors;
        }
        
        population += this.cityData.parks.length * 50;
        population += this.cityData.waterBodies.length * 200;
        population += Math.floor(Math.random() * 1000);
        
        this.cityData.population = population;
        this.cityData.area = Math.floor(area / 1000);
    }
    
    updateStats() {
        document.getElementById('buildingCount').textContent = this.cityData.buildings.length;
        document.getElementById('roadCount').textContent = this.cityData.roads.length;
        document.getElementById('parkCount').textContent = this.cityData.parks.length;
        document.getElementById('waterCount').textContent = this.cityData.waterBodies.length;
        document.getElementById('population').textContent = this.cityData.population.toLocaleString();
        document.getElementById('cityArea').textContent = this.cityData.area;
        document.getElementById('cityName').textContent = this.cityData.name;
        document.getElementById('cityFounded').textContent = this.cityData.founded;
        document.getElementById('cityClimate').textContent = this.cityData.climate;
        document.getElementById('cityEconomy').textContent = this.cityData.economy;
    }
    
    saveCity() {
        const link = document.createElement('a');
        link.download = `${this.cityData.name}-city.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    }
    
    shareCity() {
        if (navigator.share) {
            navigator.share({
                title: `${this.cityData.name} - Procedural City`,
                text: `Check out this procedurally generated city: ${this.cityData.name}!`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('City URL copied to clipboard!');
            });
        }
    }
}

// Initialize the city generator
document.addEventListener('DOMContentLoaded', () => {
    new CityGenerator();
});