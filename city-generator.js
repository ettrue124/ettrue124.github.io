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
        
        this.setupEventListeners();
        this.initializeSliders();
        this.generateCity();
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
        this.generateFieldGuidedRoads(settings.roadPattern, settings.citySize);
        this.generatePoissonDiscBuildings(settings.buildingStyle, settings.citySize, settings.buildingDensity);
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
    
    // Field-guided road generation (production-grade approach)
    generateFieldGuidedRoads(pattern, size) {
        // Set up canvas clipping
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.clip();
        
        // Generate tensor field based on pattern
        this.tensorField = this.createTensorField(pattern);
        
        // Step A: Generate avenues via field tracing
        this.generateAvenues(size);
        
        // Step B: Generate arterials across the grain
        this.generateArterials(size);
        
        // Step C: Generate local streets
        this.generateLocalStreets(size);
        
        // Step D: Planarize and clean the network
        this.planarizeNetwork();
        
        this.ctx.restore();
    }
    
    createTensorField(pattern) {
        const field = {
            getOrientation: (x, y) => {
                const normalizedX = x / this.canvas.width;
                const normalizedY = y / this.canvas.height;
                
                switch(pattern) {
                    case 'grid':
                        return this.getGridOrientation(normalizedX, normalizedY);
                    case 'organic':
                        return this.getOrganicOrientation(normalizedX, normalizedY);
                    case 'radial':
                        return this.getRadialOrientation(normalizedX, normalizedY);
                    case 'spiral':
                        return this.getSpiralOrientation(normalizedX, normalizedY);
                    case 'fractal':
                        return this.getFractalOrientation(normalizedX, normalizedY);
                    case 'mixed':
                        return this.getMixedOrientation(normalizedX, normalizedY);
                    default:
                        return this.getGridOrientation(normalizedX, normalizedY);
                }
            }
        };
        
        return field;
    }
    
    getGridOrientation(x, y) {
        // Grid pattern: major direction horizontal, minor vertical
        return {
            major: [1, 0],
            minor: [0, 1]
        };
    }
    
    getOrganicOrientation(x, y) {
        // Organic pattern: curved field based on noise
        const angle = this.noise(x * 3, y * 3) * Math.PI * 2;
        const majorAngle = angle + this.noise(x * 5, y * 5) * 0.5;
        const minorAngle = majorAngle + Math.PI / 2;
        
        return {
            major: [Math.cos(majorAngle), Math.sin(majorAngle)],
            minor: [Math.cos(minorAngle), Math.sin(minorAngle)]
        };
    }
    
    getRadialOrientation(x, y) {
        // Radial pattern: major direction towards center
        const centerX = 0.5;
        const centerY = 0.5;
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 0.01) {
            return {
                major: [1, 0],
                minor: [0, 1]
            };
        }
        
        const majorAngle = Math.atan2(dy, dx);
        const minorAngle = majorAngle + Math.PI / 2;
        
        return {
            major: [Math.cos(majorAngle), Math.sin(majorAngle)],
            minor: [Math.cos(minorAngle), Math.sin(minorAngle)]
        };
    }
    
    getSpiralOrientation(x, y) {
        // Spiral pattern: rotating field
        const centerX = 0.5;
        const centerY = 0.5;
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        const spiralAngle = angle + distance * 10;
        const majorAngle = spiralAngle;
        const minorAngle = majorAngle + Math.PI / 2;
        
        return {
            major: [Math.cos(majorAngle), Math.sin(majorAngle)],
            minor: [Math.cos(minorAngle), Math.sin(minorAngle)]
        };
    }
    
    getFractalOrientation(x, y) {
        // Fractal pattern: recursive field
        const scale = 4;
        const angle = this.noise(x * scale, y * scale) * Math.PI * 2;
        const majorAngle = angle + this.noise(x * scale * 2, y * scale * 2) * 0.3;
        const minorAngle = majorAngle + Math.PI / 2;
        
        return {
            major: [Math.cos(majorAngle), Math.sin(majorAngle)],
            minor: [Math.cos(minorAngle), Math.sin(minorAngle)]
        };
    }
    
    getMixedOrientation(x, y) {
        // Mixed pattern: combination of grid and organic
        const grid = this.getGridOrientation(x, y);
        const organic = this.getOrganicOrientation(x, y);
        const blend = this.noise(x * 2, y * 2);
        
        return {
            major: [
                grid.major[0] * (1 - blend) + organic.major[0] * blend,
                grid.major[1] * (1 - blend) + organic.major[1] * blend
            ],
            minor: [
                grid.minor[0] * (1 - blend) + organic.minor[0] * blend,
                grid.minor[1] * (1 - blend) + organic.minor[1] * blend
            ]
        };
    }
    
    noise(x, y) {
        // Simple 2D noise function
        const n = x + y * 57;
        return (Math.sin(n) * 43758.5453) % 1;
    }
    
    // Field helpers
    isBlocked(x, y) {
        // Check if point is blocked by water or out of bounds
        if (x < 0 || x >= this.canvas.width || y < 0 || y >= this.canvas.height) {
            return true;
        }
        
        // Check water bodies
        for (const water of this.cityData.waterBodies) {
            if (x >= water.x && x <= water.x + water.width &&
                y >= water.y && y <= water.y + water.height) {
                return true;
            }
        }
        
        return false;
    }
    
    getDensity(x, y) {
        // Population density function - attracts major roads
        const normalizedX = x / this.canvas.width;
        const normalizedY = y / this.canvas.height;
        
        // Higher density in center, lower at edges
        const centerDistance = Math.sqrt(
            Math.pow(normalizedX - 0.5, 2) + Math.pow(normalizedY - 0.5, 2)
        );
        
        return Math.max(0, 1 - centerDistance * 2);
    }
    
    snapToRoad(point, epsilon = 20) {
        // Snap point to nearest existing road within epsilon
        for (const road of this.cityData.roads) {
            const distance = this.pointToLineDistance(point, road.start, road.end);
            if (distance < epsilon) {
                const snapped = this.closestPointOnLine(point, road.start, road.end);
                return { point: snapped, snapped: true };
            }
        }
        return { point: point, snapped: false };
    }
    
    pointToLineDistance(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) return Math.sqrt(A * A + B * B);
        
        const param = dot / lenSq;
        
        let xx, yy;
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }
        
        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    closestPointOnLine(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) return { x: lineStart.x, y: lineStart.y };
        
        const param = Math.max(0, Math.min(1, dot / lenSq));
        
        return {
            x: lineStart.x + param * C,
            y: lineStart.y + param * D
        };
    }
    
    // Streamline tracer (core of field-guided growth)
    traceStreamline(seed, directionFn, maxLength = 1200, stepSize = 6) {
        const points = [{ x: seed.x, y: seed.y }];
        let currentPoint = { x: seed.x, y: seed.y };
        let length = 0;
        
        while (length < maxLength) {
            const orientation = this.tensorField.getOrientation(currentPoint.x, currentPoint.y);
            const direction = directionFn(orientation);
            
            // Normalize direction
            const magnitude = Math.sqrt(direction[0] * direction[0] + direction[1] * direction[1]);
            if (magnitude === 0) break;
            
            const normalizedDir = [direction[0] / magnitude, direction[1] / magnitude];
            
            // Calculate next point
            const nextPoint = {
                x: currentPoint.x + normalizedDir[0] * stepSize,
                y: currentPoint.y + normalizedDir[1] * stepSize
            };
            
            // Check if blocked
            if (this.isBlocked(nextPoint.x, nextPoint.y)) {
                break;
            }
            
            // Snap to existing roads
            const snapped = this.snapToRoad(nextPoint, 15);
            points.push(snapped.point);
            currentPoint = snapped.point;
            length += stepSize;
            
            // Stop if snapped to existing road
            if (snapped.snapped) {
                break;
            }
            
            // Enforce minimum curvature radius
            if (points.length >= 3) {
                const curvature = this.calculateCurvature(
                    points[points.length - 3],
                    points[points.length - 2],
                    points[points.length - 1]
                );
                if (curvature > 0.1) { // Max curvature threshold
                    break;
                }
            }
        }
        
        return points.length > 1 ? points : null;
    }
    
    calculateCurvature(p1, p2, p3) {
        const v1x = p2.x - p1.x;
        const v1y = p2.y - p1.y;
        const v2x = p3.x - p2.x;
        const v2y = p3.y - p2.y;
        
        const cross = v1x * v2y - v1y * v2x;
        const dot = v1x * v2x + v1y * v2y;
        
        const angle = Math.atan2(cross, dot);
        return Math.abs(angle);
    }
    
    // Step A: Generate avenues via field tracing
    generateAvenues(size) {
        const numSeeds = size === 'small' ? 3 : size === 'medium' ? 5 : 7;
        const roadType = this.roadTypes.highway;
        
        // Generate seed points at density ridges
        const seeds = this.generateDensitySeeds(numSeeds);
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        this.ctx.lineCap = 'round';
        
        for (const seed of seeds) {
            // Trace forward and backward along major direction
            const forwardTrace = this.traceStreamline(seed, (orientation) => orientation.major);
            const backwardTrace = this.traceStreamline(seed, (orientation) => [-orientation.major[0], -orientation.major[1]]);
            
            if (forwardTrace) {
                this.drawRoadPath(forwardTrace, roadType);
                this.cityData.roads.push({
                    start: forwardTrace[0],
                    end: forwardTrace[forwardTrace.length - 1],
                    points: forwardTrace,
                    type: roadType,
                    direction: 'avenue'
                });
            }
            
            if (backwardTrace) {
                this.drawRoadPath(backwardTrace, roadType);
                this.cityData.roads.push({
                    start: backwardTrace[0],
                    end: backwardTrace[backwardTrace.length - 1],
                    points: backwardTrace,
                    type: roadType,
                    direction: 'avenue'
                });
            }
        }
    }
    
    generateDensitySeeds(numSeeds) {
        const seeds = [];
        
        // Add edge seeds
        seeds.push({ x: 0, y: this.canvas.height / 2 });
        seeds.push({ x: this.canvas.width, y: this.canvas.height / 2 });
        seeds.push({ x: this.canvas.width / 2, y: 0 });
        seeds.push({ x: this.canvas.width / 2, y: this.canvas.height });
        
        // Add density-based seeds
        for (let i = 0; i < numSeeds - 4; i++) {
            let bestSeed = null;
            let bestDensity = 0;
            
            // Sample multiple candidates
            for (let attempt = 0; attempt < 50; attempt++) {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height;
                const density = this.getDensity(x, y);
                
                if (density > bestDensity && !this.isBlocked(x, y)) {
                    bestDensity = density;
                    bestSeed = { x, y };
                }
            }
            
            if (bestSeed) {
                seeds.push(bestSeed);
            }
        }
        
        return seeds;
    }
    
    // Step B: Generate arterials across the grain
    generateArterials(size) {
        const roadType = this.roadTypes.arterial;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        this.ctx.lineCap = 'round';
        
        // Sample points along existing avenues
        const arterialSeeds = this.sampleAlongRoads(this.cityData.roads.filter(r => r.type === this.roadTypes.highway), 8);
        
        for (const seed of arterialSeeds) {
            // Trace along minor direction
            const trace = this.traceStreamline(seed, (orientation) => orientation.minor, 800, 6);
            
            if (trace) {
                this.drawRoadPath(trace, roadType);
                this.cityData.roads.push({
                    start: trace[0],
                    end: trace[trace.length - 1],
                    points: trace,
                    type: roadType,
                    direction: 'arterial'
                });
            }
        }
    }
    
    sampleAlongRoads(roads, numSamples) {
        const samples = [];
        
        for (const road of roads) {
            if (road.points && road.points.length > 1) {
                for (let i = 0; i < numSamples; i++) {
                    const t = i / (numSamples - 1);
                    const index = Math.floor(t * (road.points.length - 1));
                    const nextIndex = Math.min(index + 1, road.points.length - 1);
                    const localT = t * (road.points.length - 1) - index;
                    
                    const point = {
                        x: road.points[index].x * (1 - localT) + road.points[nextIndex].x * localT,
                        y: road.points[index].y * (1 - localT) + road.points[nextIndex].y * localT
                    };
                    
                    samples.push(point);
                }
            }
        }
        
        return samples;
    }
    
    // Step C: Generate local streets
    generateLocalStreets(size) {
        const roadType = this.roadTypes.local;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        this.ctx.lineCap = 'round';
        
        // Generate local nodes using Poisson sampling
        const localNodes = this.generatePoissonDiscSampling(20, 40);
        
        // Connect with KNN within radius
        const localEdges = this.createLocalEdges(localNodes, 2, 80);
        
        for (const edge of localEdges) {
            this.ctx.beginPath();
            this.ctx.moveTo(edge.start.x, edge.start.y);
            this.ctx.lineTo(edge.end.x, edge.end.y);
            this.ctx.stroke();
            
            this.cityData.roads.push({
                start: edge.start,
                end: edge.end,
                type: roadType,
                direction: 'local'
            });
        }
    }
    
    createLocalEdges(nodes, k, radius) {
        const edges = [];
        const seen = new Set();
        
        for (let i = 0; i < nodes.length; i++) {
            const neighbors = this.findNeighborsWithinRadius(nodes, i, radius);
            neighbors.sort((a, b) => a.distance - b.distance);
            
            for (let j = 0; j < Math.min(k, neighbors.length); j++) {
                const neighbor = neighbors[j];
                const a = Math.min(i, neighbor.index);
                const b = Math.max(i, neighbor.index);
                const key = `${a}|${b}`;
                
                if (!seen.has(key)) {
                    seen.add(key);
                    edges.push({
                        start: nodes[i],
                        end: nodes[neighbor.index]
                    });
                }
            }
        }
        
        return edges;
    }
    
    findNeighborsWithinRadius(nodes, centerIndex, radius) {
        const neighbors = [];
        const center = nodes[centerIndex];
        
        for (let i = 0; i < nodes.length; i++) {
            if (i === centerIndex) continue;
            
            const distance = Math.sqrt(
                Math.pow(center.x - nodes[i].x, 2) + Math.pow(center.y - nodes[i].y, 2)
            );
            
            if (distance <= radius) {
                neighbors.push({ index: i, distance: distance });
            }
        }
        
        return neighbors;
    }
    
    // Step D: Planarize and clean the network
    planarizeNetwork() {
        // Remove duplicate edges
        this.removeDuplicateEdges();
        
        // Remove short stubs
        this.removeShortStubs(30);
        
        // Smooth roads with cubic splines
        this.smoothRoads();
    }
    
    removeDuplicateEdges() {
        const uniqueRoads = [];
        const seen = new Set();
        
        for (const road of this.cityData.roads) {
            const key1 = `${road.start.x},${road.start.y}-${road.end.x},${road.end.y}`;
            const key2 = `${road.end.x},${road.end.y}-${road.start.x},${road.start.y}`;
            
            if (!seen.has(key1) && !seen.has(key2)) {
                seen.add(key1);
                seen.add(key2);
                uniqueRoads.push(road);
            }
        }
        
        this.cityData.roads = uniqueRoads;
    }
    
    removeShortStubs(minLength) {
        this.cityData.roads = this.cityData.roads.filter(road => {
            const length = Math.sqrt(
                Math.pow(road.end.x - road.start.x, 2) + Math.pow(road.end.y - road.start.y, 2)
            );
            return length >= minLength;
        });
    }
    
    smoothRoads() {
        // Simple smoothing - could be enhanced with cubic splines
        for (const road of this.cityData.roads) {
            if (road.points && road.points.length > 2) {
                // Apply simple smoothing to road points
                const smoothed = this.smoothPoints(road.points, 0.3);
                road.points = smoothed;
            }
        }
    }
    
    smoothPoints(points, alpha) {
        if (points.length < 3) return points;
        
        const smoothed = [points[0]];
        
        for (let i = 1; i < points.length - 1; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const next = points[i + 1];
            
            const smoothedPoint = {
                x: curr.x * (1 - alpha) + (prev.x + next.x) * alpha * 0.5,
                y: curr.y * (1 - alpha) + (prev.y + next.y) * alpha * 0.5
            };
            
            smoothed.push(smoothedPoint);
        }
        
        smoothed.push(points[points.length - 1]);
        return smoothed;
    }
    
    drawRoadPath(points, roadType) {
        if (points.length < 2) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        
        this.ctx.stroke();
    }
    
    generatePoissonDiscBuildings(style, size, density) {
        const baseNumBuildings = size === 'small' ? 20 : size === 'medium' ? 35 : 50;
        const numBuildings = Math.floor(baseNumBuildings * density);
        
        // Generate building positions using Poisson-disc sampling
        const buildingPositions = this.generatePoissonDiscSampling(numBuildings, 30);
        
        for (const position of buildingPositions) {
            const building = this.createBuildingAtPosition(position, style, size);
            if (building) {
                this.drawBuilding(building);
                this.cityData.buildings.push(building);
            }
        }
    }
    
    generatePoissonDiscSampling(numPoints, radius) {
        const points = [];
        const active = [];
        const grid = {};
        const cellSize = radius / Math.sqrt(2);
        
        // Initialize grid
        const gridWidth = Math.ceil(this.canvas.width / cellSize);
        const gridHeight = Math.ceil(this.canvas.height / cellSize);
        
        // Add first point
        const firstPoint = {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height
        };
        
        points.push(firstPoint);
        active.push(firstPoint);
        
        const gridX = Math.floor(firstPoint.x / cellSize);
        const gridY = Math.floor(firstPoint.y / cellSize);
        grid[`${gridX},${gridY}`] = firstPoint;
        
        while (active.length > 0 && points.length < numPoints) {
            const pointIndex = Math.floor(Math.random() * active.length);
            const point = active[pointIndex];
            
            let success = false;
            
            // Try to generate new points around this point
            for (let i = 0; i < 30; i++) {
                const angle = Math.random() * 2 * Math.PI;
                const distance = radius + Math.random() * radius;
                const newPoint = {
                    x: point.x + Math.cos(angle) * distance,
                    y: point.y + Math.sin(angle) * distance
                };
                
                // Check if point is within canvas bounds
                if (newPoint.x < 0 || newPoint.x >= this.canvas.width ||
                    newPoint.y < 0 || newPoint.y >= this.canvas.height) {
                    continue;
                }
                
                // Check if point is far enough from existing points
                const gridX = Math.floor(newPoint.x / cellSize);
                const gridY = Math.floor(newPoint.y / cellSize);
                
                let tooClose = false;
                
                for (let dx = -2; dx <= 2; dx++) {
                    for (let dy = -2; dy <= 2; dy++) {
                        const checkX = gridX + dx;
                        const checkY = gridY + dy;
                        const existingPoint = grid[`${checkX},${checkY}`];
                        
                        if (existingPoint) {
                            const distance = Math.sqrt(
                                Math.pow(newPoint.x - existingPoint.x, 2) + 
                                Math.pow(newPoint.y - existingPoint.y, 2)
                            );
                            if (distance < radius) {
                                tooClose = true;
                                break;
                            }
                        }
                    }
                    if (tooClose) break;
                }
                
                if (!tooClose) {
                    points.push(newPoint);
                    active.push(newPoint);
                    grid[`${gridX},${gridY}`] = newPoint;
                    success = true;
                    break;
                }
            }
            
            if (!success) {
                active.splice(pointIndex, 1);
            }
        }
        
        return points;
    }
    
    createBuildingAtPosition(position, style, size) {
        const minSize = size === 'small' ? 12 : size === 'medium' ? 15 : 20;
        const maxSize = size === 'small' ? 30 : size === 'medium' ? 40 : 50;
        
        const width = minSize + Math.random() * (maxSize - minSize);
        const height = minSize + Math.random() * (maxSize - minSize);
        
        const x = position.x - width / 2;
        const y = position.y - height / 2;
        
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
        
        return null;
    }
    
    isOnRoad(x, y, width, height) {
        const roadBuffer = 15;
        for (let road of this.cityData.roads) {
            const roadStart = road.start;
            const roadEnd = road.end;
            
            if (x < Math.max(roadStart.x, roadEnd.x) + roadBuffer && 
                x + width > Math.min(roadStart.x, roadEnd.x) - roadBuffer &&
                y < Math.max(roadStart.y, roadEnd.y) + roadBuffer && 
                y + height > Math.min(roadStart.y, roadEnd.y) - roadBuffer) {
                return true;
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