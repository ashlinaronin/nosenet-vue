import { SCORE_RESOLUTION, VIDEO_HEIGHT, VIDEO_WIDTH } from "../constants";
import GrassPixelGridScore from "./GrassPixelGridScore";
import WaterPixelGridScore from "./WaterPixelGridScore";
import FreezeFragmentSquareScore from "./FreezeFragmentSquareScore";
import VideoPixelGridScore from "./VideoPixelGridScore";
import BreathingPixelGridScore from "./BreathingPixelGridScore";
import WaterFromWhiteScore from "./WaterFromWhiteScore";

const scoreLevelMap = {
  1: VideoPixelGridScore,
  2: BreathingPixelGridScore,
  3: GrassPixelGridScore,
  4: WaterPixelGridScore
};

const scoreNameMap = {
  default: VideoPixelGridScore,
  "freeze-fragment-square": FreezeFragmentSquareScore,
  "water-from-white": WaterFromWhiteScore
};

let score;

changeLevel(1);

export function changeScoreByName(name) {
  if (typeof score !== "undefined" && typeof score.dispose === "function") {
    score.dispose();
  }

  const scoreType = scoreNameMap.hasOwnProperty(name)
    ? scoreNameMap[name]
    : scoreNameMap.default;
  score = new scoreType(SCORE_RESOLUTION, VIDEO_WIDTH, VIDEO_HEIGHT);
}

export function changeLevel(level) {
  if (typeof score !== "undefined" && typeof score.dispose === "function") {
    score.dispose();
  }

  const scoreType = scoreLevelMap.hasOwnProperty(level)
    ? scoreLevelMap[level]
    : scoreLevelMap[1];
  score = new scoreType(SCORE_RESOLUTION, VIDEO_WIDTH, VIDEO_HEIGHT);
}

export function drawScore(ctx, webcamVideo) {
  return score.drawScore(ctx, webcamVideo);
}

export function handlePoseDetected(
  keypoints,
  minPartConfidence,
  ctx,
  webcamVideo
) {
  return score.handlePoseDetected(
    keypoints,
    minPartConfidence,
    ctx,
    webcamVideo
  );
}

export function handleNoPoseDetected() {
  return score.handleNoPoseDetected();
}

export function scoreIsClear() {
  return score.isClear();
}
