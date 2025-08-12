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
        this.generateProfessionalRoadNetwork(settings.roadPattern, settings.citySize);
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
        // Clear the entire canvas with background color
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
    
    generateProfessionalRoadNetwork(pattern, size) {
        // Set up canvas clipping to keep roads inside bounds
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.clip();
        
        switch(pattern) {
            case 'grid':
                this.generateGridRoadNetwork(size);
                break;
            case 'organic':
                this.generateOrganicRoadNetwork(size);
                break;
            case 'radial':
                this.generateRadialRoadNetwork(size);
                break;
            case 'spiral':
                this.generateSpiralRoadNetwork(size);
                break;
            case 'fractal':
                this.generateFractalRoadNetwork(size);
                break;
            case 'mixed':
                this.generateMixedRoadNetwork(size);
                break;
        }
        
        this.ctx.restore();
    }
    
    generateGridRoadNetwork(size) {
        // Generate major highways using Delaunay triangulation
        this.generateHighwayNetwork(size);
        
        // Generate arterial roads using MST
        this.generateArterialNetwork(size);
        
        // Generate collector roads using K-nearest neighbors
        this.generateCollectorNetwork(size);
        
        // Generate local streets
        this.generateLocalStreetNetwork(size);
        
        // Add interchanges at major intersections
        this.generateInterchanges();
    }
    
    generateHighwayNetwork(size) {
        const numHighways = size === 'small' ? 3 : size === 'medium' ? 4 : 5;
        const roadType = this.roadTypes.highway;
        
        // Generate highway nodes using strategic placement
        const highwayNodes = this.generateHighwayNodes(numHighways);
        
        // Create Delaunay triangulation for highways
        const triangulation = this.createDelaunayTriangulation(highwayNodes);
        
        // Draw highways using triangulation edges
        this.drawTriangulationRoads(triangulation, roadType);
    }
    
    generateHighwayNodes(numHighways) {
        const nodes = [];
        
        // Add edge nodes for major highways
        nodes.push({x: 0, y: this.canvas.height / 2});
        nodes.push({x: this.canvas.width, y: this.canvas.height / 2});
        nodes.push({x: this.canvas.width / 2, y: 0});
        nodes.push({x: this.canvas.width / 2, y: this.canvas.height});
        
        // Add internal connection nodes
        for (let i = 0; i < numHighways - 2; i++) {
            nodes.push({
                x: this.canvas.width * 0.2 + Math.random() * this.canvas.width * 0.6,
                y: this.canvas.height * 0.2 + Math.random() * this.canvas.height * 0.6
            });
        }
        
        return nodes;
    }
    
    createDelaunayTriangulation(points) {
        // Simple Delaunay triangulation implementation
        const triangles = [];
        
        // Create super triangle that contains all points
        const minX = Math.min(...points.map(p => p.x)) - 100;
        const minY = Math.min(...points.map(p => p.y)) - 100;
        const maxX = Math.max(...points.map(p => p.x)) + 100;
        const maxY = Math.max(...points.map(p => p.y)) + 100;
        
        const superTriangle = [
            {x: minX, y: minY},
            {x: maxX, y: minY},
            {x: (minX + maxX) / 2, y: maxY}
        ];
        
        triangles.push(superTriangle);
        
        // Add points one by one
        for (const point of points) {
            const edges = [];
            
            // Find triangles that contain the point
            for (let i = triangles.length - 1; i >= 0; i--) {
                const triangle = triangles[i];
                if (this.pointInTriangle(point, triangle)) {
                    // Remove triangle and add its edges
                    triangles.splice(i, 1);
                    edges.push([triangle[0], triangle[1]]);
                    edges.push([triangle[1], triangle[2]]);
                    edges.push([triangle[2], triangle[0]]);
                }
            }
            
            // Remove duplicate edges
            const uniqueEdges = this.removeDuplicateEdges(edges);
            
            // Create new triangles with the point
            for (const edge of uniqueEdges) {
                triangles.push([edge[0], edge[1], point]);
            }
        }
        
        // Remove triangles that contain super triangle vertices
        for (let i = triangles.length - 1; i >= 0; i--) {
            const triangle = triangles[i];
            if (this.containsSuperTriangleVertex(triangle, superTriangle)) {
                triangles.splice(i, 1);
            }
        }
        
        return triangles;
    }
    
    pointInTriangle(point, triangle) {
        const [a, b, c] = triangle;
        const v0x = c.x - a.x;
        const v0y = c.y - a.y;
        const v1x = b.x - a.x;
        const v1y = b.y - a.y;
        const v2x = point.x - a.x;
        const v2y = point.y - a.y;
        
        const dot00 = v0x * v0x + v0y * v0y;
        const dot01 = v0x * v1x + v0y * v1y;
        const dot02 = v0x * v2x + v0y * v2y;
        const dot11 = v1x * v1x + v1y * v1y;
        const dot12 = v1x * v2x + v1y * v2y;
        
        const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
        const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
        
        return (u >= 0) && (v >= 0) && (u + v < 1);
    }
    
    removeDuplicateEdges(edges) {
        const uniqueEdges = [];
        for (const edge of edges) {
            let isDuplicate = false;
            for (const uniqueEdge of uniqueEdges) {
                if ((edge[0] === uniqueEdge[0] && edge[1] === uniqueEdge[1]) ||
                    (edge[0] === uniqueEdge[1] && edge[1] === uniqueEdge[0])) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                uniqueEdges.push(edge);
            }
        }
        return uniqueEdges;
    }
    
    containsSuperTriangleVertex(triangle, superTriangle) {
        for (const vertex of triangle) {
            for (const superVertex of superTriangle) {
                if (vertex === superVertex) return true;
            }
        }
        return false;
    }
    
    drawTriangulationRoads(triangulation, roadType) {
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        this.ctx.lineCap = 'round';
        
        for (const triangle of triangulation) {
            // Draw edges of triangle as roads
            for (let i = 0; i < 3; i++) {
                const start = triangle[i];
                const end = triangle[(i + 1) % 3];
                
                this.ctx.beginPath();
                this.ctx.moveTo(start.x, start.y);
                this.ctx.lineTo(end.x, end.y);
                this.ctx.stroke();
                
                this.cityData.roads.push({
                    start: start,
                    end: end,
                    type: roadType,
                    direction: 'triangulation'
                });
            }
        }
    }
    
    generateArterialNetwork(size) {
        const numArterials = size === 'small' ? 6 : size === 'medium' ? 8 : 10;
        const roadType = this.roadTypes.arterial;
        
        // Generate arterial nodes
        const arterialNodes = [];
        for (let i = 0; i < numArterials; i++) {
            arterialNodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height
            });
        }
        
        // Create Minimum Spanning Tree for arterials
        const mst = this.createMinimumSpanningTree(arterialNodes);
        
        // Draw arterial roads using MST
        this.drawMSTRoads(mst, roadType);
    }
    
    createMinimumSpanningTree(nodes) {
        const edges = [];
        
        // Create all possible edges
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const distance = Math.sqrt(
                    Math.pow(nodes[i].x - nodes[j].x, 2) + 
                    Math.pow(nodes[i].y - nodes[j].y, 2)
                );
                edges.push({
                    from: i,
                    to: j,
                    distance: distance
                });
            }
        }
        
        // Sort edges by distance
        edges.sort((a, b) => a.distance - b.distance);
        
        // Kruskal's algorithm
        const mst = [];
        const parent = Array(nodes.length).fill().map((_, i) => i);
        
        const find = (x) => {
            if (parent[x] !== x) {
                parent[x] = find(parent[x]);
            }
            return parent[x];
        };
        
        const union = (x, y) => {
            parent[find(x)] = find(y);
        };
        
        for (const edge of edges) {
            if (find(edge.from) !== find(edge.to)) {
                mst.push({
                    start: nodes[edge.from],
                    end: nodes[edge.to]
                });
                union(edge.from, edge.to);
            }
        }
        
        return mst;
    }
    
    drawMSTRoads(mst, roadType) {
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        this.ctx.lineCap = 'round';
        
        for (const edge of mst) {
            this.ctx.beginPath();
            this.ctx.moveTo(edge.start.x, edge.start.y);
            this.ctx.lineTo(edge.end.x, edge.end.y);
            this.ctx.stroke();
            
            this.cityData.roads.push({
                start: edge.start,
                end: edge.end,
                type: roadType,
                direction: 'mst'
            });
        }
    }
    
    generateCollectorNetwork(size) {
        const numCollectors = size === 'small' ? 12 : size === 'medium' ? 16 : 20;
        const roadType = this.roadTypes.collector;
        
        // Generate collector nodes
        const collectorNodes = [];
        for (let i = 0; i < numCollectors; i++) {
            collectorNodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height
            });
        }
        
        // Create K-nearest neighbors network
        const knnEdges = this.createKNearestNeighbors(collectorNodes, 3);
        
        // Draw collector roads using KNN
        this.drawKNNRoads(knnEdges, roadType);
    }
    
    createKNearestNeighbors(nodes, k) {
        const edges = [];
        
        for (let i = 0; i < nodes.length; i++) {
            const distances = [];
            
            // Calculate distances to all other nodes
            for (let j = 0; j < nodes.length; j++) {
                if (i !== j) {
                    const distance = Math.sqrt(
                        Math.pow(nodes[i].x - nodes[j].x, 2) + 
                        Math.pow(nodes[i].y - nodes[j].y, 2)
                    );
                    distances.push({index: j, distance: distance});
                }
            }
            
            // Sort by distance and take k nearest
            distances.sort((a, b) => a.distance - b.distance);
            
            for (let j = 0; j < Math.min(k, distances.length); j++) {
                const neighbor = distances[j];
                // Only add edge if i < neighbor.index to avoid duplicates
                if (i < neighbor.index) {
                    edges.push({
                        start: nodes[i],
                        end: nodes[neighbor.index]
                    });
                }
            }
        }
        
        return edges;
    }
    
    drawKNNRoads(knnEdges, roadType) {
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        this.ctx.lineCap = 'round';
        
        for (const edge of knnEdges) {
            this.ctx.beginPath();
            this.ctx.moveTo(edge.start.x, edge.start.y);
            this.ctx.lineTo(edge.end.x, edge.end.y);
            this.ctx.stroke();
            
            this.cityData.roads.push({
                start: edge.start,
                end: edge.end,
                type: roadType,
                direction: 'knn'
            });
        }
    }
    
    generateLocalStreetNetwork(size) {
        const numLocals = size === 'small' ? 20 : size === 'medium' ? 30 : 40;
        const roadType = this.roadTypes.local;
        
        // Generate local street nodes
        const localNodes = [];
        for (let i = 0; i < numLocals; i++) {
            localNodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height
            });
        }
        
        // Create sparse KNN for local streets
        const localEdges = this.createKNearestNeighbors(localNodes, 2);
        
        // Draw local streets
        this.drawKNNRoads(localEdges, roadType);
    }
    
    generateOrganicRoadNetwork(size) {
        // Generate organic roads using Delaunay + MST
        this.generateArterialNetwork(size);
        this.generateCollectorNetwork(size);
        this.generateLocalStreetNetwork(size);
    }
    
    generateRadialRoadNetwork(size) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const numRadials = size === 'small' ? 6 : size === 'medium' ? 8 : 12;
        const roadType = this.roadTypes.highway;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        this.ctx.lineCap = 'round';
        
        for (let i = 0; i < numRadials; i++) {
            const angle = (i / numRadials) * 2 * Math.PI;
            const endX = centerX + Math.cos(angle) * this.canvas.width * 0.8;
            const endY = centerY + Math.sin(angle) * this.canvas.height * 0.8;
            
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
            
            this.cityData.roads.push({
                start: {x: centerX, y: centerY},
                end: {x: endX, y: endY},
                type: roadType,
                direction: 'radial'
            });
        }
    }
    
    generateSpiralRoadNetwork(size) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(this.canvas.width, this.canvas.height) / 2;
        const roadType = this.roadTypes.highway;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        this.ctx.lineCap = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        
        for (let angle = 0; angle < 6 * Math.PI; angle += 0.1) {
            const radius = (angle / (6 * Math.PI)) * maxRadius;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.stroke();
        
        this.cityData.roads.push({
            start: {x: centerX, y: centerY},
            end: {x: centerX, y: centerY},
            type: roadType,
            direction: 'spiral'
        });
    }
    
    generateFractalRoadNetwork(size) {
        this.generateFractalBranch(this.canvas.width / 2, this.canvas.height / 2, 
                                  Math.min(this.canvas.width, this.canvas.height) / 3, 0, 4);
    }
    
    generateFractalBranch(x, y, length, angle, depth) {
        if (depth === 0) return;
        
        const endX = x + length * Math.cos(angle);
        const endY = y + length * Math.sin(angle);
        
        const roadType = depth > 2 ? this.roadTypes.arterial : 
                        depth > 1 ? this.roadTypes.collector : this.roadTypes.local;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        this.ctx.lineCap = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        this.cityData.roads.push({
            start: {x: x, y: y},
            end: {x: endX, y: endY},
            type: roadType,
            direction: 'fractal'
        });
        
        const newLength = length * 0.7;
        this.generateFractalBranch(endX, endY, newLength, angle + Math.PI/4, depth - 1);
        this.generateFractalBranch(endX, endY, newLength, angle - Math.PI/4, depth - 1);
    }
    
    generateMixedRoadNetwork(size) {
        this.generateGridRoadNetwork(size);
        this.generateOrganicRoadNetwork(size);
    }
    
    generateInterchanges() {
        // Find highway intersections and create interchanges
        const highways = this.cityData.roads.filter(road => road.type === this.roadTypes.highway);
        
        highways.forEach(highway1 => {
            highways.forEach(highway2 => {
                if (highway1 !== highway2) {
                    const intersection = this.findRoadIntersection(highway1, highway2);
                    if (intersection) {
                        this.drawInterchange(intersection);
                    }
                }
            });
        });
    }
    
    findRoadIntersection(road1, road2) {
        // Simple intersection detection
        const mid1 = { x: (road1.start.x + road1.end.x) / 2, y: (road1.start.y + road1.end.y) / 2 };
        const mid2 = { x: (road2.start.x + road2.end.x) / 2, y: (road2.start.y + road2.end.y) / 2 };
        
        const distance = Math.sqrt((mid1.x - mid2.x) ** 2 + (mid1.y - mid2.y) ** 2);
        
        if (distance < 50) {
            return { x: (mid1.x + mid2.x) / 2, y: (mid1.y + mid2.y) / 2 };
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