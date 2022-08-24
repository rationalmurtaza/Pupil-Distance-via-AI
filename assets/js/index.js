/* eslint-disable no-undef */
const video = document.querySelector('#video')
const clickButton = document.querySelector('#click-photo')
const canvas = document.querySelector('#canvas')
const resetPhoto = document.querySelector('#reset-photo')
const resetAndCalculateButtonsDiv = document.querySelector('#reset-and-calculate-buttons')
const calculateDistance = document.querySelector('#calculate')
const videoImageDiv = document.querySelector('#video-and-image')
let ctx = ''
const loader = document.querySelector('.loader')
const calculate = document.querySelector('#calculate')
const pupilDistanceText = document.querySelector('.pupil-distance-text')
const ctxImage = document.getElementById('canvasForImage').getContext('2d')
const mainDivForVideo = document.querySelector('#main-div-for-video')
const mainDivForImage = document.querySelector('#main-div-for-Image')
const cameraOnButton = document.querySelector('#camera-on-button')
const chooseImageButton = document.querySelector('#choose-image-button')
const imageForEyePupils = document.querySelector('#image-for-eye-pupils')
const loaderImage = document.querySelector('.loader-image')

const canvasForImage = document.querySelector('#canvasForImage')
const calculateImagePd = document.querySelector('#calculate-image-pd')
const lightningAndFaceDiv = document.querySelector('#main-div-for-video .face-and-lightning')
const lightning = document.querySelector('#main-div-for-video .face-and-lightning .lightning')
const faceDiv = document.querySelector('#main-div-for-video .face-and-lightning .face')
const faceCloserDiv = document.querySelector('#main-div-for-video .face-and-lightning .face-size')
const faceLookStraight = document.querySelector('#main-div-for-video .face-and-lightning .face-straight')

const ovalFaceImage = document.querySelector('#oval-face-image')

const counterDiv = document.querySelector('.counter')
/**
 * if false audio is not played
 */
const AUDIO_ON_OFF = false

cameraOnButton.addEventListener('click', () => {
  resetPhotoFunction()
  mainDivForImage.style.display = 'none'
  mainDivForVideo.style.display = ''
  startCamera()
  loader.style.display = 'flex'
  calculate.style.display = 'none'
})

chooseImageButton.addEventListener('click', () => {
  ctxImage.clearRect(0, 0, canvasForImage.width, canvasForImage.height)
  imageForEyePupils.value = ''
  mainDivForVideo.style.display = 'none'
  mainDivForImage.style.display = ''
  calculateImagePd.style.display = 'none'
  pupilDistanceText.innerHTML = ''
  videoImageDiv.style.display = 'none'
})

imageForEyePupils.addEventListener('change', (e) => {
  pupilDistanceText.innerHTML = ''
  const image = e.target.files[0]
  ctxImage.clearRect(0, 0, canvasForImage.width, canvasForImage.height)
  const img = new Image()
  img.src = URL.createObjectURL(image)
  img.onload = function () {
    let imgWidth = this.width
    let imgHeight = this.height
    while (imgWidth > canvasForImage.width && imgHeight > canvasForImage.height) {
      imgWidth = imgWidth / 2
      imgHeight = imgHeight / 2
    }
    ctxImage.drawImage(img, 0, 0, imgWidth, imgHeight)
  }
  calculateImagePd.style.display = ''
})

