class CityGenerator {
    constructor() {
        this.canvas = document.getElementById('cityCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cityData = {
            buildings: [],
            roads: [],
            parks: [],
            population: 0
        };
        
        this.setupEventListeners();
        this.generateCity();
    }
    
    setupEventListeners() {
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateCity();
        });
    }
    
    generateCity() {
        this.clearCanvas();
        this.cityData = { buildings: [], roads: [], parks: [], population: 0 };
        
        const citySize = document.getElementById('citySize').value;
        const buildingStyle = document.getElementById('buildingStyle').value;
        const roadPattern = document.getElementById('roadPattern').value;
        
        // Generate roads first
        this.generateRoads(roadPattern, citySize);
        
        // Generate buildings
        this.generateBuildings(buildingStyle, citySize);
        
        // Generate parks
        this.generateParks(citySize);
        
        // Calculate population
        this.calculatePopulation();
        
        // Update statistics
        this.updateStats();
    }
    
    clearCanvas() {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    generateRoads(pattern, size) {
        const roadWidth = 8;
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
            case 'mixed':
                this.generateMixedRoads(size);
                break;
        }
    }
    
    generateGridRoads(size) {
        const spacing = size === 'small' ? 80 : size === 'medium' ? 60 : 40;
        
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
        const numRoads = size === 'small' ? 8 : size === 'medium' ? 12 : 18;
        
        for (let i = 0; i < numRoads; i++) {
            const startX = Math.random() * this.canvas.width;
            const startY = Math.random() * this.canvas.height;
            const endX = Math.random() * this.canvas.width;
            const endY = Math.random() * this.canvas.height;
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            
            // Create curved path
            const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 100;
            const midY = (startY + endY) / 2 + (Math.random() - 0.5) * 100;
            
            this.ctx.quadraticCurveTo(midX, midY, endX, endY);
            this.ctx.stroke();
            
            this.cityData.roads.push({ x1: startX, y1: startY, x2: endX, y2: endY });
        }
    }
    
    generateRadialRoads(size) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const numRoads = size === 'small' ? 6 : size === 'medium' ? 8 : 12;
        
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
        const numCircles = size === 'small' ? 2 : size === 'medium' ? 3 : 4;
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
    
    generateBuildings(style, size) {
        const numBuildings = size === 'small' ? 20 : size === 'medium' ? 35 : 50;
        
        for (let i = 0; i < numBuildings; i++) {
            const building = this.createBuilding(style);
            this.drawBuilding(building);
            this.cityData.buildings.push(building);
        }
    }
    
    createBuilding(style) {
        const minSize = 15;
        const maxSize = 40;
        const width = minSize + Math.random() * (maxSize - minSize);
        const height = minSize + Math.random() * (maxSize - minSize);
        
        // Avoid placing buildings on roads
        let x, y;
        do {
            x = Math.random() * (this.canvas.width - width);
            y = Math.random() * (this.canvas.height - height);
        } while (this.isOnRoad(x, y, width, height));
        
        return {
            x: x,
            y: y,
            width: width,
            height: height,
            style: style,
            color: this.getBuildingColor(style),
            windows: Math.floor(Math.random() * 8) + 2
        };
    }
    
    isOnRoad(x, y, width, height) {
        const roadBuffer = 10;
        for (let road of this.cityData.roads) {
            // Simple collision detection
            if (x < road.x2 + roadBuffer && x + width > road.x1 - roadBuffer &&
                y < road.y2 + roadBuffer && y + height > road.y1 - roadBuffer) {
                return true;
            }
        }
        return false;
    }
    
    getBuildingColor(style) {
        const colors = {
            modern: ['#3498db', '#2980b9', '#5dade2', '#85c1e9'],
            classical: ['#e67e22', '#d35400', '#f39c12', '#f8c471'],
            futuristic: ['#9b59b6', '#8e44ad', '#bb8fce', '#d7bde2'],
            mixed: ['#3498db', '#e67e22', '#9b59b6', '#2ecc71', '#e74c3c']
        };
        
        const styleColors = colors[style] || colors.mixed;
        return styleColors[Math.floor(Math.random() * styleColors.length)];
    }
    
    drawBuilding(building) {
        this.ctx.fillStyle = building.color;
        this.ctx.fillRect(building.x, building.y, building.width, building.height);
        
        // Add windows
        this.drawWindows(building);
        
        // Add style-specific details
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
        }
    }
    
    drawWindows(building) {
        this.ctx.fillStyle = '#f1c40f';
        const windowSize = 2;
        const spacing = 4;
        
        for (let i = 0; i < building.windows; i++) {
            const windowX = building.x + spacing + (i * (windowSize + spacing));
            const windowY = building.y + spacing;
            
            if (windowX + windowSize < building.x + building.width) {
                this.ctx.fillRect(windowX, windowY, windowSize, windowSize);
            }
        }
    }
    
    drawModernDetails(building) {
        // Add glass effect
        this.ctx.strokeStyle = '#ecf0f1';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(building.x, building.y, building.width, building.height);
    }
    
    drawClassicalDetails(building) {
        // Add columns
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
    }
    
    drawFuturisticDetails(building) {
        // Add neon glow
        this.ctx.shadowColor = building.color;
        this.ctx.shadowBlur = 10;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(building.x, building.y, building.width, building.height);
        this.ctx.shadowBlur = 0;
    }
    
    generateParks(size) {
        const numParks = size === 'small' ? 2 : size === 'medium' ? 4 : 6;
        
        for (let i = 0; i < numParks; i++) {
            const park = this.createPark();
            this.drawPark(park);
            this.cityData.parks.push(park);
        }
    }
    
    createPark() {
        const size = 30 + Math.random() * 40;
        let x, y;
        do {
            x = Math.random() * (this.canvas.width - size);
            y = Math.random() * (this.canvas.height - size);
        } while (this.isOnRoad(x, y, size, size));
        
        return {
            x: x,
            y: y,
            size: size,
            trees: Math.floor(Math.random() * 5) + 3
        };
    }
    
    drawPark(park) {
        // Draw grass
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
    }
    
    calculatePopulation() {
        let population = 0;
        
        // Population based on buildings
        for (let building of this.cityData.buildings) {
            const area = building.width * building.height;
            population += Math.floor(area / 10);
        }
        
        // Add some randomness
        population += Math.floor(Math.random() * 1000);
        
        this.cityData.population = population;
    }
    
    updateStats() {
        document.getElementById('buildingCount').textContent = this.cityData.buildings.length;
        document.getElementById('roadCount').textContent = this.cityData.roads.length;
        document.getElementById('parkCount').textContent = this.cityData.parks.length;
        document.getElementById('population').textContent = this.cityData.population.toLocaleString();
    }
}

// Initialize the city generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CityGenerator();
});