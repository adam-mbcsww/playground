const webcam = document.getElementById('webcam');
const video = document.getElementById('video');
const output = document.getElementById('output');
const ctx = output.getContext('2d');

navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
        webcam.srcObject = stream;
        webcam.addEventListener('loadedmetadata', () => {
            webcam.play();
            loop();
        });
    })
    .catch(err => console.error(err));
    
    function loop() {
        ctx.clearRect(0, 0, output.width, output.height);
        ctx.drawImage(webcam, 0, 0, output.width, output.height);
    
        let yellowRects = detectYellow(output, ctx);
    
        // Draw the video within the detected yellow rectangles
        yellowRects.forEach(rect => {
            ctx.drawImage(video, rect.x, rect.y, rect.width, rect.height);
        });
    
        requestAnimationFrame(loop);
    }
    
    function detectYellow(canvas, ctx) {
        let yellowRects = [];
        let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < data.data.length; i += 4) {
            let r = data.data[i];
            let g = data.data[i + 1];
            let b = data.data[i + 2];
    
            // Adjust these values to detect the desired yellow color
            if (g > 128 && r > 128 && r > g - 64 && b < 80) {
                let x = (i / 4) % canvas.width;
                let y = Math.floor((i / 4) / canvas.width);
    
                // Create a new yellow rectangle if it doesn't exist yet
                let yellowRect = yellowRects.find(rect => rect.x === x && rect.y === y);
                if (!yellowRect) {
                    yellowRect = { x: x, y: y, width: 1, height: 1 };
                    yellowRects.push(yellowRect);
                } else {
                    // Expand the existing yellow rectangle
                    yellowRect.width++;
                    yellowRect.height = Math.max(yellowRect.height, 1);
                }
            }
        }
    
        // Draw the yellow rectangles for debugging purposes
        ctx.strokeStyle = 'yellow';
        yellowRects.forEach(rect => {
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        });
    
        return yellowRects;
    }