let imageData
let diagonalSize
let model
const loopForVideoFunction = async () => {
  clickButton.style.display = 'none'
  model = await loadFaceLandmarkDetectionModel()
  loader.style.display = 'none'
  let captureFlag = false
  let setIntervalFlag = false
  let count = 5
  let interval

  /**
   * If the audio is on and all the audio files are paused, then return true, otherwise return false
   * @returns A boolean value.
   * Generated on 08/19/2022
   */
  function checkAudioIsPlaying () {
    if (AUDIO_ON_OFF && audioBeStill.paused && audioComeCloser.paused &&
        audioEnsureProperLighting.paused && audioLookStraight.paused &&
        audioNoFaceDetected.paused) {
      return true
    } else {
      return false
    }
  }

  const audioBeStill = new Audio('assets/audio/be-still.mp3')
  const audioComeCloser = new Audio('assets/audio/come-closer.mp3')
  const audioEnsureProperLighting = new Audio('assets/audio/ensure-proper-lighting.mp3')
  const audioLookStraight = new Audio('assets/audio/look-straight.mp3')
  const audioNoFaceDetected = new Audio('assets/audio/no-face-detected.mp3');

  (async function loop () {
    if (videoImageDiv.style.display !== 'none') {
      lightningAndFaceDiv.style.display = 'flex'
      const percentageForFaceInVideo = 1
      const result = isItDark()
      const faces = await model.estimateFaces({
        input: imageData
      })
      let insideFaceFlag = false
      let eyeStraightFlag = false
      if (faces.length) {
        faceDiv.style.color = 'green'
        faceDiv.children[1].innerHTML = '✓'

        /** logging for face points */
        const leftEyeIris = {
          left: faces[0].scaledMesh[471],
          bottom: faces[0].scaledMesh[472],
          center: faces[0].scaledMesh[468],
          right: faces[0].scaledMesh[469],
          top: faces[0].scaledMesh[470]
        }
        // console.log('leftEyeIris: ', faces[0].annotations.leftEyeIris, leftEyeIris)

        // const midwayBetweenEyes = {
        //   top: faces[0].scaledMesh[168],
        //   bottom: faces[0].scaledMesh[6]
        // }
        // console.log('midwayBetweenEyes: ', faces[0])

        const rightEyeIris = {
          left: faces[0].scaledMesh[476],
          bottom: faces[0].scaledMesh[477],
          center: faces[0].scaledMesh[473],
          right: faces[0].scaledMesh[474],
          top: faces[0].scaledMesh[475]
        }
        // console.log('rightEyeIris: ', faces[0].annotations.rightEyeIris, rightEyeIris)

        const leftEyeMidPoints = new Point(leftEyeIris.center[0], leftEyeIris.center[1])
        const rightEyeMidPoints = new Point(rightEyeIris.center[0], rightEyeIris.center[1])
        // const midPoints = new Point(faces[0].annotations.midwayBetweenEyes[0][0], faces[0].annotations.midwayBetweenEyes[0][1])
        const midPoints = new Point((faces[0].scaledMesh[193][0] + faces[0].scaledMesh[417][0]) / 2,
          (leftEyeIris.center[1] + rightEyeIris.center[1]) / 2)
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        const leftToMidDistance = leftEyeMidPoints.distanceTo(midPoints)
        // console.log('🎮🌴 ~ loop ~ leftToMidDistance', leftToMidDistance)
        const rightToMidDistance = rightEyeMidPoints.distanceTo(midPoints)
        // console.log('🎮🌴 ~ loop ~ rightToMidDistance', rightToMidDistance)
        const completeDistance = leftEyeMidPoints.distanceTo(rightEyeMidPoints)
        // console.log('🎮🌴 ~ loop ~ completeDistance', completeDistance)

        const LOWER_PERCENTAGE = 0.92
        const HIGHER_PERCENTAGE = 1.08
        if (leftToMidDistance > rightToMidDistance * LOWER_PERCENTAGE &&
          leftToMidDistance < rightToMidDistance * HIGHER_PERCENTAGE) {
          console.log('Straight')
          eyeStraightFlag = true
          faceLookStraight.style.color = 'green'
          faceLookStraight.children[1].innerHTML = '✓'
        } else {
          faceLookStraight.style.color = 'red'
          faceLookStraight.children[1].innerHTML = '✕'
        }
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        /** logging for face points */

        const faceLeftX = faces[0].boundingBox.topLeft[0]
        const faceLeftY = faces[0].boundingBox.topLeft[1]
        const faceLeftPoints = new Point(faceLeftX, faceLeftY)

        const faceRightX = faces[0].boundingBox.bottomRight[0]
        const faceRightY = faces[0].boundingBox.bottomRight[1]
        const faceRightPoints = new Point(faceRightX, faceRightY)

        const diagonalSizeOfFace = faceRightPoints.distanceTo(faceLeftPoints)

        if (diagonalSize * percentageForFaceInVideo < diagonalSizeOfFace) {
          faceCloserDiv.style.color = 'green'
          faceCloserDiv.children[1].innerHTML = '✓'
          insideFaceFlag = true
        } else {
          if (checkAudioIsPlaying()) {
            audioComeCloser.play()
          }
          faceCloserDiv.style.color = 'red'
          faceCloserDiv.children[1].innerHTML = '✕'
        }
      } else {
        if (checkAudioIsPlaying()) {
          audioNoFaceDetected.play()
        }

        faceDiv.style.color = 'red'
        faceDiv.children[1].innerHTML = '✕'

        faceCloserDiv.style.color = 'red'
        faceCloserDiv.children[1].innerHTML = '✕'

        faceLookStraight.style.color = 'red'
        faceLookStraight.children[1].innerHTML = '✕'
      }

      if (!result) {
        lightning.style.color = 'green'
        lightning.children[1].innerHTML = '✓'
      } else {
        if (checkAudioIsPlaying()) audioEnsureProperLighting.play()
        lightning.style.color = 'red'
        lightning.children[1].innerHTML = '✕'
      }
      if (faces.length && !result && insideFaceFlag && eyeStraightFlag) {
        captureFlag = true
        if (count === 5) {
          counterDiv.children[0].children[0].innerHTML = 'hold on, Capturing Image...'
          if (checkAudioIsPlaying()) {
            audioLookStraight.play()
          }
        }
        counterDiv.style.display = 'flex'
      } else {
        // clickButton.style.display = "none";
        if (interval) {
          clearInterval(interval)
          interval = undefined
        }
        captureFlag = false
        count = 5
        setIntervalFlag = false
        counterDiv.style.display = 'none'
      }

      // const FALSE = false
      if (!interval && captureFlag && !setIntervalFlag && count === 5) {
        setIntervalFlag = true
        interval = setInterval(() => {
          if (!captureFlag) {
            clearInterval(interval)
            interval = undefined
            setIntervalFlag = false
          } else if (count === 4 && captureFlag) {
            clearInterval(interval)
            interval = undefined
            counterDiv.style.display = 'none'
            clickPhoto()
          } else if (count <= 3) {
            counterDiv.children[0].children[0].innerHTML = `<b>${count}</b>`
            if (checkAudioIsPlaying()) {
              audioBeStill.play()
            }
          }

          if (count <= 0) {
            clearInterval(interval)
            interval = undefined
          }

          if (count > 0) count--
        }, 1000)
      }
      setTimeout(loop, 1000 / 30) // drawing at 30fps
      // setTimeout(loop, 1000) // drawing at 30fps
    } else {
      clickButton.style.display = 'none'
      lightningAndFaceDiv.style.display = 'none'
      counterDiv.style.display = 'none'
      clearInterval(interval)
      interval = undefined
    }
  })()
}

