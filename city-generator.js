class AdvancedCityGenerator {
    constructor() {
        this.canvas = document.getElementById('cityCanvas');
        this.ctx = this.canvas.getContext('2d');
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
            'Silver Springs', 'Azure Harbor', 'Crimson Peak', 'Verdant Grove',
            'Sapphire Ridge', 'Amber Cove', 'Jade Valley', 'Ruby Harbor',
            'Pearl Bay', 'Onyx Heights', 'Topaz Springs', 'Diamond Ridge'
        ];
        
        this.climates = ['Temperate', 'Mediterranean', 'Tropical', 'Continental', 'Oceanic'];
        this.economies = ['Technology', 'Tourism', 'Manufacturing', 'Finance', 'Education', 'Mixed'];
        
        this.setupEventListeners();
        this.initializeSliders();
        this.generateCity();
    }
    
    setupEventListeners() {
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateCity();
        });
        
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveCity();
        });
        
        document.getElementById('shareBtn').addEventListener('click', () => {
            this.shareCity();
        });
        
        // Add slider event listeners
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
        // Initialize slider values
        document.getElementById('densityValue').textContent = document.getElementById('buildingDensity').value;
        document.getElementById('parkValue').textContent = document.getElementById('parkRatio').value;
        document.getElementById('waterValue').textContent = document.getElementById('waterBodies').value;
    }
    
    async generateCity() {
        this.showLoading(true);
        
        // Simulate generation time for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        this.clearCanvas();
        this.cityData = {
            buildings: [], roads: [], parks: [], waterBodies: [],
            population: 0, area: 0, name: '', founded: '', climate: '', economy: ''
        };
        
        const citySize = document.getElementById('citySize').value;
        const buildingStyle = document.getElementById('buildingStyle').value;
        const roadPattern = document.getElementById('roadPattern').value;
        const buildingDensity = parseFloat(document.getElementById('buildingDensity').value);
        const parkRatio = parseFloat(document.getElementById('parkRatio').value);
        const waterCount = parseInt(document.getElementById('waterBodies').value);
        const timeOfDay = document.getElementById('timeOfDay').value;
        const renderQuality = document.getElementById('renderQuality').value;
        
        // Generate city name and details
        this.generateCityDetails();
        
        // Apply time of day effects
        this.applyTimeOfDayEffects(timeOfDay);
        
        // Generate water bodies first
        this.generateWaterBodies(waterCount, citySize);
        
        // Generate roads
        this.generateAdvancedRoads(roadPattern, citySize);
        
        // Generate buildings with density
        this.generateAdvancedBuildings(buildingStyle, citySize, buildingDensity);
        
        // Generate parks with ratio
        this.generateAdvancedParks(citySize, parkRatio);
        
        // Add special landmarks
        this.generateLandmarks(citySize, buildingStyle);
        
        // Calculate statistics
        this.calculateAdvancedStatistics();
        
        // Update UI
        this.updateAdvancedStats();
        
        this.showLoading(false);
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
    
    applyTimeOfDayEffects(timeOfDay) {
        switch(timeOfDay) {
            case 'sunset':
                this.ctx.fillStyle = 'rgba(255, 165, 0, 0.3)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                break;
            case 'night':
                this.ctx.fillStyle = 'rgba(25, 25, 112, 0.4)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                break;
            case 'rainy':
                this.ctx.fillStyle = 'rgba(105, 105, 105, 0.3)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                break;
        }
    }
    
    generateCityDetails() {
        this.cityData.name = this.cityNames[Math.floor(Math.random() * this.cityNames.length)];
        this.cityData.founded = Math.floor(Math.random() * 200) + 1800;
        this.cityData.climate = this.climates[Math.floor(Math.random() * this.climates.length)];
        this.cityData.economy = this.economies[Math.floor(Math.random() * this.economies.length)];
    }
    
    generateWaterBodies(count, size) {
        const waterTypes = ['lake', 'river', 'pond', 'bay'];
        
        for (let i = 0; i < count; i++) {
            const waterType = waterTypes[Math.floor(Math.random() * waterTypes.length)];
            const water = this.createWaterBody(waterType, size);
            this.drawWaterBody(water);
            this.cityData.waterBodies.push(water);
        }
    }
    
    createWaterBody(type, size) {
        const baseSize = size === 'small' ? 40 : size === 'medium' ? 60 : size === 'large' ? 80 : 100;
        
        switch(type) {
            case 'lake':
                return {
                    type: 'lake',
                    x: Math.random() * (this.canvas.width - baseSize),
                    y: Math.random() * (this.canvas.height - baseSize),
                    width: baseSize + Math.random() * baseSize,
                    height: baseSize + Math.random() * baseSize,
                    color: '#3498db'
                };
            case 'river':
                return {
                    type: 'river',
                    x: 0,
                    y: Math.random() * this.canvas.height,
                    width: this.canvas.width,
                    height: 15 + Math.random() * 10,
                    color: '#2980b9'
                };
            case 'pond':
                return {
                    type: 'pond',
                    x: Math.random() * (this.canvas.width - baseSize/2),
                    y: Math.random() * (this.canvas.height - baseSize/2),
                    width: baseSize/2,
                    height: baseSize/2,
                    color: '#5dade2'
                };
            case 'bay':
                return {
                    type: 'bay',
                    x: Math.random() * (this.canvas.width - baseSize),
                    y: this.canvas.height - baseSize,
                    width: baseSize + Math.random() * baseSize,
                    height: baseSize,
                    color: '#85c1e9'
                };
        }
    }
    
    drawWaterBody(water) {
        this.ctx.fillStyle = water.color;
        
        if (water.type === 'river') {
            this.ctx.fillRect(water.x, water.y, water.width, water.height);
            // Add river flow effect
            this.ctx.strokeStyle = '#1f618d';
            this.ctx.lineWidth = 2;
            for (let i = 0; i < water.width; i += 20) {
                this.ctx.beginPath();
                this.ctx.moveTo(i, water.y);
                this.ctx.lineTo(i + 10, water.y + water.height);
                this.ctx.stroke();
            }
        } else {
            this.ctx.beginPath();
            this.ctx.ellipse(water.x + water.width/2, water.y + water.height/2, 
                           water.width/2, water.height/2, 0, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Add water reflection
            this.ctx.strokeStyle = '#1f618d';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    }
    
    generateAdvancedRoads(pattern, size) {
        const roadWidth = size === 'small' ? 6 : size === 'medium' ? 8 : size === 'large' ? 10 : 12;
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = roadWidth;
        this.ctx.lineCap = 'round';
        
        switch(pattern) {
            case 'grid':
                this.generateGridRoads(size);
                break;
            case 'organic':
                this.generateOrganicRoads(size);
                break;
            case 'radial':
                this.generateRadialRoads(size);
                break;
            case 'spiral':
                this.generateSpiralRoads(size);
                break;
            case 'fractal':
                this.generateFractalRoads(size);
                break;
            case 'mixed':
                this.generateMixedRoads(size);
                break;
        }
    }
    
    generateSpiralRoads(size) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(this.canvas.width, this.canvas.height) / 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        
        for (let angle = 0; angle < 8 * Math.PI; angle += 0.1) {
            const radius = (angle / (8 * Math.PI)) * maxRadius;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
        
        // Add connecting roads
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * 2 * Math.PI;
            const x = centerX + Math.cos(angle) * maxRadius;
            const y = centerY + Math.sin(angle) * maxRadius;
            
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }
    }
    
    generateFractalRoads(size) {
        this.generateFractalBranch(this.canvas.width / 2, this.canvas.height / 2, 
                                  Math.min(this.canvas.width, this.canvas.height) / 3, 0, 4);
    }
    
    generateFractalBranch(x, y, length, angle, depth) {
        if (depth === 0) return;
        
        const endX = x + length * Math.cos(angle);
        const endY = y + length * Math.sin(angle);
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        // Recursive branches
        const newLength = length * 0.7;
        this.generateFractalBranch(endX, endY, newLength, angle + Math.PI/4, depth - 1);
        this.generateFractalBranch(endX, endY, newLength, angle - Math.PI/4, depth - 1);
    }
    
    generateGridRoads(size) {
        const spacing = size === 'small' ? 80 : size === 'medium' ? 60 : size === 'large' ? 40 : 30;
        
        // Vertical roads
        for (let x = spacing; x < this.canvas.width; x += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
            this.cityData.roads.push({ x1: x, y1: 0, x2: x, y2: this.canvas.height });
        }
        
        // Horizontal roads
        for (let y = spacing; y < this.canvas.height; y += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
            this.cityData.roads.push({ x1: 0, y1: y, x2: this.canvas.width, y2: y });
        }
    }
    
    generateOrganicRoads(size) {
        const numRoads = size === 'small' ? 8 : size === 'medium' ? 12 : size === 'large' ? 18 : 25;
        
        for (let i = 0; i < numRoads; i++) {
            const startX = Math.random() * this.canvas.width;
            const startY = Math.random() * this.canvas.height;
            const endX = Math.random() * this.canvas.width;
            const endY = Math.random() * this.canvas.height;
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            
            // Create curved path with multiple control points
            const points = [];
            const numPoints = 3 + Math.floor(Math.random() * 3);
            
            for (let j = 0; j < numPoints; j++) {
                points.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height
                });
            }
            
            this.ctx.moveTo(startX, startY);
            for (let j = 0; j < points.length; j++) {
                this.ctx.quadraticCurveTo(points[j].x, points[j].y, 
                                        j === points.length - 1 ? endX : points[j + 1].x,
                                        j === points.length - 1 ? endY : points[j + 1].y);
            }
            this.ctx.stroke();
            
            this.cityData.roads.push({ x1: startX, y1: startY, x2: endX, y2: endY });
        }
    }
    
    generateRadialRoads(size) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const numRoads = size === 'small' ? 6 : size === 'medium' ? 8 : size === 'large' ? 12 : 16;
        
        // Radial roads from center
        for (let i = 0; i < numRoads; i++) {
            const angle = (i / numRoads) * 2 * Math.PI;
            const endX = centerX + Math.cos(angle) * this.canvas.width;
            const endY = centerY + Math.sin(angle) * this.canvas.height;
            
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
            
            this.cityData.roads.push({ x1: centerX, y1: centerY, x2: endX, y2: endY });
        }
        
        // Circular roads
        const numCircles = size === 'small' ? 2 : size === 'medium' ? 3 : size === 'large' ? 4 : 5;
        for (let i = 1; i <= numCircles; i++) {
            const radius = (this.canvas.width / 2) * (i / numCircles);
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
    }
    
    generateMixedRoads(size) {
        this.generateGridRoads(size);
        this.generateOrganicRoads(size);
    }
    
    generateAdvancedBuildings(style, size, density) {
        const baseNumBuildings = size === 'small' ? 20 : size === 'medium' ? 35 : size === 'large' ? 50 : 70;
        const numBuildings = Math.floor(baseNumBuildings * density);
        
        for (let i = 0; i < numBuildings; i++) {
            const building = this.createAdvancedBuilding(style, size);
            this.drawAdvancedBuilding(building);
            this.cityData.buildings.push(building);
        }
    }
    
    createAdvancedBuilding(style, size) {
        const minSize = size === 'small' ? 12 : size === 'medium' ? 15 : size === 'large' ? 20 : 25;
        const maxSize = size === 'small' ? 30 : size === 'medium' ? 40 : size === 'large' ? 50 : 60;
        
        const width = minSize + Math.random() * (maxSize - minSize);
        const height = minSize + Math.random() * (maxSize - minSize);
        
        // Avoid placing buildings on roads and water
        let x, y;
        let attempts = 0;
        do {
            x = Math.random() * (this.canvas.width - width);
            y = Math.random() * (this.canvas.height - height);
            attempts++;
        } while ((this.isOnRoad(x, y, width, height) || this.isOnWater(x, y, width, height)) && attempts < 100);
        
        return {
            x: x,
            y: y,
            width: width,
            height: height,
            style: style,
            color: this.getAdvancedBuildingColor(style),
            windows: Math.floor(Math.random() * 12) + 3,
            floors: Math.floor(Math.random() * 5) + 1,
            type: this.getBuildingType(style),
            special: Math.random() < 0.1 // 10% chance of special building
        };
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
    
    getBuildingType(style) {
        const types = {
            modern: ['office', 'apartment', 'mall', 'hotel'],
            classical: ['museum', 'library', 'theater', 'government'],
            futuristic: ['research', 'spaceport', 'energy', 'transport'],
            gothic: ['cathedral', 'castle', 'university', 'monument'],
            asian: ['temple', 'pagoda', 'garden', 'palace'],
            mixed: ['office', 'apartment', 'museum', 'temple']
        };
        
        const styleTypes = types[style] || types.mixed;
        return styleTypes[Math.floor(Math.random() * styleTypes.length)];
    }
    
    getAdvancedBuildingColor(style) {
        const colors = {
            modern: ['#3498db', '#2980b9', '#5dade2', '#85c1e9', '#2ecc71'],
            classical: ['#e67e22', '#d35400', '#f39c12', '#f8c471', '#e74c3c'],
            futuristic: ['#9b59b6', '#8e44ad', '#bb8fce', '#d7bde2', '#00d4ff'],
            gothic: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#8b4513'],
            asian: ['#e74c3c', '#c0392b', '#f39c12', '#f1c40f', '#27ae60'],
            mixed: ['#3498db', '#e67e22', '#9b59b6', '#2ecc71', '#e74c3c', '#f39c12']
        };
        
        const styleColors = colors[style] || colors.mixed;
        return styleColors[Math.floor(Math.random() * styleColors.length)];
    }
    
    drawAdvancedBuilding(building) {
        // Draw main building
        this.ctx.fillStyle = building.color;
        this.ctx.fillRect(building.x, building.y, building.width, building.height);
        
        // Draw floors
        this.drawFloors(building);
        
        // Draw windows
        this.drawAdvancedWindows(building);
        
        // Draw style-specific details
        this.drawStyleSpecificDetails(building);
        
        // Draw special effects for special buildings
        if (building.special) {
            this.drawSpecialEffects(building);
        }
    }
    
    drawFloors(building) {
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 1;
        
        for (let i = 1; i < building.floors; i++) {
            const y = building.y + (building.height / building.floors) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(building.x, y);
            this.ctx.lineTo(building.x + building.width, y);
            this.ctx.stroke();
        }
    }
    
    drawAdvancedWindows(building) {
        this.ctx.fillStyle = '#f1c40f';
        const windowSize = 2;
        const spacing = 4;
        
        // Windows on each floor
        for (let floor = 0; floor < building.floors; floor++) {
            const floorY = building.y + (building.height / building.floors) * floor + spacing;
            const windowsInRow = Math.floor(building.width / (windowSize + spacing)) - 1;
            
            for (let i = 0; i < windowsInRow; i++) {
                const windowX = building.x + spacing + (i * (windowSize + spacing));
                this.ctx.fillRect(windowX, floorY, windowSize, windowSize);
            }
        }
    }
    
    drawStyleSpecificDetails(building) {
        switch(building.style) {
            case 'modern':
                this.drawModernDetails(building);
                break;
            case 'classical':
                this.drawClassicalDetails(building);
                break;
            case 'futuristic':
                this.drawFuturisticDetails(building);
                break;
            case 'gothic':
                this.drawGothicDetails(building);
                break;
            case 'asian':
                this.drawAsianDetails(building);
                break;
        }
    }
    
    drawModernDetails(building) {
        // Glass effect
        this.ctx.strokeStyle = '#ecf0f1';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(building.x, building.y, building.width, building.height);
        
        // Modern rooftop
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(building.x, building.y, building.width, 3);
    }
    
    drawClassicalDetails(building) {
        // Columns
        this.ctx.strokeStyle = '#7f8c8d';
        this.ctx.lineWidth = 2;
        const columnWidth = building.width / 4;
        for (let i = 1; i < 4; i++) {
            const x = building.x + (i * columnWidth);
            this.ctx.beginPath();
            this.ctx.moveTo(x, building.y);
            this.ctx.lineTo(x, building.y + building.height);
            this.ctx.stroke();
        }
        
        // Classical roof
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(building.x, building.y, building.width, 5);
    }
    
    drawFuturisticDetails(building) {
        // Neon glow
        this.ctx.shadowColor = building.color;
        this.ctx.shadowBlur = 10;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(building.x, building.y, building.width, building.height);
        this.ctx.shadowBlur = 0;
        
        // Antenna
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(building.x + building.width/2, building.y);
        this.ctx.lineTo(building.x + building.width/2, building.y - 10);
        this.ctx.stroke();
    }
    
    drawGothicDetails(building) {
        // Gothic arches
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(building.x + building.width/2, building.y + building.height, 
                    building.width/3, 0, Math.PI, true);
        this.ctx.stroke();
        
        // Spire
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(building.x + building.width/2 - 2, building.y - 15, 4, 15);
    }
    
    drawAsianDetails(building) {
        // Curved roof
        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(building.x + building.width/2, building.y, 
                    building.width/2, 0, Math.PI, true);
        this.ctx.stroke();
        
        // Lanterns
        this.ctx.fillStyle = '#f39c12';
        this.ctx.fillRect(building.x + 5, building.y + building.height - 8, 3, 6);
        this.ctx.fillRect(building.x + building.width - 8, building.y + building.height - 8, 3, 6);
    }
    
    drawSpecialEffects(building) {
        // Add special glow or effects
        this.ctx.shadowColor = '#ffff00';
        this.ctx.shadowBlur = 15;
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(building.x - 2, building.y - 2, building.width + 4, building.height + 4);
        this.ctx.shadowBlur = 0;
    }
    
    generateAdvancedParks(size, ratio) {
        const baseNumParks = size === 'small' ? 2 : size === 'medium' ? 4 : size === 'large' ? 6 : 8;
        const numParks = Math.floor(baseNumParks * ratio * 10);
        
        for (let i = 0; i < numParks; i++) {
            const park = this.createAdvancedPark(size);
            this.drawAdvancedPark(park);
            this.cityData.parks.push(park);
        }
    }
    
    createAdvancedPark(size) {
        const baseSize = size === 'small' ? 25 : size === 'medium' ? 35 : size === 'large' ? 45 : 55;
        const sizeVariation = baseSize * 0.5;
        const parkSize = baseSize + Math.random() * sizeVariation;
        
        let x, y;
        let attempts = 0;
        do {
            x = Math.random() * (this.canvas.width - parkSize);
            y = Math.random() * (this.canvas.height - parkSize);
            attempts++;
        } while ((this.isOnRoad(x, y, parkSize, parkSize) || this.isOnWater(x, y, parkSize, parkSize)) && attempts < 50);
        
        return {
            x: x,
            y: y,
            size: parkSize,
            trees: Math.floor(Math.random() * 8) + 4,
            benches: Math.floor(Math.random() * 3) + 1,
            fountain: Math.random() < 0.3,
            type: ['garden', 'playground', 'square', 'forest'][Math.floor(Math.random() * 4)]
        };
    }
    
    drawAdvancedPark(park) {
        // Draw grass base
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(park.x, park.y, park.size, park.size);
        
        // Draw trees
        this.ctx.fillStyle = '#2d5a27';
        for (let i = 0; i < park.trees; i++) {
            const treeX = park.x + Math.random() * park.size;
            const treeY = park.y + Math.random() * park.size;
            const treeSize = 3 + Math.random() * 4;
            
            this.ctx.beginPath();
            this.ctx.arc(treeX, treeY, treeSize, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        
        // Draw fountain if present
        if (park.fountain) {
            this.ctx.fillStyle = '#3498db';
            this.ctx.beginPath();
            this.ctx.arc(park.x + park.size/2, park.y + park.size/2, 5, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        
        // Draw benches
        this.ctx.fillStyle = '#8b4513';
        for (let i = 0; i < park.benches; i++) {
            const benchX = park.x + Math.random() * park.size;
            const benchY = park.y + Math.random() * park.size;
            this.ctx.fillRect(benchX, benchY, 8, 2);
        }
    }
    
    generateLandmarks(size, style) {
        const numLandmarks = size === 'small' ? 1 : size === 'medium' ? 2 : size === 'large' ? 3 : 4;
        
        for (let i = 0; i < numLandmarks; i++) {
            const landmark = this.createLandmark(style);
            this.drawLandmark(landmark);
        }
    }
    
    createLandmark(style) {
        const landmarkTypes = {
            modern: ['skyscraper', 'bridge', 'tower'],
            classical: ['monument', 'statue', 'arch'],
            futuristic: ['spaceport', 'energy-tower', 'transport-hub'],
            gothic: ['cathedral', 'castle', 'clock-tower'],
            asian: ['pagoda', 'temple', 'gate'],
            mixed: ['monument', 'tower', 'bridge']
        };
        
        const types = landmarkTypes[style] || landmarkTypes.mixed;
        const type = types[Math.floor(Math.random() * types.length)];
        
        return {
            x: Math.random() * (this.canvas.width - 60),
            y: Math.random() * (this.canvas.height - 60),
            width: 40 + Math.random() * 20,
            height: 60 + Math.random() * 40,
            type: type,
            style: style
        };
    }
    
    drawLandmark(landmark) {
        this.ctx.fillStyle = '#f39c12';
        this.ctx.fillRect(landmark.x, landmark.y, landmark.width, landmark.height);
        
        // Add landmark-specific details
        this.ctx.strokeStyle = '#e67e22';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(landmark.x, landmark.y, landmark.width, landmark.height);
        
        // Add glow effect
        this.ctx.shadowColor = '#f39c12';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(landmark.x, landmark.y, landmark.width, landmark.height);
        this.ctx.shadowBlur = 0;
    }
    
    calculateAdvancedStatistics() {
        let population = 0;
        let area = 0;
        
        // Calculate population based on buildings
        for (let building of this.cityData.buildings) {
            const buildingArea = building.width * building.height;
            area += buildingArea;
            population += Math.floor(buildingArea / 8) * building.floors;
        }
        
        // Add park population
        population += this.cityData.parks.length * 50;
        
        // Add water population bonus
        population += this.cityData.waterBodies.length * 200;
        
        // Add randomness
        population += Math.floor(Math.random() * 2000);
        
        this.cityData.population = population;
        this.cityData.area = Math.floor(area / 1000); // Convert to km²
    }
    
    updateAdvancedStats() {
        document.getElementById('buildingCount').textContent = this.cityData.buildings.length;
        document.getElementById('roadCount').textContent = this.cityData.roads.length;
        document.getElementById('parkCount').textContent = this.cityData.parks.length;
        document.getElementById('waterCount').textContent = this.cityData.waterBodies.length;
        document.getElementById('population').textContent = this.cityData.population.toLocaleString();
        document.getElementById('cityArea').textContent = this.cityData.area;
        
        // Update city details
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
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('City URL copied to clipboard!');
            });
        }
    }
    
    isOnRoad(x, y, width, height) {
        const roadBuffer = 12;
        for (let road of this.cityData.roads) {
            if (x < road.x2 + roadBuffer && x + width > road.x1 - roadBuffer &&
                y < road.y2 + roadBuffer && y + height > road.y1 - roadBuffer) {
                return true;
            }
        }
        return false;
    }
}

// Initialize the advanced city generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedCityGenerator();
});