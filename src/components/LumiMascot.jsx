import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

const LumiMascot = ({ mbti, personalityData, size = 150 }) => {
    const renderRef = useRef();

    useEffect(() => {
        let myP5;

        const sketch = (p) => {
            let particles = [];
            let numParticles = 30;
            let angle = 0;

            // MBTI/Personality data influences the algorithm
            const energyLevel = (personalityData?.E || 50) / 100;
            const opennessLevel = (personalityData?.O || 50) / 100;
            const neuroLevel = (personalityData?.N || 50) / 100;

            p.setup = () => {
                p.createCanvas(size, size).parent(renderRef.current);
                p.noFill();
                for (let i = 0; i < numParticles; i++) {
                    particles.push(new Particle(p));
                }
            };

            p.draw = () => {
                p.clear();
                p.translate(p.width / 2, p.height / 2);

                // Background aura based on energy
                p.noStroke();
                let auraColor = p.color(139, 92, 246, 30); // Primary faint
                if (energyLevel > 0.7) auraColor = p.color(244, 114, 182, 30); // More pinkish
                p.fill(auraColor);
                p.ellipse(0, 0, size * (0.6 + p.sin(p.frameCount * 0.05) * 0.1));

                p.noFill();
                p.strokeWeight(2);

                // Dynamic shape based on traits
                angle += 0.02 * (1 + energyLevel);

                for (let i = 0; i < particles.length; i++) {
                    particles[i].update(energyLevel, neuroLevel);
                    particles[i].draw(opennessLevel);
                }
            };

            class Particle {
                constructor(p) {
                    this.p = p;
                    this.pos = p.createVector(p.random(-20, 20), p.random(-20, 20));
                    this.vel = p.createVector(p.random(-1, 1), p.random(-1, 1));
                    this.size = p.random(4, 8);
                    this.hue = p.random(250, 280);
                }

                update(energy, neuro) {
                    let noiseVal = this.p.noise(this.pos.x * 0.01, this.pos.y * 0.01, this.p.frameCount * 0.01);
                    let force = p5.Vector.fromAngle(noiseVal * this.p.TWO_PI * (1 + neuro));
                    this.vel.add(force.mult(0.1));
                    this.vel.limit(2 + energy * 3);
                    this.pos.add(this.vel);

                    if (this.pos.dist(this.p.createVector(0, 0)) > size / 3) {
                        this.pos.lerp(this.p.createVector(0, 0), 0.1);
                    }
                }

                draw(openness) {
                    this.p.stroke(139, 92, 246, 200);
                    if (openness > 0.6) {
                        this.p.ellipse(this.pos.x, this.pos.y, this.size);
                    } else {
                        this.p.rect(this.pos.x, this.pos.y, this.size, this.size);
                    }
                }
            }
        };

        myP5 = new p5(sketch);
        return () => myP5.remove();
    }, [mbti, personalityData, size]);

    return (
        <div ref={renderRef} style={{ width: size, height: size, cursor: 'pointer' }} className="mascot-container" />
    );
};

export default LumiMascot;
