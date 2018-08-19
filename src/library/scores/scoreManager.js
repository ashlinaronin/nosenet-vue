import VideoPixelGridScore from "./VideoPixelGridScore";
// import BlackPixelGridScore from "./BlackPixelGridScore";
import { SCORE_RESOLUTION } from "../constants";

const scoreLevelMap = {
  0: VideoPixelGridScore
  // 1: BlackPixelGridScore
};

let score;

changeLevel(0);

export function changeLevel(level) {
  const scoreType = scoreLevelMap.hasOwnProperty(level)
    ? scoreLevelMap[level]
    : scoreLevelMap[0];
  score = new scoreType(SCORE_RESOLUTION);
}

export function drawScore(ctx, videoWidth, videoHeight) {
  return score.drawScore(ctx, videoWidth, videoHeight);
}

export function handlePoseDetected(
  keypoints,
  minPartConfidence,
  ctx,
  videoWidth,
  videoHeight
) {
  return score.handlePoseDetected(
    keypoints,
    minPartConfidence,
    ctx,
    videoWidth,
    videoHeight
  );
}

export function handleNoPoseDetected() {
  return score.handleNoPoseDetected();
}

export function scoreIsClear() {
  return score.isClear();
}