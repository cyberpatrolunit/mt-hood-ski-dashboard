/**
 * Canvas Snow Particle System - Timberline Lodge Edition
 * Elegant, subtle snow with warm ivory tones
 */

class SnowParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.currentSnowfall = 0;
        this.currentWindSpeed = 0;
        this.targetParticleCount = 0;
        
        // Resize canvas to fill window
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Start animation loop
        this.animate();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    /**
     * Update particle system based on snowfall and wind conditions
     * @param {number} snowfallInches - Current 12hr snowfall in inches
     * @param {number} windSpeedMph - Current wind speed in mph
     */
    updateConditions(snowfallInches, windSpeedMph) {
        this.currentSnowfall = snowfallInches;
        this.currentWindSpeed = windSpeedMph;
        
        // Calculate target particle count - more subtle and elegant
        // 0-1": 12-25 particles (very light, peaceful)
        // 1-3": 25-50 particles (gentle snowfall)
        // 3-6": 50-90 particles (moderate, elegant)
        // 6"+: 90-140 particles (heavier but still refined)
        if (snowfallInches < 1) {
            this.targetParticleCount = Math.floor(12 + (snowfallInches * 13));
        } else if (snowfallInches < 3) {
            this.targetParticleCount = Math.floor(25 + ((snowfallInches - 1) * 12.5));
        } else if (snowfallInches < 6) {
            this.targetParticleCount = Math.floor(50 + ((snowfallInches - 3) * 13.3));
        } else {
            this.targetParticleCount = Math.min(140, Math.floor(90 + ((snowfallInches - 6) * 8.3)));
        }
        
        // Adjust for mobile performance
        if (window.innerWidth < 768) {
            this.targetParticleCount = Math.floor(this.targetParticleCount * 0.6);
        }
        
        // Gradually add or remove particles
        this.adjustParticleCount();
    }
    
    adjustParticleCount() {
        const currentCount = this.particles.length;
        const diff = Math.abs(this.targetParticleCount - currentCount);
        
        // Allow faster particle addition/removal during blizzard mode
        const isBlizzardMode = this.targetParticleCount > 150;
        const maxChange = isBlizzardMode ? Math.min(15, Math.ceil(diff / 5)) : 2;
        
        if (currentCount < this.targetParticleCount) {
            // Add particles gradually
            const toAdd = Math.min(maxChange, this.targetParticleCount - currentCount);
            for (let i = 0; i < toAdd; i++) {
                this.particles.push(this.createParticle());
            }
        } else if (currentCount > this.targetParticleCount) {
            // Remove particles gradually
            const toRemove = Math.min(maxChange, currentCount - this.targetParticleCount);
            this.particles.splice(0, toRemove);
        }
    }
    
    createParticle(startAtTop = false) {
        const isMobile = window.innerWidth < 768;
        
        // Smaller, more delicate particles
        let baseSize = 1.5;
        if (this.currentSnowfall > 6) baseSize = 2.2;
        else if (this.currentSnowfall > 3) baseSize = 1.9;
        
        const size = baseSize + Math.random() * 1.2;
        
        return {
            x: Math.random() * this.canvas.width,
            y: startAtTop ? -10 : Math.random() * this.canvas.height,
            size: size,
            // Very slow, elegant fall speed
            speedY: 0.25 + Math.random() * (this.currentSnowfall > 3 ? 0.9 : 0.7),
            speedX: 0,
            // Elegant, cream/ivory opacity
            opacity: 0.2 + Math.random() * 0.4,
            swingOffset: Math.random() * Math.PI * 2,
            // Very gentle swing motion
            swingSpeed: 0.012 + Math.random() * 0.015,
            // Warm cream/ivory color variation
            warmth: 0.88 + Math.random() * 0.12
        };
    }
    
    animate() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Gradually adjust particle count
        if (this.particles.length !== this.targetParticleCount) {
            this.adjustParticleCount();
        }
        
        // Very subtle wind effect
        const windEffect = (this.currentWindSpeed / 70) * 1.2;
        
        // Update and draw each particle
        this.particles.forEach((particle, index) => {
            // Elegant falling motion
            particle.y += particle.speedY;
            
            // Gentle, refined swing motion
            particle.swingOffset += particle.swingSpeed;
            const swing = Math.sin(particle.swingOffset) * 0.35;
            particle.x += swing + windEffect;
            
            // Reset particle if it goes off screen
            if (particle.y > this.canvas.height) {
                this.particles[index] = this.createParticle(true);
            } else if (particle.x < -10 || particle.x > this.canvas.width + 10) {
                this.particles[index] = this.createParticle(true);
            }
            
            // Draw particle with warm cream/ivory tones
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            
            // Warm cream/ivory/beige color palette (matching F5F5DC, FFFDD0)
            const r = Math.floor(252 * particle.warmth);
            const g = Math.floor(248 * particle.warmth);
            const b = Math.floor(235 * particle.warmth);
            
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.opacity})`;
            this.ctx.fill();
            
            // Add very subtle glow for larger particles
            if (particle.size > 2.0) {
                this.ctx.shadowBlur = 3;
                this.ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
            } else {
                this.ctx.shadowBlur = 0;
            }
        });
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    /**
     * Trigger blizzard mode with smooth ramp up and fade
     * @param {number} duration - Duration of peak blizzard in ms (default 10000)
     */
    triggerBlizzard(duration = 10000) {
        // Save original settings
        const originalSnowfall = this.currentSnowfall;
        const originalWind = this.currentWindSpeed;
        
        // Phase 1: Ramp up to blizzard (2 seconds)
        let intensity = originalSnowfall;
        const rampUpDuration = 2000;
        const rampUpSteps = 20;
        const rampUpIncrement = (45 - originalSnowfall) / rampUpSteps;
        
        let step = 0;
        const rampUpInterval = setInterval(() => {
            step++;
            intensity = originalSnowfall + (rampUpIncrement * step);
            const windIntensity = originalWind + ((35 - originalWind) * step / rampUpSteps);
            this.updateConditions(intensity, windIntensity);
            
            if (step >= rampUpSteps) {
                clearInterval(rampUpInterval);
                
                // Phase 2: Peak blizzard
                this.updateConditions(45, 35);
                
                // Phase 3: Gradual fade back (3 seconds)
                setTimeout(() => {
                    let fadeStep = 0;
                    const fadeDuration = 3000;
                    const fadeSteps = 20;
                    const fadeDecrement = (45 - originalSnowfall) / fadeSteps;
                    
                    const fadeInterval = setInterval(() => {
                        fadeStep++;
                        const fadeIntensity = 45 - (fadeDecrement * fadeStep);
                        const fadeWind = 35 - ((35 - originalWind) * fadeStep / fadeSteps);
                        
                        if (fadeStep >= fadeSteps) {
                            clearInterval(fadeInterval);
                            this.updateConditions(originalSnowfall, originalWind);
                        } else {
                            this.updateConditions(fadeIntensity, fadeWind);
                        }
                    }, fadeDuration / fadeSteps);
                }, duration);
            }
        }, rampUpDuration / rampUpSteps);
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', () => this.resizeCanvas());
    }
}

// Initialize the snow system when DOM is ready
let snowSystem = null;

function initSnowEffect() {
    const canvas = document.createElement('canvas');
    canvas.id = 'snowCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    document.body.insertBefore(canvas, document.body.firstChild);
    
    snowSystem = new SnowParticleSystem('snowCanvas');
    
    // Start with very light, elegant snow
    snowSystem.updateConditions(0.4, 5);
}

// Auto-initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSnowEffect);
} else {
    initSnowEffect();
}

// Export for global access
window.snowSystem = snowSystem;
