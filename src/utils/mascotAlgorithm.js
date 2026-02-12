/**
 * 성격 데이터와 MBTI에 기반하여 마스코트의 형태와 움직임을 결정하는 알고리즘
 */

export class MascotParticle {
    constructor(p, size) {
        this.p = p;
        this.size = size;
        this.pos = p.createVector(p.random(-20, 20), p.random(-20, 20));
        this.vel = p.createVector(p.random(-1, 1), p.random(-1, 1));
        this.r = p.random(4, 8);
    }

    update(energy, neuro) {
        let noiseVal = this.p.noise(this.pos.x * 0.01, this.pos.y * 0.01, this.p.frameCount * 0.01);
        let force = this.p.constructor.Vector.fromAngle(noiseVal * this.p.TWO_PI * (1 + neuro));
        this.vel.add(force.mult(0.1));
        this.vel.limit(2 + energy * 3);
        this.pos.add(this.vel);

        // 중심점으로 끌어당기는 힘
        if (this.pos.dist(this.p.createVector(0, 0)) > this.size / 3) {
            this.pos.lerp(this.p.createVector(0, 0), 0.1);
        }
    }

    draw(openness) {
        this.p.stroke(139, 92, 246, 200);
        if (openness > 0.6) {
            this.p.ellipse(this.pos.x, this.pos.y, this.r);
        } else {
            this.p.rect(this.pos.x, this.pos.y, this.r, this.r);
        }
    }
}

export const getMascotSketch = (size, personalityData) => {
    return (p) => {
        let particles = [];
        let numParticles = 35;

        const energyLevel = (personalityData?.E || 50) / 100;
        const opennessLevel = (personalityData?.O || 50) / 100;
        const neuroLevel = (personalityData?.N || 50) / 100;

        p.setup = () => {
            p.createCanvas(size, size);
            p.noFill();
            for (let i = 0; i < numParticles; i++) {
                particles.push(new MascotParticle(p, size));
            }
        };

        p.draw = () => {
            p.clear();
            p.translate(p.width / 2, p.height / 2);

            // Aura
            p.noStroke();
            let auraColor = p.color(139, 92, 246, 25);
            if (energyLevel > 0.7) auraColor = p.color(244, 114, 182, 30);
            p.fill(auraColor);
            p.ellipse(0, 0, size * (0.65 + p.sin(p.frameCount * 0.04) * 0.12));

            p.noFill();
            p.strokeWeight(2.5);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update(energyLevel, neuroLevel);
                particles[i].draw(opennessLevel);
            }
        };
    };
};
