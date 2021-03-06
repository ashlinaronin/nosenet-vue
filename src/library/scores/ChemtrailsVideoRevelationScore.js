import { startNote, endNote, changeParam } from "../synths/synthManager";
import { drawManyCircles, drawMirroredVideo } from "./scoreHelpers";

import {
  MIN_DISTANCE_TO_PLAY,
  FRAMES_BEFORE_MOVEMENT_DECLARED_OVER,
  NOSE_KEYPOINT_INDEX
} from "../constants";

const NOSE_CIRCLE_RADIUS = 10;
const TOTAL_POINTS_BEFORE_NEXT_LEVEL = 200;

export default class ChemtrailsVideoRevelationScore {
  constructor(scoreWidth, scoreHeight, videoWidth, videoHeight) {
    this.currentColor = "#000";
    this.width = scoreWidth;
    this.height = scoreHeight;
    this.videoWidth = videoWidth;
    this.videoHeight = videoHeight;
    this.bigCircleRadius = this.videoWidth / 4;
    this.bigCircleX = this.videoWidth / 2;
    this.bigCircleY = this.videoHeight / 2;
    this.isPlaying = false;
    this.lastPosition = undefined;
    this.framesSinceLastMovement = 0;
    this.uniquePointCount = 0;
    this.pointsPlayed = [];
  }

  drawScore(ctx, webcamVideo) {
    ctx.clearRect(0, 0, this.videoWidth, this.videoHeight);
    ctx.globalCompositeOperation = "source-over";

    drawManyCircles(
      ctx,
      this.pointsPlayed,
      this.currentColor,
      NOSE_CIRCLE_RADIUS
    );

    ctx.globalCompositeOperation = "source-atop";

    drawMirroredVideo(ctx, webcamVideo, this.videoWidth, this.videoHeight);

    ctx.globalCompositeOperation = "source-over";
  }

  drawNose(ctx, x, y) {
    ctx.fillStyle = this.currentColor;
    ctx.beginPath();
    ctx.arc(x, y, NOSE_CIRCLE_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
  }

  handlePoseDetected(keypoints, minPartConfidence, ctx) {
    this.checkForShouldEndNote();
    const noseKeypoint = keypoints[NOSE_KEYPOINT_INDEX];
    if (noseKeypoint.score > minPartConfidence) {
      this.handleNoseFound(
        ctx,
        noseKeypoint.position.x,
        noseKeypoint.position.y
      );
    }
  }

  handleNoseFound(ctx, x, y) {
    this.drawNose(ctx, x, y);
    const collided = this.checkCollisions(x, y);

    if (typeof this.lastPosition === "undefined") {
      this.lastPosition = [x, y];
    }

    changeParam(x, y, this.videoWidth, this.videoHeight);
    this.framesSinceLastMovement = this.framesSinceLastMovement + 1;

    if (collided) {
      this.pointsPlayed.push([x, y]);
    }

    if (
      Math.abs(this.lastPosition[0] - x) > MIN_DISTANCE_TO_PLAY ||
      Math.abs(this.lastPosition[1] - y) > MIN_DISTANCE_TO_PLAY
    ) {
      this.framesSinceLastMovement = 0;

      if (!this.isPlaying && collided) {
        this.play();
      }

      this.lastPosition = [x, y];
    }
  }

  play() {
    this.isPlaying = true;
    this.uniquePointCount = this.uniquePointCount + 1;
    console.log("uniquePointCount", this.uniquePointCount);

    startNote();
  }

  checkCollisions(x, y) {
    const dx = this.bigCircleX - x;
    const dy = this.bigCircleY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < this.bigCircleRadius + NOSE_CIRCLE_RADIUS;
  }

  checkForShouldEndNote() {
    if (
      this.framesSinceLastMovement > FRAMES_BEFORE_MOVEMENT_DECLARED_OVER &&
      this.isPlaying
    ) {
      endNote();
      this.isPlaying = false;
    }
  }

  handleNoPoseDetected() {
    this.framesSinceLastMovement = this.framesSinceLastMovement + 1;
    this.checkForShouldEndNote();
  }

  isClear() {
    return this.uniquePointCount > TOTAL_POINTS_BEFORE_NEXT_LEVEL;
  }
}
