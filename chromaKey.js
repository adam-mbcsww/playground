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
    yellowVideo.style.display = 'block';
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

    // Draw the yellow video within the detected yellow rectangles only
    yellowRects.forEach(rect => {
        let yellowVideoDiv = document.createElement('div');
        yellowVideoDiv.style.position = 'absolute';
        yellowVideoDiv.style.left = rect.x + 'px';
        yellowVideoDiv.style.top = rect.y + 'px';
        yellowVideoDiv.style.width = rect.width + 'px';
        yellowVideoDiv.style.height = rect.height + 'px';
        yellowVideoDiv.style.display = 'inline-block';
        yellowVideoDiv.appendChild(yellowVideo);
        output.appendChild(yellowVideoDiv);
        yellowVideo.play();
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