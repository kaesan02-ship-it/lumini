import React, { useRef, useEffect } from 'react';
import p5 from 'p5';
import { getMascotSketch } from '../utils/mascotAlgorithm';

const LumiMascot = ({ mbti, personalityData, size = 150 }) => {
    const renderRef = useRef();

    useEffect(() => {
        let myP5;
        const sketch = getMascotSketch(size, personalityData);

        if (renderRef.current) {
            myP5 = new p5(sketch, renderRef.current);
        }

        return () => {
            if (myP5) myP5.remove();
        };
    }, [mbti, personalityData, size]);

    return (
        <div
            ref={renderRef}
            style={{
                width: size,
                height: size,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            className="mascot-container"
        />
    );
};

export default LumiMascot;
