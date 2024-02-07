const webcam = document.getElementById('webcam');
const output = document.getElementById('output');
const ctx = output.getContext('2d');

const yellowVideo = document.getElementById('video');
const yellowVideoUrl = 'test.mp4';

function loadYellowVideo() {
    const yellowVideo = document.createElement('video');
    yellowVideo.id = 'video';
    yellowVideo.width = 0;
    yellowVideo.height = 0;
    yellowVideo.style.position = 'absolute';
    yellowVideo.style.top = '0px';
    yellowVideo.style.left = '0px';
    yellowVideo.style.display = 'none';
    yellowVideo.src = yellowVideoUrl;
    yellowVideo.load();
    document.body.appendChild(yellowVideo);
}

loadYellowVideo();

navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
        webcam.srcObject = stream;
        webcam.addEventListener('loadedmetadata', () => {
            webcam.play();
            loop();
        });
    })
    .catch(err => console.error(err));

let yellowVideoDrawn = false; 


    function loop() {
        ctx.clearRect(0, 0, output.width, output.height);
        ctx.drawImage(webcam, 0, 0, output.width, output.height);
    
        let yellowRects = detectYellow(output, ctx);
        
        let mouseX, mouseY;

        output.addEventListener('mousemove', (event) => {
            mouseX = event.offsetX;
            mouseY = event.offsetY;
        });
    
        // Draw the yellow video within the detected yellow rectangles only
        yellowRects.forEach(rect => {
            yellowVideo.style.left = rect.x + 'px';
            yellowVideo.style.top = rect.y + 'px';
            yellowVideo.style.width = rect.width + 'px';
            yellowVideo.style.height = rect.height + 'px';
            yellowVideo.style.display = 'block';
            yellowVideo.play();
        });
    
        // Hide the yellow video outside of the yellow rectangles
        if (!yellowRects.some(r => r.x <= mouseX && mouseX <= r.x + r.width && r.y <= mouseY && mouseY <= r.y + r.height)) {
            yellowVideo.style.display = 'none';
        }
    
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