const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

// Constants
const TEMPLATES_FILE = path.join(__dirname, '../assets/memes/templates.json');
const MEMES_DIR = path.join(__dirname, '../assets/memes');

class MemeService {
    constructor() {
        this.templates = [];
        this.loadTemplates();
    }

    loadTemplates() {
        try {
            const data = fs.readFileSync(TEMPLATES_FILE, 'utf8');
            this.templates = JSON.parse(data);
            console.log(`MemeService: Loaded ${this.templates.length} templates.`);
        } catch (err) {
            console.error('MemeService: Failed to load templates:', err.message);
        }
    }

    getTemplates() {
        return this.templates;
    }

    /**
     * Draw text nicely fitted within a box
     */
    drawText(ctx, text, box) {
        const { x, y, w, h, color = 'black', stroke = null, rotation = 0, fontSize = 42 } = box;

        ctx.save();

        // Translate to center of box for rotation
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctx.translate(cx, cy);
        if (rotation) ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-cx, -cy);

        ctx.font = `bold ${fontSize}px "DejaVu Sans", "Arial", sans-serif`; // Use DejaVu Sans which is in Docker
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 4;
        }

        // Simple word wrap
        const words = text.split(' ');
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < w - 20) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);

        // Adjust font size if too many lines? (Simplified for MVP: fixed size)

        const lineHeight = fontSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        const startY = y + (h - totalHeight) / 2 + lineHeight / 2; // Center vertically

        lines.forEach((line, i) => {
            const lineY = startY + (i * lineHeight);
            if (stroke) ctx.strokeText(line, x + w / 2, lineY);
            ctx.fillText(line, x + w / 2, lineY);
        });

        ctx.restore();
    }

    async generateMeme(templateId, texts = []) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) throw new Error('Template not found');

        const imagePath = path.join(MEMES_DIR, template.filename);
        const image = await loadImage(imagePath);

        const canvas = createCanvas(template.width || image.width, template.height || image.height);
        const ctx = canvas.getContext('2d');

        // Draw Background
        ctx.drawImage(image, 0, 0, template.width, template.height);

        // Draw Texts
        template.boxes.forEach((box, index) => {
            const text = texts[index] || '';
            if (text) this.drawText(ctx, text.toUpperCase(), box);
        });

        return canvas.toBuffer('image/jpeg');
    }
}

module.exports = new MemeService();
