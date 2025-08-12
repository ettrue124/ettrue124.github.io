class AdvancedCityGenerator {
    constructor() {
        this.canvas = document.getElementById('cityCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Performance optimizations
        this.setupCanvasOptimizations();
        this.objectPool = this.createObjectPool();
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
    
    setupCanvasOptimizations() {
        // Enable hardware acceleration
        this.ctx.imageSmoothingEnabled = false; // Faster rendering
        this.ctx.imageSmoothingQuality = 'low';
        
        // Set canvas size for better performance
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        // Set display size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    createObjectPool() {
        return {
            buildings: [],
            roads: [],
            parks: [],
            waterBodies: [],
            reset() {
                this.buildings.length = 0;
                this.roads.length = 0;
                this.parks.length = 0;
                this.waterBodies.length = 0;
            }
        };
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
        
        // Optimized slider listeners with debouncing
        const debounce = (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };
        
        document.getElementById('buildingDensity').addEventListener('input', debounce((e) => {
            document.getElementById('densityValue').textContent = e.target.value;
        }, 100));
        
        document.getElementById('parkRatio').addEventListener('input', debounce((e) => {
            document.getElementById('parkValue').textContent = e.target.value;
        }, 100));
        
        document.getElementById('waterBodies').addEventListener('input', debounce((e) => {
            document.getElementById('waterValue').textContent = e.target.value;
        }, 100));
    }
    
    initializeSliders() {
        document.getElementById('densityValue').textContent = document.getElementById('buildingDensity').value;
        document.getElementById('parkValue').textContent = document.getElementById('parkRatio').value;
        document.getElementById('waterValue').textContent = document.getElementById('waterBodies').value;
    }
    
    async generateCity() {
        if (this.isGenerating) return;
        
        this.isGenerating = true;
        this.showLoading(true);
        
        // Use requestAnimationFrame for smooth loading
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        try {
            // Batch all operations for better performance
            await this.performBatchGeneration();
        } catch (error) {
            console.error('Generation error:', error);
        } finally {
            this.isGenerating = false;
            this.showLoading(false);
        }
    }
    
    async performBatchGeneration() {
        // Reset object pool
        this.objectPool.reset();
        
        // Clear canvas efficiently
        this.clearCanvas();
        
        // Reset city data
        this.cityData = {
            buildings: [], roads: [], parks: [], waterBodies: [],
            population: 0, area: 0, name: '', founded: '', climate: '', economy: ''
        };
        
        const settings = this.getGenerationSettings();
        
        // Generate city details
        this.generateCityDetails();
        
        // Batch all generation operations
        await this.batchGenerateElements(settings);
        
        // Update UI efficiently
        this.updateAdvancedStats();
    }
    
    getGenerationSettings() {
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
    
    async batchGenerateElements(settings) {
        // Apply time effects first
        this.applyTimeOfDayEffects(settings.timeOfDay);
        
        // Generate all elements in optimized order
        const promises = [
            this.generateWaterBodiesOptimized(settings.waterCount, settings.citySize),
            this.generateRoadsOptimized(settings.roadPattern, settings.citySize),
            this.generateBuildingsOptimized(settings.buildingStyle, settings.citySize, settings.buildingDensity),
            this.generateParksOptimized(settings.citySize, settings.parkRatio),
            this.generateLandmarksOptimized(settings.citySize, settings.buildingStyle)
        ];
        
        // Execute in parallel where possible
        await Promise.all(promises);
        
        // Calculate statistics
        this.calculateAdvancedStatistics();
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
        // Use clearRect for better performance
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    applyTimeOfDayEffects(timeOfDay) {
        // Optimized time effects with reduced opacity
        const effects = {
            sunset: { color: 'rgba(255, 165, 0, 0.2)', blend: 'multiply' },
            night: { color: 'rgba(25, 25, 112, 0.3)', blend: 'multiply' },
            rainy: { color: 'rgba(105, 105, 105, 0.2)', blend: 'multiply' }
        };
        
        if (effects[timeOfDay]) {
            this.ctx.globalCompositeOperation = effects[timeOfDay].blend;
            this.ctx.fillStyle = effects[timeOfDay].color;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalCompositeOperation = 'source-over';
        }
    }
    
    generateCityDetails() {
        this.cityData.name = this.cityNames[Math.floor(Math.random() * this.cityNames.length)];
        this.cityData.founded = Math.floor(Math.random() * 200) + 1800;
        this.cityData.climate = this.climates[Math.floor(Math.random() * this.climates.length)];
        this.cityData.economy = this.economies[Math.floor(Math.random() * this.economies.length)];
    }
    
    async generateWaterBodiesOptimized(count, size) {
        const waterTypes = ['lake', 'river', 'pond', 'bay'];
        const waterBodies = [];
        
        for (let i = 0; i < count; i++) {
            const waterType = waterTypes[Math.floor(Math.random() * waterTypes.length)];
            const water = this.createWaterBodyOptimized(waterType, size);
            waterBodies.push(water);
        }
        
        // Batch draw water bodies
        this.drawWaterBodiesBatch(waterBodies);
        this.cityData.waterBodies = waterBodies;
    }
    
    createWaterBodyOptimized(type, size) {
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
    
    drawWaterBodiesBatch(waterBodies) {
        // Batch draw for better performance
        waterBodies.forEach(water => {
            this.ctx.fillStyle = water.color;
            
            if (water.type === 'river') {
                this.ctx.fillRect(water.x, water.y, water.width, water.height);
                // Simplified river flow effect
                this.ctx.strokeStyle = '#1f618d';
                this.ctx.lineWidth = 2;
                for (let i = 0; i < water.width; i += 30) {
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
            }
        });
    }
    
    async generateRoadsOptimized(pattern, size) {
        const roadWidth = size === 'small' ? 6 : size === 'medium' ? 8 : size === 'large' ? 10 : 12;
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = roadWidth;
        this.ctx.lineCap = 'round';
        
        const roads = [];
        
        switch(pattern) {
            case 'grid':
                roads.push(...this.generateGridRoadsOptimized(size));
                break;
            case 'organic':
                roads.push(...this.generateOrganicRoadsOptimized(size));
                break;
            case 'radial':
                roads.push(...this.generateRadialRoadsOptimized(size));
                break;
            case 'spiral':
                roads.push(...this.generateSpiralRoadsOptimized(size));
                break;
            case 'fractal':
                roads.push(...this.generateFractalRoadsOptimized(size));
                break;
            case 'mixed':
                roads.push(...this.generateMixedRoadsOptimized(size));
                break;
        }
        
        // Batch draw roads
        this.drawRoadsBatch(roads);
        this.cityData.roads = roads;
    }
    
    generateGridRoadsOptimized(size) {
        const spacing = size === 'small' ? 80 : size === 'medium' ? 60 : size === 'large' ? 40 : 30;
        const roads = [];
        
        // Vertical roads
        for (let x = spacing; x < this.canvas.width; x += spacing) {
            roads.push({ x1: x, y1: 0, x2: x, y2: this.canvas.height });
        }
        
        // Horizontal roads
        for (let y = spacing; y < this.canvas.height; y += spacing) {
            roads.push({ x1: 0, y1: y, x2: this.canvas.width, y2: y });
        }
        
        return roads;
    }
    
    generateOrganicRoadsOptimized(size) {
        const numRoads = size === 'small' ? 8 : size === 'medium' ? 12 : size === 'large' ? 18 : 25;
        const roads = [];
        
        for (let i = 0; i < numRoads; i++) {
            const startX = Math.random() * this.canvas.width;
            const startY = Math.random() * this.canvas.height;
            const endX = Math.random() * this.canvas.width;
            const endY = Math.random() * this.canvas.height;
            
            roads.push({ x1: startX, y1: startY, x2: endX, y2: endY });
        }
        
        return roads;
    }
    
    generateRadialRoadsOptimized(size) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const numRoads = size === 'small' ? 6 : size === 'medium' ? 8 : size === 'large' ? 12 : 16;
        const roads = [];
        
        // Radial roads from center
        for (let i = 0; i < numRoads; i++) {
            const angle = (i / numRoads) * 2 * Math.PI;
            const endX = centerX + Math.cos(angle) * this.canvas.width;
            const endY = centerY + Math.sin(angle) * this.canvas.height;
            roads.push({ x1: centerX, y1: centerY, x2: endX, y2: endY });
        }
        
        return roads;
    }
    
    generateSpiralRoadsOptimized(size) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(this.canvas.width, this.canvas.height) / 2;
        const roads = [];
        
        // Simplified spiral with fewer points
        for (let angle = 0; angle < 6 * Math.PI; angle += 0.2) {
            const radius = (angle / (6 * Math.PI)) * maxRadius;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            roads.push({ x1: centerX, y1: centerY, x2: x, y2: y });
        }
        
        return roads;
    }
    
    generateFractalRoadsOptimized(size) {
        const roads = [];
        this.generateFractalBranchOptimized(this.canvas.width / 2, this.canvas.height / 2, 
                                          Math.min(this.canvas.width, this.canvas.height) / 3, 0, 3, roads);
        return roads;
    }
    
    generateFractalBranchOptimized(x, y, length, angle, depth, roads) {
        if (depth === 0) return;
        
        const endX = x + length * Math.cos(angle);
        const endY = y + length * Math.sin(angle);
        
        roads.push({ x1: x, y1: y, x2: endX, y2: endY });
        
        // Recursive branches with reduced depth
        const newLength = length * 0.7;
        this.generateFractalBranchOptimized(endX, endY, newLength, angle + Math.PI/4, depth - 1, roads);
        this.generateFractalBranchOptimized(endX, endY, newLength, angle - Math.PI/4, depth - 1, roads);
    }
    
    generateMixedRoadsOptimized(size) {
        const gridRoads = this.generateGridRoadsOptimized(size);
        const organicRoads = this.generateOrganicRoadsOptimized(size);
        return [...gridRoads, ...organicRoads];
    }
    
    drawRoadsBatch(roads) {
        // Batch draw all roads
        roads.forEach(road => {
            this.ctx.beginPath();
            this.ctx.moveTo(road.x1, road.y1);
            this.ctx.lineTo(road.x2, road.y2);
            this.ctx.stroke();
        });
    }
    
    async generateBuildingsOptimized(style, size, density) {
        const baseNumBuildings = size === 'small' ? 20 : size === 'medium' ? 35 : size === 'large' ? 50 : 70;
        const numBuildings = Math.floor(baseNumBuildings * density);
        
        const buildings = [];
        const maxAttempts = 100;
        
        for (let i = 0; i < numBuildings && buildings.length < numBuildings; i++) {
            const building = this.createBuildingOptimized(style, size, maxAttempts);
            if (building) {
                buildings.push(building);
            }
        }
        
        // Batch draw buildings
        this.drawBuildingsBatch(buildings);
        this.cityData.buildings = buildings;
    }
    
    createBuildingOptimized(style, size, maxAttempts) {
        const minSize = size === 'small' ? 12 : size === 'medium' ? 15 : size === 'large' ? 20 : 25;
        const maxSize = size === 'small' ? 30 : size === 'medium' ? 40 : size === 'large' ? 50 : 60;
        
        const width = minSize + Math.random() * (maxSize - minSize);
        const height = minSize + Math.random() * (maxSize - minSize);
        
        // Optimized placement with early exit
        for (let attempts = 0; attempts < maxAttempts; attempts++) {
            const x = Math.random() * (this.canvas.width - width);
            const y = Math.random() * (this.canvas.height - height);
            
            if (!this.isOnRoadOptimized(x, y, width, height) && !this.isOnWaterOptimized(x, y, width, height)) {
                return {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    style: style,
                    color: this.getBuildingColorOptimized(style),
                    floors: Math.floor(Math.random() * 3) + 1, // Reduced floors for performance
                    special: Math.random() < 0.05 // Reduced special buildings
                };
            }
        }
        
        return null;
    }
    
    isOnRoadOptimized(x, y, width, height) {
        const roadBuffer = 12;
        return this.cityData.roads.some(road => 
            x < road.x2 + roadBuffer && x + width > road.x1 - roadBuffer &&
            y < road.y2 + roadBuffer && y + height > road.y1 - roadBuffer
        );
    }
    
    isOnWaterOptimized(x, y, width, height) {
        return this.cityData.waterBodies.some(water =>
            x < water.x + water.width && x + width > water.x &&
            y < water.y + water.height && y + height > water.y
        );
    }
    
    getBuildingColorOptimized(style) {
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
    
    drawBuildingsBatch(buildings) {
        // Batch draw for better performance
        buildings.forEach(building => {
            // Main building
            this.ctx.fillStyle = building.color;
            this.ctx.fillRect(building.x, building.y, building.width, building.height);
            
            // Simple windows
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
            
            // Simple border
            this.ctx.strokeStyle = '#2c3e50';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(building.x, building.y, building.width, building.height);
        });
    }
    
    async generateParksOptimized(size, ratio) {
        const baseNumParks = size === 'small' ? 2 : size === 'medium' ? 4 : size === 'large' ? 6 : 8;
        const numParks = Math.floor(baseNumParks * ratio * 10);
        
        const parks = [];
        const maxAttempts = 50;
        
        for (let i = 0; i < numParks && parks.length < numParks; i++) {
            const park = this.createParkOptimized(size, maxAttempts);
            if (park) {
                parks.push(park);
            }
        }
        
        // Batch draw parks
        this.drawParksBatch(parks);
        this.cityData.parks = parks;
    }
    
    createParkOptimized(size, maxAttempts) {
        const baseSize = size === 'small' ? 25 : size === 'medium' ? 35 : size === 'large' ? 45 : 55;
        const parkSize = baseSize + Math.random() * baseSize * 0.5;
        
        for (let attempts = 0; attempts < maxAttempts; attempts++) {
            const x = Math.random() * (this.canvas.width - parkSize);
            const y = Math.random() * (this.canvas.height - parkSize);
            
            if (!this.isOnRoadOptimized(x, y, parkSize, parkSize) && !this.isOnWaterOptimized(x, y, parkSize, parkSize)) {
                return {
                    x: x,
                    y: y,
                    size: parkSize,
                    trees: Math.floor(Math.random() * 5) + 3,
                    fountain: Math.random() < 0.2
                };
            }
        }
        
        return null;
    }
    
    drawParksBatch(parks) {
        parks.forEach(park => {
            // Grass base
            this.ctx.fillStyle = '#27ae60';
            this.ctx.fillRect(park.x, park.y, park.size, park.size);
            
            // Trees
            this.ctx.fillStyle = '#2d5a27';
            for (let i = 0; i < park.trees; i++) {
                const treeX = park.x + Math.random() * park.size;
                const treeY = park.y + Math.random() * park.size;
                const treeSize = 3 + Math.random() * 3;
                
                this.ctx.beginPath();
                this.ctx.arc(treeX, treeY, treeSize, 0, 2 * Math.PI);
                this.ctx.fill();
            }
            
            // Fountain
            if (park.fountain) {
                this.ctx.fillStyle = '#3498db';
                this.ctx.beginPath();
                this.ctx.arc(park.x + park.size/2, park.y + park.size/2, 4, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        });
    }
    
    async generateLandmarksOptimized(size, style) {
        const numLandmarks = size === 'small' ? 1 : size === 'medium' ? 2 : size === 'large' ? 3 : 4;
        
        for (let i = 0; i < numLandmarks; i++) {
            const landmark = this.createLandmarkOptimized(style);
            this.drawLandmarkOptimized(landmark);
        }
    }
    
    createLandmarkOptimized(style) {
        return {
            x: Math.random() * (this.canvas.width - 50),
            y: Math.random() * (this.canvas.height - 50),
            width: 30 + Math.random() * 20,
            height: 40 + Math.random() * 30,
            style: style
        };
    }
    
    drawLandmarkOptimized(landmark) {
        this.ctx.fillStyle = '#f39c12';
        this.ctx.fillRect(landmark.x, landmark.y, landmark.width, landmark.height);
        
        this.ctx.strokeStyle = '#e67e22';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(landmark.x, landmark.y, landmark.width, landmark.height);
    }
    
    calculateAdvancedStatistics() {
        let population = 0;
        let area = 0;
        
        // Optimized calculations
        this.cityData.buildings.forEach(building => {
            const buildingArea = building.width * building.height;
            area += buildingArea;
            population += Math.floor(buildingArea / 8) * building.floors;
        });
        
        population += this.cityData.parks.length * 50;
        population += this.cityData.waterBodies.length * 200;
        population += Math.floor(Math.random() * 1000);
        
        this.cityData.population = population;
        this.cityData.area = Math.floor(area / 1000);
    }
    
    updateAdvancedStats() {
        // Batch DOM updates
        const updates = [
            ['buildingCount', this.cityData.buildings.length],
            ['roadCount', this.cityData.roads.length],
            ['parkCount', this.cityData.parks.length],
            ['waterCount', this.cityData.waterBodies.length],
            ['population', this.cityData.population.toLocaleString()],
            ['cityArea', this.cityData.area],
            ['cityName', this.cityData.name],
            ['cityFounded', this.cityData.founded],
            ['cityClimate', this.cityData.climate],
            ['cityEconomy', this.cityData.economy]
        ];
        
        updates.forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
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

// Initialize the optimized city generator
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedCityGenerator();
});