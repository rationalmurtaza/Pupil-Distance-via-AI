let video = document.querySelector("#video");
let click_button = document.querySelector("#click-photo");
let canvas = document.querySelector("#canvas");
let reset_photo = document.querySelector("#reset-photo");
let reset_and_calculate_buttons_div = document.querySelector("#reset-and-calculate-buttons");
let calculate_distance = document.querySelector("#calculate");
let video_image_div = document.querySelector("#video-and-image");
let ctx = ''
let loader = document.querySelector(".loader");
let calculate = document.querySelector("#calculate");
let pupil_distance_text = document.querySelector(".pupil-distance-text");
let ctxImage = document.getElementById('canvasForImage').getContext('2d');
let mainDivForVideo = document.querySelector("#main-div-for-video");
let mainDivForImage = document.querySelector("#main-div-for-Image");
let cameraOnButton = document.querySelector("#camera-on-button");
let chooseImageButton = document.querySelector("#choose-image-button");
let imageForEyePupils = document.querySelector("#image-for-eye-pupils");
let loaderImage = document.querySelector(".loader-image");

let canvasForImage = document.querySelector("#canvasForImage");
let calculateImagePd = document.querySelector("#calculate-image-pd");

cameraOnButton.addEventListener("click", () => {
    resetPhotoFunction();
    mainDivForImage.style.display = "none";
    mainDivForVideo.style.display = "";
    startCamera();
});

chooseImageButton.addEventListener("click", () => {
    ctxImage.clearRect(0, 0, canvasForImage.width, canvasForImage.height);
    imageForEyePupils.value = '';
    mainDivForVideo.style.display = "none";
    mainDivForImage.style.display = "";
    calculateImagePd.style.display = "none";
    pupil_distance_text.innerHTML = "";
})

imageForEyePupils.addEventListener('change', (e) => {
    let image = e.target.files[0];
    ctxImage.clearRect(0, 0, canvasForImage.width, canvasForImage.height);
    var img = new Image;
    img.src = URL.createObjectURL(image);
    img.onload = function() {
        let imgWidth = this.width;
        let imgHeight = this.height;
        while(imgWidth > canvasForImage.width && imgHeight > canvasForImage.height) {
            imgWidth = imgWidth / 2;
            imgHeight = imgHeight / 2;
        }
        ctxImage.drawImage(img, 0, 0, imgWidth, imgHeight);
    }
    calculateImagePd.style.display = "";
})

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

calculateImagePd.addEventListener("click", () => {
    loaderImage.style.display = "flex";
    autoDraw(ctxImage, canvasForImage);
})

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
    resetPhotoFunction();
})

let resetPhotoFunction = () => {
    canvas.style.display = "none";
    video_image_div.style.display = "";
    calculate.style.display = "";
    reset_and_calculate_buttons_div.style.display = "none";
    click_button.style.display = "block";
    pupil_distance_text.innerHTML = "";
}

calculate_distance.addEventListener('click', function () {
    loader.style.display = "flex";
    calculate.style.display = "none";
    autoDraw(ctx, canvas);
});

// AUTO CALC PD METHODS START-----------------------------------------------

async function autoDraw(canvas, workingCanvas) {

    model = await loadFaceLandmarkDetectionModel();
    //Render Face Mesh Prediction
    console.log(model);
    renderPrediction(canvas, workingCanvas);

}

async function loadFaceLandmarkDetectionModel() {
    return faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh, {
            maxFaces: 1
        }
    );
}

async function renderPrediction(ctx, workingCanvas) {
    const predictions = await model.estimateFaces({
        input: ctx.getImageData(0, 0, workingCanvas.width, workingCanvas.height),
    });
    console.log(predictions);
    displayIrisPosition(predictions, ctx,);
}

function displayIrisPosition(predictions, ctx) {
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
                let midX =  keyPoints[168][0];
                let midY = ((keyPoints[473][1] + keyPoints[468][1])/2);

                let leftEyeCenterX = keyPoints[468][0];
                let leftEyeCenterY = keyPoints[468][1];

                let rightEyeCenterX = keyPoints[473][0];
                let rightEyeCenterY = keyPoints[473][1];

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

                var leftEyePoint = new Point(leftEyeCenterX, leftEyeCenterY);
                var rightEyePoint = new Point(rightEyeCenterX, rightEyeCenterY);
                let pupilDistance = leftEyePoint.distanceTo(rightEyePoint);
                
                ctx.lineWidth = 3;
                ctx.strokeStyle = "green";
                ctx.beginPath();
                ctx.moveTo(leftEyeCenterX, leftEyeCenterY);
                ctx.lineTo(midX, midY);
                ctx.stroke();

                ctx.strokeStyle = "blue";
                ctx.beginPath();
                ctx.moveTo(rightEyeCenterX, rightEyeCenterY);
                ctx.lineTo(midX, midY);
                ctx.stroke();

                let midPoint = new Point(midX, midY);
                let leftEyePdInDistance = midPoint.distanceTo(leftEyePoint);
                let rightEyePdInDistance = midPoint.distanceTo(rightEyePoint);

                var left = new Point(xLeft, yLeft);
                var right = new Point(xRight, yRight);

                var left2 = new Point(xLeft2, yLeft2);
                var right2 = new Point(xRight2, yRight2);

                let irisDiameterLeft = left.distanceTo(right);
                let irisDiameterRight = left2.distanceTo(right2);

                
                let irisWidth = (irisDiameterLeft + irisDiameterRight) / 2;

                let LeftEyePD = (11.7 / irisWidth) * leftEyePdInDistance;
                let RightEyePD = (11.7 / irisWidth) * rightEyePdInDistance;
                let pd = (11.7 / irisWidth) * pupilDistance;
                loader.style.display = "none";
                loaderImage.style.display = "none";
                pupil_distance_text.innerHTML = "<h2>Your Pupil Distance is approximately " + roundToNearest5(pd*100)/100 + "mm</h2>"
                                                + "<h3>Your Left Eye Monocular PD is approximately " + roundToNearest5(LeftEyePD*100)/100 + "mm</h3>"
                                                + "<h3>Your Right Eye Monocular PD is approximately " + roundToNearest5(RightEyePD*100)/100 + "mm</h3>";
            }
        });
    }
}

roundToNearest5 = (num) => Math.round(num / 50) * 50;

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