video.addEventListener('playing', function () {
  setTimeout(function () {
    canvas.height = video.videoHeight
    canvas.width = video.videoWidth
  }, 500)
  loopForVideoFunction()
})

/**
 * It takes a video frame, draws it on a canvas, then counts the number of pixels that are dark and the
 * number of pixels that are light. If there are more dark pixels than light pixels, it returns true
 * @returns A boolean value.
 *
 * Generated on 08/19/2022
 */
function isItDark () {
  const fuzzy = 0.1
  const canvas = document.createElement('canvas')
  canvas.height = video.videoHeight
  canvas.width = video.videoWidth

  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0)

  const centerPointX = canvas.width / 2
  const centerPointY = canvas.height / 2

  const PERCENTAGE_OF_OVAL_START_X = 1.53
  const PERCENTAGE_OF_OVAL_START_Y = 1.35
  const PERCENTAGE_OF_OVAL_END_X = 0.57
  const PERCENTAGE_OF_OVAL_END_Y = 0.65
  /*
   * finding the length of the line from the start of the oval to the end of the oval
  **/
  const containerStartXPoint = (centerPointX - (ovalFaceImage.width / 2)) * PERCENTAGE_OF_OVAL_START_X

  const containerStartYPoint = (centerPointY - (ovalFaceImage.height / 2)) * PERCENTAGE_OF_OVAL_START_Y
  const containerStartPoints = new Point(containerStartXPoint, containerStartYPoint)

  const containerEndXPoint = (centerPointX + (ovalFaceImage.width / 2)) * PERCENTAGE_OF_OVAL_END_X
  const containerEndYPoint = (centerPointY + (ovalFaceImage.height / 2)) * PERCENTAGE_OF_OVAL_END_Y
  const containerEndPoints = new Point(containerEndXPoint, containerEndYPoint)

  diagonalSize = containerStartPoints.distanceTo(containerEndPoints)

  imageData = ctx.getImageData(containerStartXPoint, containerStartYPoint,
    ovalFaceImage.width * PERCENTAGE_OF_OVAL_END_X,
    ovalFaceImage.height * PERCENTAGE_OF_OVAL_END_Y)

  const imageDataForLight = ctx.getImageData(0, 0, canvas.width, canvas.height)

  const data = imageDataForLight.data
  let r, g, b, maxRGB
  let light = 0
  let dark = 0

  for (let x = 0, len = data.length; x < len; x += 4) {
    r = data[x]
    g = data[x + 1]
    b = data[x + 2]

    maxRGB = Math.max(Math.max(r, g), b)
    if (maxRGB < 128) {
      dark++
    } else {
      light++
    }
  }

  const dlDiff = ((light - dark) / (video.videoWidth * video.videoHeight))

  if (dlDiff + fuzzy < 0) {
    return true /* Dark. */
  } else {
    return false /* Not dark. */
  }
}

