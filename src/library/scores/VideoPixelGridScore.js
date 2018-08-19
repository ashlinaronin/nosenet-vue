import { startNote, endNote, changeParam } from "../sounds/synthManager";
import { drawTriangle, generateTrianglePoints } from "./noseHelpers";
import {
  MIN_DISTANCE_TO_PLAY,
  FRAMES_BEFORE_MOVEMENT_DECLARED_OVER,
  NOSE_TRIANGLE_RADIUS,
  NOSE_TRIANGLE_COLOR
} from "../constants";

export default class VideoPixelGridScore {
  constructor(scoreResolution) {
    this.width = scoreResolution;
    this.height = scoreResolution;
    this.grid = this.generateScore();
    this.isPlaying = false;
    this.lastPosition = undefined;
    this.framesSinceLastMovement = 0;
  }

  generateScore() {
    const grid = [];

    for (let i = 0; i < this.width; i++) {
      grid[i] = [];
      for (let j = 0; j < this.height; j++) {
        grid[i][j] = Math.random() >= 0.5;
      }
    }

    return grid;
  }

  isClear() {
    return !this.grid.some(row => row.some(col => col === true));
  }

  drawScore(ctx, videoWidth, videoHeight) {
    const widthUnit = videoWidth / this.width;
    const heightUnit = videoHeight / this.height;

    ctx.fillStyle = "black";
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[0].length; j++) {
        if (this.grid[i][j] === true) {
          ctx.fillRect(widthUnit * i, heightUnit * j, widthUnit, heightUnit);
        }
      }
    }
  }

  handleNoPoseDetected() {
    this.framesSinceLastMovement = this.framesSinceLastMovement + 1;
    this.checkForShouldEndNote();
  }

  handlePoseDetected(
    keypoints,
    minPartConfidence,
    ctx,
    videoWidth,
    videoHeight
  ) {
    this.checkForShouldEndNote();

    for (let i = 0; i < keypoints.length; i++) {
      const keypoint = keypoints[i];

      if (keypoint.score < minPartConfidence) {
        continue;
      }

      const { y, x } = keypoint.position;

      if (keypoint.part === "nose") {
        const trianglePoints = generateTrianglePoints(
          x,
          y,
          NOSE_TRIANGLE_RADIUS
        );
        this.checkForInGrid(trianglePoints, videoWidth, videoHeight);
        drawTriangle(ctx, trianglePoints, NOSE_TRIANGLE_COLOR);

        if (typeof this.lastPosition === "undefined") {
          this.lastPosition = [x, y];
        }

        changeParam(x, y, videoWidth, videoHeight);
        this.framesSinceLastMovement = this.framesSinceLastMovement + 1;

        if (
          Math.abs(this.lastPosition[0] - x) > MIN_DISTANCE_TO_PLAY ||
          Math.abs(this.lastPosition[1] - y) > MIN_DISTANCE_TO_PLAY
        ) {
          this.framesSinceLastMovement = 0;

          if (!this.isPlaying) {
            startNote();
            this.isPlaying = true;
          }

          this.lastPosition = [x, y];
        }
      }
    }
  }

  checkForInGrid(trianglePoints, videoWidth, videoHeight) {
    let anyTrianglePointInGrid = false;

    trianglePoints.forEach(trianglePoint => {
      const [pointX, pointY] = trianglePoint;

      const gridCoordinates = this.getGridCoordinatesForPoint(
        pointX,
        pointY,
        videoWidth,
        videoHeight
      );
      const containsPoint = this.gridContainsPoint(gridCoordinates);

      if (containsPoint) {
        anyTrianglePointInGrid = true;
        this.removePointFromGrid(gridCoordinates);
      }
    });

    return anyTrianglePointInGrid;
  }

  getGridCoordinatesForPoint(x, y, videoWidth, videoHeight) {
    const widthUnit = videoWidth / this.width; // # rows
    const heightUnit = videoHeight / this.height; // # cols

    let gridXCoord = Math.floor(x / widthUnit);
    let gridYCoord = Math.floor(y / heightUnit);

    // Account for edges of camera window
    if (gridXCoord >= this.width) {
      gridXCoord = this.width - 1;
    }

    if (gridYCoord >= this.height) {
      gridYCoord = this.height - 1;
    }

    if (gridXCoord <= 0) {
      gridXCoord = 0;
    }

    if (gridYCoord <= 0) {
      gridYCoord = 0;
    }

    return [gridXCoord, gridYCoord];
  }

  removePointFromGrid(gridPointCoords) {
    const [gridXCoord, gridYCoord] = gridPointCoords;
    this.grid[gridXCoord][gridYCoord] = false;
  }

  gridContainsPoint(gridPointCoords) {
    const [gridXCoord, gridYCoord] = gridPointCoords;
    return this.grid[gridXCoord][gridYCoord] === true;
  }

  checkForShouldEndNote() {
    if (this.framesSinceLastMovement > FRAMES_BEFORE_MOVEMENT_DECLARED_OVER) {
      if (this.isPlaying) {
        endNote();
        this.isPlaying = false;
      }
    }
  }
}
