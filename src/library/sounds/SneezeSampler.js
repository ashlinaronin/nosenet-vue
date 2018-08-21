import Tone from "tone";
import mapRange from "../mapRange";
import sneeze from "../../assets/147827__dshogan__sneeze_cut.wav";

export default class SneezeSampler {
  constructor() {
    this.grainPlayer = new Tone.GrainPlayer(sneeze, () => {
      this.initialize();
    });
    this.env = new Tone.AmplitudeEnvelope();
  }

  async initialize() {
    this.grainPlayer.start();
    this.grainPlayer.connect(this.env);
    this.env.toMaster();
  }

  dispose() {
    this.grainPlayer.dispose();
    this.env.dispose();
  }

  startNote() {
    this.env.triggerAttack("+0.05", 0.8);
  }

  endNote() {
    this.env.triggerRelease("+0.05");
  }

  changeParam(x, y, width, height) {
    this.grainPlayer.grainSize = mapRange(x, 0, width, 0, 1.0);
    this.grainPlayer.playbackRate = mapRange(x, 0, width, 0.0, 2.0);
    this.grainPlayer.detune = mapRange(y, 0, height, 50.0, -50.0);
  }
}