async function startCamera () {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  })
  video.srcObject = stream
}

calculateImagePd.addEventListener('click', () => {
  loaderImage.style.display = 'flex'
  calculateImagePd.style.display = 'none'
  autoDraw(ctxImage, canvasForImage)
})

clickButton.addEventListener('click', function () {
  clickPhoto()
})

/**
 * It takes a photo of the user, hides the video, shows the canvas, and calls the autoDraw function
 */
async function clickPhoto () {
  videoImageDiv.style.display = 'none'
  canvas.style.display = 'block'
  resetAndCalculateButtonsDiv.style.display = 'flex'
  clickButton.style.display = 'none'
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)

  ctx = canvas.getContext('2d')
  ctx.save()
  ctx.scale(-1, 1)
  ctx.drawImage(video, canvas.width * -1, 0, canvas.width, canvas.height)
  ctx.restore()
  callAutoDraw()
  /*
  * Rotation according to the angle of the face
  */
  // const imageData = ctx.getImageData(0 , 0, canvas.width, canvas.height)
  // const faces = await model.estimateFaces({
  //   input: imageData
  // })

  // find angle between pupillary line and X-axis
  // const deltaX = faces[0].mesh[474][0] - faces[0].mesh[471][0]
  // const deltaY = faces[0].mesh[474][1] - faces[0].mesh[471][1]

  // Slope of line formula
  // let angle = Math.atan(deltaY / deltaX)

  // Converting radians to degrees
  // angle = (angle * 180) / Math.PI

  // console.log(faces[0].mesh[6])
  // console.log(faces[0].mesh[168])
  // ctx.translate(0, 0)
  // const yDelta = faces[0].mesh[168][1] - faces[0].mesh[6][1]
  // const xDelta = faces[0].mesh[168][0] - faces[0].mesh[6][0]
  // const angle = Math.atan2(yDelta, xDelta)

  // ctx.rotate(angle)
  // ctx.drawImage(video, canvas.width * -1, 0, canvas.width, canvas.height)
  // console.log(angle)
  // ctx.restore()
}

/* The above code is adding an event listener to the resetPhoto button. When the button is clicked, the
resetPhotoFunction and loopForVideoFunction are called. */
resetPhoto.addEventListener('click', function () {
  resetPhotoFunction()
  loopForVideoFunction()
})

/**
 * It resets the page to its original state.
 */
