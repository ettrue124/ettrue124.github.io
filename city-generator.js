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
        this.generateRealisticRoadNetwork(settings.roadPattern, settings.citySize);
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
    
    generateRealisticRoadNetwork(pattern, size) {
        switch(pattern) {
            case 'grid':
                this.generateRealisticGrid(size);
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
    }
    
    generateRealisticGrid(size) {
        // Generate highways first (major arteries)
        this.generateHighways(size);
        
        // Generate arterial roads
        this.generateArterialRoads(size);
        
        // Generate collector roads
        this.generateCollectorRoads(size);
        
        // Generate local streets
        this.generateLocalStreets(size);
        
        // Add interchanges at major intersections
        this.generateInterchanges();
    }
    
    generateHighways(size) {
        const spacing = size === 'small' ? 120 : size === 'medium' ? 100 : 80;
        const roadType = this.roadTypes.highway;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        this.ctx.lineCap = 'round';
        
        // Major highways with slight curves for realism
        const highways = [];
        
        // Horizontal highways with gentle curves
        for (let y = spacing; y < this.canvas.height; y += spacing * 2) {
            const highway = this.createCurvedRoad(0, y, this.canvas.width, y, roadType, 0.1);
            this.drawCurvedRoad(highway, roadType);
            highways.push(highway);
        }
        
        // Vertical highways with gentle curves
        for (let x = spacing; x < this.canvas.width; x += spacing * 2) {
            const highway = this.createCurvedRoad(x, 0, x, this.canvas.height, roadType, 0.1);
            this.drawCurvedRoad(highway, roadType);
            highways.push(highway);
        }
        
        highways.forEach(highway => {
            this.cityData.roads.push(highway);
        });
    }
    
    generateArterialRoads(size) {
        const spacing = size === 'small' ? 80 : size === 'medium' ? 60 : 50;
        const roadType = this.roadTypes.arterial;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        
        // Arterial roads between highways with curves
        const arterials = [];
        
        // Horizontal arterials
        for (let y = spacing; y < this.canvas.height; y += spacing) {
            if (y % (spacing * 2) !== 0) { // Avoid overlapping with highways
                const arterial = this.createCurvedRoad(0, y, this.canvas.width, y, roadType, 0.15);
                this.drawCurvedRoad(arterial, roadType);
                arterials.push(arterial);
            }
        }
        
        // Vertical arterials
        for (let x = spacing; x < this.canvas.width; x += spacing) {
            if (x % (spacing * 2) !== 0) { // Avoid overlapping with highways
                const arterial = this.createCurvedRoad(x, 0, x, this.canvas.height, roadType, 0.15);
                this.drawCurvedRoad(arterial, roadType);
                arterials.push(arterial);
            }
        }
        
        arterials.forEach(arterial => {
            this.cityData.roads.push(arterial);
        });
    }
    
    generateCollectorRoads(size) {
        const spacing = size === 'small' ? 60 : size === 'medium' ? 40 : 30;
        const roadType = this.roadTypes.collector;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        
        // Collector roads with more organic curves
        const collectors = [];
        
        for (let x = spacing; x < this.canvas.width; x += spacing) {
            for (let y = spacing; y < this.canvas.height; y += spacing) {
                if (Math.random() < 0.3) { // 30% chance of collector road
                    const endX = x + spacing;
                    const endY = y + spacing;
                    
                    if (endX < this.canvas.width && endY < this.canvas.height) {
                        const collector = this.createCurvedRoad(x, y, endX, endY, roadType, 0.2);
                        this.drawCurvedRoad(collector, roadType);
                        collectors.push(collector);
                    }
                }
            }
        }
        
        collectors.forEach(collector => {
            this.cityData.roads.push(collector);
        });
    }
    
    generateLocalStreets(size) {
        const spacing = size === 'small' ? 40 : size === 'medium' ? 30 : 25;
        const roadType = this.roadTypes.local;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        
        // Local streets with organic curves
        const locals = [];
        
        for (let x = spacing; x < this.canvas.width; x += spacing) {
            for (let y = spacing; y < this.canvas.height; y += spacing) {
                if (Math.random() < 0.2) { // 20% chance of local street
                    const endX = x + spacing;
                    const endY = y + spacing;
                    
                    if (endX < this.canvas.width && endY < this.canvas.height) {
                        const local = this.createCurvedRoad(x, y, endX, endY, roadType, 0.25);
                        this.drawCurvedRoad(local, roadType);
                        locals.push(local);
                    }
                }
            }
        }
        
        locals.forEach(local => {
            this.cityData.roads.push(local);
        });
    }
    
    createCurvedRoad(startX, startY, endX, endY, roadType, curveIntensity) {
        // Create a curved road using control points
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        
        // Add random offset for natural curves
        const offsetX = (Math.random() - 0.5) * curveIntensity * Math.abs(endX - startX);
        const offsetY = (Math.random() - 0.5) * curveIntensity * Math.abs(endY - startY);
        
        const controlX = midX + offsetX;
        const controlY = midY + offsetY;
        
        return {
            start: { x: startX, y: startY },
            control: { x: controlX, y: controlY },
            end: { x: endX, y: endY },
            type: roadType,
            direction: 'curved'
        };
    }
    
    drawCurvedRoad(road, roadType) {
        // Draw curved road using quadratic curves
        this.ctx.beginPath();
        this.ctx.moveTo(road.start.x, road.start.y);
        this.ctx.quadraticCurveTo(road.control.x, road.control.y, road.end.x, road.end.y);
        this.ctx.stroke();
        
        // Draw lane dividers
        this.drawCurvedLaneDividers(road, roadType);
    }
    
    drawCurvedLaneDividers(road, roadType) {
        const laneWidth = roadType.width / roadType.lanes;
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        
        for (let i = 1; i < roadType.lanes; i++) {
            const offset = (i * laneWidth) - (roadType.width / 2);
            
            // Draw parallel curve for lane divider
            this.ctx.beginPath();
            this.ctx.moveTo(road.start.x, road.start.y + offset);
            this.ctx.quadraticCurveTo(road.control.x, road.control.y + offset, road.end.x, road.end.y + offset);
            this.ctx.stroke();
        }
        
        // Reset stroke style
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
    }
    
    generateInterchanges() {
        // Find highway intersections and create interchanges
        const highways = this.cityData.roads.filter(road => road.type === this.roadTypes.highway);
        
        highways.forEach(highway1 => {
            highways.forEach(highway2 => {
                if (highway1 !== highway2) {
                    const intersection = this.findCurvedRoadIntersection(highway1, highway2);
                    if (intersection) {
                        this.drawInterchange(intersection);
                    }
                }
            });
        });
    }
    
    findCurvedRoadIntersection(road1, road2) {
        // Simplified intersection detection for curved roads
        const mid1 = { x: (road1.start.x + road1.end.x) / 2, y: (road1.start.y + road1.end.y) / 2 };
        const mid2 = { x: (road2.start.x + road2.end.x) / 2, y: (road2.start.y + road2.end.y) / 2 };
        
        const distance = Math.sqrt((mid1.x - mid2.x) ** 2 + (mid1.y - mid2.y) ** 2);
        
        if (distance < 50) { // If roads are close enough
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
    
    generateOrganicRoadNetwork(size) {
        // Generate organic roads with natural curves
        this.generateOrganicArterials(size);
        this.generateOrganicCollectors(size);
        this.generateOrganicLocals(size);
    }
    
    generateOrganicArterials(size) {
        const numArterials = size === 'small' ? 4 : size === 'medium' ? 6 : 8;
        const roadType = this.roadTypes.arterial;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        
        for (let i = 0; i < numArterials; i++) {
            const startX = Math.random() * this.canvas.width;
            const startY = Math.random() * this.canvas.height;
            const endX = Math.random() * this.canvas.width;
            const endY = Math.random() * this.canvas.height;
            
            const arterial = this.createCurvedRoad(startX, startY, endX, endY, roadType, 0.3);
            this.drawCurvedRoad(arterial, roadType);
            this.cityData.roads.push(arterial);
        }
    }
    
    generateOrganicCollectors(size) {
        const numCollectors = size === 'small' ? 8 : size === 'medium' ? 12 : 16;
        const roadType = this.roadTypes.collector;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        
        for (let i = 0; i < numCollectors; i++) {
            const startX = Math.random() * this.canvas.width;
            const startY = Math.random() * this.canvas.height;
            const endX = Math.random() * this.canvas.width;
            const endY = Math.random() * this.canvas.height;
            
            const collector = this.createCurvedRoad(startX, startY, endX, endY, roadType, 0.4);
            this.drawCurvedRoad(collector, roadType);
            this.cityData.roads.push(collector);
        }
    }
    
    generateOrganicLocals(size) {
        const numLocals = size === 'small' ? 15 : size === 'medium' ? 25 : 35;
        const roadType = this.roadTypes.local;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        
        for (let i = 0; i < numLocals; i++) {
            const startX = Math.random() * this.canvas.width;
            const startY = Math.random() * this.canvas.height;
            const endX = Math.random() * this.canvas.width;
            const endY = Math.random() * this.canvas.height;
            
            const local = this.createCurvedRoad(startX, startY, endX, endY, roadType, 0.5);
            this.drawCurvedRoad(local, roadType);
            this.cityData.roads.push(local);
        }
    }
    
    generateRadialRoadNetwork(size) {
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
            
            const radial = this.createCurvedRoad(centerX, centerY, endX, endY, roadType, 0.2);
            this.drawCurvedRoad(radial, roadType);
            
            this.cityData.roads.push(radial);
        }
    }
    
    generateSpiralRoadNetwork(size) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(this.canvas.width, this.canvas.height) / 2;
        const roadType = this.roadTypes.highway;
        
        this.ctx.strokeStyle = roadType.color;
        this.ctx.lineWidth = roadType.width;
        
        // Generate spiral using multiple curved segments
        const spiralPoints = [];
        for (let angle = 0; angle < 6 * Math.PI; angle += 0.5) {
            const radius = (angle / (6 * Math.PI)) * maxRadius;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            spiralPoints.push({x: x, y: y});
        }
        
        // Draw spiral as connected curved segments
        for (let i = 0; i < spiralPoints.length - 1; i++) {
            const start = spiralPoints[i];
            const end = spiralPoints[i + 1];
            
            const spiral = this.createCurvedRoad(start.x, start.y, end.x, end.y, roadType, 0.1);
            this.drawCurvedRoad(spiral, roadType);
            
            this.cityData.roads.push(spiral);
        }
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
        
        const fractal = this.createCurvedRoad(x, y, endX, endY, roadType, 0.3);
        this.drawCurvedRoad(fractal, roadType);
        
        this.cityData.roads.push(fractal);
        
        const newLength = length * 0.7;
        this.generateFractalBranch(endX, endY, newLength, angle + Math.PI/4, depth - 1);
        this.generateFractalBranch(endX, endY, newLength, angle - Math.PI/4, depth - 1);
    }
    
    generateMixedRoadNetwork(size) {
        this.generateRealisticGrid(size);
        this.generateOrganicRoadNetwork(size);
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
            // Check if building intersects with road path
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