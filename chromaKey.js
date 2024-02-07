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
    yellowVideo.style.display = 'inline-block';
    yellowVideo.src = yellowVideoUrl;
    yellowVideo.load();
    document.body.appendChild(yellowVideo);

    const yellowVideoDiv = document.createElement('div');
    yellowVideoDiv.style.position = 'relative';
    yellowVideoDiv.style.width = '100%';
    yellowVideoDiv.style.height = '100%';
    output.appendChild(yellowVideoDiv);
    yellowVideoDiv.appendChild(yellowVideo);
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

    // Calculate the bounding box of all the yellow rectangles
    let x = Infinity, y = Infinity, width = 0, height = 0;
    yellowRects.forEach(rect => {
        x = Math.min(x, rect.x);
        y = Math.min(y, rect.y);
        width = Math.max(width, rect.x + rect.width);
        height = Math.max(height, rect.y + rect.height);
    });

    // Position and size the yellow video div relative to the bounding box
    let yellowVideoDiv = output.querySelector('#video').parentElement;
    yellowVideoDiv.style.left = x + 'px';
    yellowVideoDiv.style.top = y + 'px';
    yellowVideoDiv.style.width = (width - x) + 'px';
    yellowVideoDiv.style.height = (height - y) + 'px';

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

            // Check if this pixel is adjacent to an existing yellow rectangle
            let adjacentRect = false;
            for (let j = 0; j < yellowRects.length; j++) {
                let rect = yellowRects[j];
                if (x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height) {
                    adjacentRect = rect;
                    break;
                }
            }

            // If this pixel is not adjacent to an existing yellow rectangle, create a new one
            if (!adjacentRect) {
                adjacentRect = { x: x, y: y, width: 1, height: 1 };
                yellowRects.push(adjacentRect);
            }

            // Expand the existing yellow rectangle
            adjacentRect.width = Math.max(adjacentRect.width, x + 1 - adjacentRect.x);
            adjacentRect.height = Math.max(adjacentRect.height, y + 1 - adjacentRect.y);
        }
    }

    // Draw the yellow rectangles for debugging purposes
    ctx.strokeStyle = 'yellow';
    yellowRects.forEach(rect => {
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    });

    return yellowRects;
}