const resetPhotoFunction = () => {
  canvas.style.display = 'none'
  videoImageDiv.style.display = ''
  calculate.style.display = ''
  resetAndCalculateButtonsDiv.style.display = 'none'
  clickButton.style.display = 'block'
  pupilDistanceText.innerHTML = ''
}

calculateDistance.addEventListener('click', function () {
  callAutoDraw()
})

function callAutoDraw () {
  loader.style.display = 'flex'
  calculate.style.display = 'none'
  autoDraw(ctx, canvas)
}

// AUTO CALC PD METHODS START-----------------------------------------------

async function autoDraw (canvas, workingCanvas) {
  model = await loadFaceLandmarkDetectionModel()
  // Render Face Mesh Prediction
  renderPrediction(canvas, workingCanvas)
}

async function loadFaceLandmarkDetectionModel () {
  return faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh, {
      maxFaces: 1,
      staticImageMode: false
    }
  )
}

async function renderPrediction (ctx, workingCanvas) {
  const predictions = await model.estimateFaces({
    input: ctx.getImageData(0, 0, workingCanvas.width, workingCanvas.height)
  })
  if (predictions.length) {
    displayIrisPosition(predictions, ctx)
  } else {
    pupilDistanceText.innerHTML = '<h2>No Face Detected</h2>'
    loader.style.display = 'none'
    loaderImage.style.display = 'none'
  }
}

/**
 * It takes the predictions from the model and draws a rectangle around the iris of the eye
 * @param predictions () - The predictions returned by the model.
 * @param ctx () - The canvas context
 *
 * Generated on 08/19/2022
 */
