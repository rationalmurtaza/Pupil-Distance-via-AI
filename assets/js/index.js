let video = document.querySelector("#video");
let click_button = document.querySelector("#click-photo");
let canvas = document.querySelector("#canvas");
let reset_photo = document.querySelector("#reset-photo");
let reset_and_calculate_buttons_div = document.querySelector("#reset-and-calculate-buttons");
let calculate_distance = document.querySelector("#calculate");
let video_image_div = document.querySelector("#video-and-image");
let ctx = ''


video.addEventListener("playing", function () {
    setTimeout(function () {
        console.log("Stream dimensions" + video.videoWidth + "x" + video.videoHeight);
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
    }, 500);
});

async function startCamera() {
    let stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    });
    video.srcObject = stream;
}

click_button.addEventListener('click', function () {
    video_image_div.style.display = "none";
    canvas.style.display = "block";
    reset_and_calculate_buttons_div.style.display = "flex";
    click_button.style.display = "none";
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    ctx = canvas.getContext('2d')
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, canvas.width * -1, 0, canvas.width, canvas.height);
    ctx.restore();
});

reset_photo.addEventListener('click', function () {
    canvas.style.display = "none";
    video_image_div.style.display = "";
    reset_and_calculate_buttons_div.style.display = "none";
    click_button.style.display = "block";
});

calculate_distance.addEventListener('click', function () {
    autoDraw();
});

startCamera()
// AUTO CALC PD METHODS START-----------------------------------------------

async function autoDraw() {

    model = await loadFaceLandmarkDetectionModel();
    //Render Face Mesh Prediction
    renderPrediction();
}

async function loadFaceLandmarkDetectionModel() {
    return faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh, {
            maxFaces: 1
        }
    );
}

async function renderPrediction() {
    const predictions = await model.estimateFaces({
        input: ctx.getImageData(0, 0, canvas.width, canvas.height),
    });

    displayIrisPosition(predictions);
}

function displayIrisPosition(predictions) {
    ctx.strokeStyle = "red";
    if (predictions.length > 0) {
        predictions.forEach((prediction) => {
            const keyPoints = prediction.scaledMesh;
            if (keyPoints.length == 478) {
                for (let i = 468; i < 478; i++) {
                    let x = keyPoints[i][0];
                    let y = keyPoints[i][1];
                    ctx.beginPath();
                    ctx.rect(x, y, 2, 2);
                    ctx.stroke();
                }

                let x1 = keyPoints[468][0];
                let x2 = keyPoints[473][0];
                let y1 = keyPoints[468][1];
                let y2 = keyPoints[473][1];

                //iris left
                let xLeft = keyPoints[474][0];
                let yLeft = keyPoints[474][1];
                let xRight = keyPoints[476][0];
                let yRight = keyPoints[476][1];

                //iris right
                let xLeft2 = keyPoints[471][0];
                let yLeft2 = keyPoints[471][1];
                let xRight2 = keyPoints[469][0];
                let yRight2 = keyPoints[469][1];

                var newPoint = new Point(x1, y1);
                var nextPoint = new Point(x2, y2);
                let pupilDistance = newPoint.distanceTo(nextPoint);

                var left = new Point(xLeft, yLeft);
                var right = new Point(xRight, yRight);

                var left2 = new Point(xLeft2, yLeft2);
                var right2 = new Point(xRight2, yRight2);

                let irisDiameter = left.distanceTo(right);
                let irisDiameter2 = left2.distanceTo(right2);

                let irisWidth = (irisDiameter + irisDiameter2) / 2;
                let pd = (11.7 / irisWidth) * pupilDistance;

                // alert("your Pupil Distance is approximately " + pd + "mm");
            }
        });
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.distanceTo = function (point) {
            var distance = Math.sqrt(
                Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2)
            );
            return distance;
        };
    }
}