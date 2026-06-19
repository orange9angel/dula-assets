import * as THREE from 'three';
import { CameraMoveBase, CameraCollisionGuard } from 'dula-engine';
import { parseVecOption } from '../utils.js';

/**
 * Static shot with optional explicit position and lookAt.
 * If no position is given, the camera stays where it is.
 */
export class Static extends CameraMoveBase {
  constructor(options = {}) {
    super(options);
    this.position = parseVecOption(options.position);
    this.lookAt = parseVecOption(options.lookAt);
  }

  _apply(camera, context) {
    if (this.position) {
      camera.position.copy(this.position);
      // Resolve clipping against characters and scene geometry
      if (context) {
        CameraCollisionGuard.resolve(camera.position, context, { margin: 0.4 });
      } else {
        // Clamp camera above ground
        camera.position.y = Math.max(0.5, camera.position.y);
      }
    }
    if (this.lookAt) {
      camera.lookAt(this.lookAt);
    }
  }

  start(camera, context) {
    super.start(camera, context);
    this._apply(camera, context);
  }

  update(t, camera, context) {
    this._apply(camera, context);
  }
}
