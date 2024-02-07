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
    detectYellow(output, ctx);
    ctx.drawImage(video, 0, 0, output.width, output.height);
    requestAnimationFrame(loop);
}

function detectYellow(canvas, ctx) {
    data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < data.data.length; i += 4) {
        let r = data.data[i];
        let g = data.data[i + 1];
        let b = data.data[i + 2];

        // Adjust these values to detect the desired yellow color
        if (g > 128 && r > 128 && r > g - 64 && b < 80) {
            data.data[i + 3] = 0; // Set alpha to 0 to make it transparent
        }
    }
    ctx.putImageData(data, 0, 0);
}