function displayIrisPosition (predictions, ctx) {
  ctx.strokeStyle = 'red'
  if (predictions.length > 0) {
    predictions.forEach((prediction) => {
      const keyPoints = prediction.scaledMesh
      if (keyPoints.length === 478) {
        for (let i = 468; i < 478; i++) {
          const x = keyPoints[i][0]
          const y = keyPoints[i][1]
          ctx.beginPath()
          ctx.rect(x, y, 2, 2)
          ctx.stroke()
        }

        const midXFrom2Points = (keyPoints[193][0] + keyPoints[417][0]) / 2
        const midXMidPointWithEyeMidPoint = (midXFrom2Points + (keyPoints[468][0] + keyPoints[473][0]) / 2) / 2
        const midXOf2PointsAndMidPoint = (midXFrom2Points + midXMidPointWithEyeMidPoint) / 2

        const midY = ((keyPoints[473][1] + keyPoints[468][1]) / 2)

        const leftEyeCenterX = keyPoints[468][0]
        const leftEyeCenterY = keyPoints[468][1]

        const rightEyeCenterX = keyPoints[473][0]
        const rightEyeCenterY = keyPoints[473][1]

        const leftEyePoint = new Point(leftEyeCenterX, leftEyeCenterY)
        const rightEyePoint = new Point(rightEyeCenterX, rightEyeCenterY)

        const distanceFrom2PointsLeft = leftEyePoint.distanceTo(new Point(midXFrom2Points, midY))
        const distanceFrom2PointsRight = rightEyePoint.distanceTo(new Point(midXFrom2Points, midY))

        const distanceFromMidPointLeft = leftEyePoint.distanceTo(new Point(midXMidPointWithEyeMidPoint, midY))
        const distanceFromMidPointRight = rightEyePoint.distanceTo(new Point(midXMidPointWithEyeMidPoint, midY))

        const distanceFrom2PointsAndMidPointLeft = leftEyePoint.distanceTo(new Point(midXOf2PointsAndMidPoint, midY))
        const distanceFrom2PointsAndMidPointRight = rightEyePoint.distanceTo(new Point(midXOf2PointsAndMidPoint, midY))

        const absDiff2Points = Math.abs(distanceFrom2PointsLeft - distanceFrom2PointsRight)
        console.log('🎮🌴 ~ predictions.forEach ~ absDiff2Points', absDiff2Points)
        const absDiffMidPoint = Math.abs(distanceFromMidPointLeft - distanceFromMidPointRight)
        console.log('🎮🌴 ~ predictions.forEach ~ absDiffMidPoint', absDiffMidPoint)
        const absDiff2PointsAndMidPoint = Math.abs(distanceFrom2PointsAndMidPointLeft - distanceFrom2PointsAndMidPointRight)
        console.log('🎮🌴 ~ predictions.forEach ~ absDiff2PointsAndMidPoint', absDiff2PointsAndMidPoint)

        const midX = (absDiff2Points < absDiffMidPoint && absDiff2Points < absDiff2PointsAndMidPoint)
          ? midXFrom2Points
          : (absDiffMidPoint < absDiff2PointsAndMidPoint) ? midXMidPointWithEyeMidPoint : midXOf2PointsAndMidPoint

        const pupilDistance = leftEyePoint.distanceTo(rightEyePoint)

        console.log('🎮🌴 ~ predictions.forEach ~ pupilDistance', pupilDistance)

        ctx.lineWidth = 3
        ctx.strokeStyle = 'green'
        ctx.beginPath()
        ctx.moveTo(leftEyeCenterX, leftEyeCenterY)
        ctx.lineTo(midX, midY)
        ctx.stroke()

        ctx.strokeStyle = 'blue'
        ctx.beginPath()
        ctx.moveTo(rightEyeCenterX, rightEyeCenterY)
        ctx.lineTo(midX, midY)
        ctx.stroke()

        const midPoint = new Point(midX, midY)
        const leftEyePdInDistance = midPoint.distanceTo(leftEyePoint)
        console.log('🎮🌴 ~ predictions.forEach ~ leftEyePdInDistance', leftEyePdInDistance)
        const rightEyePdInDistance = midPoint.distanceTo(rightEyePoint)
        console.log('🎮🌴 ~ predictions.forEach ~ rightEyePdInDistance', rightEyePdInDistance)

        // iris left
        const xLeft = keyPoints[474][0]
        const yLeft = keyPoints[474][1]
        const xRight = keyPoints[476][0]
        const yRight = keyPoints[476][1]

        // iris right
        const xLeft2 = keyPoints[471][0]
        const yLeft2 = keyPoints[471][1]
        const xRight2 = keyPoints[469][0]
        const yRight2 = keyPoints[469][1]

        const left = new Point(xLeft, yLeft)
        const right = new Point(xRight, yRight)

        const left2 = new Point(xLeft2, yLeft2)
        const right2 = new Point(xRight2, yRight2)

        const irisDiameterLeft = left.distanceTo(right)
        const irisDiameterRight = left2.distanceTo(right2)

        const irisWidth = (irisDiameterLeft + irisDiameterRight) / 2

        const LeftEyePD = (11.7 / irisWidth) * leftEyePdInDistance
        const RightEyePD = (11.7 / irisWidth) * rightEyePdInDistance
        // const pd = (11.7 / irisWidth) * pupilDistance
        loader.style.display = 'none'
        loaderImage.style.display = 'none'
        const leftRoundedPD = roundToNearest50(LeftEyePD * 100) / 100
        const rightRoundedPD = roundToNearest50(RightEyePD * 100) / 100

        pupilDistanceText.innerHTML = '<h2>Your Pupil Distance is approximately ' +
                                      (leftRoundedPD + rightRoundedPD) + 'mm</h2>' +
                                      '<h3>Your Left Eye Monocular PD is approximately ' +
                                      leftRoundedPD + 'mm</h3>' +
                                      '<h3>Your Right Eye Monocular PD is approximately ' +
                                      rightRoundedPD + 'mm</h3>'
      }
    })
  }
}

/**
 * Round the number to the nearest 50.
 * @param num () - The number to round
 *
 * Generated on 08/19/2022
 */
const roundToNearest50 = (num) => Math.round(num / 50) * 50

/* A point is a thing that has an x and a y coordinate, and can calculate its distance to another
point. */
class Point {
  constructor (x, y) {
    this.x = x
    this.y = y
    /* A function that calculates the distance between two points. */
    this.distanceTo = function (point) {
      const distance = Math.sqrt(
        Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2)
      )
      return distance
    }
  }
}
