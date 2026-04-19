// Characters
import { Doraemon } from './characters/Doraemon.js';
import { Nobita } from './characters/Nobita.js';
import { Shizuka } from './characters/Shizuka.js';

// Animations - common
import { Bow } from './animations/common/Bow.js';
import { Celebrate } from './animations/common/Celebrate.js';
import { ClapHands } from './animations/common/ClapHands.js';
import { CrossArms } from './animations/common/CrossArms.js';
import { FlailArms } from './animations/common/FlailArms.js';
import { LookUp } from './animations/common/LookUp.js';
import { ReachOut } from './animations/common/ReachOut.js';
import { HandsOnHips } from './animations/common/HandsOnHips.js';
import { Jump } from './animations/common/Jump.js';
import { LookAround } from './animations/common/LookAround.js';
import { Nod } from './animations/common/Nod.js';
import { PointForward } from './animations/common/PointForward.js';
import { Run } from './animations/common/Run.js';
import { ScratchHead } from './animations/common/ScratchHead.js';
import { ShakeHead } from './animations/common/ShakeHead.js';
import { Shrug } from './animations/common/Shrug.js';
import { SitDown } from './animations/common/SitDown.js';
import { StompFoot } from './animations/common/StompFoot.js';
import { SurprisedJump } from './animations/common/SurprisedJump.js';
import { SwayBody } from './animations/common/SwayBody.js';
import { SwingRacket } from './animations/common/SwingRacket.js';
import { Think } from './animations/common/Think.js';
import { Tremble } from './animations/common/Tremble.js';
import { TurnToCamera } from './animations/common/TurnToCamera.js';
import { Walk } from './animations/common/Walk.js';
import { WaveHand } from './animations/common/WaveHand.js';
// Animations - doraemon
import { Float } from './animations/doraemon/Float.js';
import { NoseBlink } from './animations/doraemon/NoseBlink.js';
import { PanicSpin } from './animations/doraemon/PanicSpin.js';
import { ReachHand } from './animations/doraemon/ReachHand.js';
import { PullOutRacket } from './animations/doraemon/PullOutRacket.js';
import { Spin } from './animations/doraemon/Spin.js';
import { TakeOutFromPocket } from './animations/doraemon/TakeOutFromPocket.js';
import { WaddleWalk } from './animations/doraemon/WaddleWalk.js';
// Animations - nobita
import { CrashLand } from './animations/nobita/CrashLand.js';
import { Cry } from './animations/nobita/Cry.js';
import { FallPanic } from './animations/nobita/FallPanic.js';
import { FlyPose } from './animations/nobita/FlyPose.js';
import { Grovel } from './animations/nobita/Grovel.js';
import { LazyStretch } from './animations/nobita/LazyStretch.js';
import { RunAway } from './animations/nobita/RunAway.js';
import { StudyDespair } from './animations/nobita/StudyDespair.js';
import { TriumphPose } from './animations/nobita/TriumphPose.js';
// Animations - shizuka
import { Baking } from './animations/shizuka/Baking.js';
import { Blush } from './animations/shizuka/Blush.js';
import { Curtsy } from './animations/shizuka/Curtsy.js';
import { Giggle } from './animations/shizuka/Giggle.js';
import { PlayViolin } from './animations/shizuka/PlayViolin.js';
import { LookUpSky } from './animations/shizuka/LookUpSky.js';
import { Scold } from './animations/shizuka/Scold.js';
import { WaveUp } from './animations/shizuka/WaveUp.js';

// Scenes
import { ParkScene } from './scenes/ParkScene.js';
import { RoomScene } from './scenes/RoomScene.js';
import { SkyScene } from './scenes/SkyScene.js';

// Camera moves
import { CloseUp } from './camera/common/CloseUp.js';
import { FollowCharacter } from './camera/common/FollowCharacter.js';
import { LowAngle } from './camera/common/LowAngle.js';
import { Orbit } from './camera/common/Orbit.js';
import { OverShoulder } from './camera/common/OverShoulder.js';
import { Pan } from './camera/common/Pan.js';
import { ReactionShot } from './camera/common/ReactionShot.js';
import { Shake } from './camera/common/Shake.js';
import { Static } from './camera/common/Static.js';
import { TrackingCloseUp } from './camera/common/TrackingCloseUp.js';
import { TwoShot } from './camera/common/TwoShot.js';
import { WhipPan } from './camera/common/WhipPan.js';
import { ZoomIn } from './camera/common/ZoomIn.js';
import { ZoomOut } from './camera/common/ZoomOut.js';

// Voices
import { default as DoraemonVoice } from './voices/DoraemonVoice.js';
import { default as NobitaVoice } from './voices/NobitaVoice.js';
import { default as ShizukaVoice } from './voices/ShizukaVoice.js';

import {
  registerCharacter,
  registerAnimation,
  registerScene,
  registerCameraMove,
  registerVoice,
  registerDirector,
} from 'dula-engine';

import { CourtDirector } from './lib/CourtDirector.js';

export function registerAll() {
  // Characters
  registerCharacter('Doraemon', Doraemon);
  registerCharacter('Nobita', Nobita);
  registerCharacter('Shizuka', Shizuka);
  // Animations - common
  registerAnimation('Bow', Bow);
  registerAnimation('Celebrate', Celebrate);
  registerAnimation('ClapHands', ClapHands);
  registerAnimation('CrashLand', CrashLand);
  registerAnimation('CrossArms', CrossArms);
  registerAnimation('HandsOnHips', HandsOnHips);
  registerAnimation('Jump', Jump);
  registerAnimation('LookAround', LookAround);
  registerAnimation('LookUp', LookUp);
  registerAnimation('LookUpSky', LookUpSky);
  registerAnimation('Nod', Nod);
  registerAnimation('PointForward', PointForward);
  registerAnimation('Run', Run);
  registerAnimation('ScratchHead', ScratchHead);
  registerAnimation('FallPanic', FallPanic);
  registerAnimation('FlailArms', FlailArms);
  registerAnimation('FlyPose', FlyPose);
  registerAnimation('ShakeHead', ShakeHead);
  registerAnimation('Shrug', Shrug);
  registerAnimation('SitDown', SitDown);
  registerAnimation('StompFoot', StompFoot);
  registerAnimation('SurprisedJump', SurprisedJump);
  registerAnimation('SwayBody', SwayBody);
  registerAnimation('SwingRacket', SwingRacket);
  registerAnimation('Think', Think);
  registerAnimation('Tremble', Tremble);
  registerAnimation('TurnToCamera', TurnToCamera);
  registerAnimation('Walk', Walk);
  registerAnimation('WaveHand', WaveHand);
  registerAnimation('WaveUp', WaveUp);
  // Animations - doraemon
  registerAnimation('Float', Float);
  registerAnimation('NoseBlink', NoseBlink);
  registerAnimation('PanicSpin', PanicSpin);
  registerAnimation('PullOutRacket', PullOutRacket);
  registerAnimation('ReachHand', ReachHand);
  registerAnimation('ReachOut', ReachOut);
  registerAnimation('Spin', Spin);
  registerAnimation('TakeOutFromPocket', TakeOutFromPocket);
  registerAnimation('WaddleWalk', WaddleWalk);
  // Animations - nobita
  registerAnimation('Cry', Cry);
  registerAnimation('Grovel', Grovel);
  registerAnimation('LazyStretch', LazyStretch);
  registerAnimation('RunAway', RunAway);
  registerAnimation('StudyDespair', StudyDespair);
  registerAnimation('TriumphPose', TriumphPose);
  // Animations - shizuka
  registerAnimation('Baking', Baking);
  registerAnimation('Blush', Blush);
  registerAnimation('Curtsy', Curtsy);
  registerAnimation('Giggle', Giggle);
  registerAnimation('LookUpSky', LookUpSky);
  registerAnimation('PlayViolin', PlayViolin);
  registerAnimation('Scold', Scold);
  registerAnimation('WaveUp', WaveUp);
  // Scenes
  registerScene('ParkScene', ParkScene);
  registerScene('RoomScene', RoomScene);
  registerScene('SkyScene', SkyScene);
  // Camera moves
  registerCameraMove('CloseUp', CloseUp);
  registerCameraMove('FollowCharacter', FollowCharacter);
  registerCameraMove('LowAngle', LowAngle);
  registerCameraMove('Orbit', Orbit);
  registerCameraMove('OverShoulder', OverShoulder);
  registerCameraMove('Pan', Pan);
  registerCameraMove('ReactionShot', ReactionShot);
  registerCameraMove('Shake', Shake);
  registerCameraMove('Static', Static);
  registerCameraMove('TrackingCloseUp', TrackingCloseUp);
  registerCameraMove('TwoShot', TwoShot);
  registerCameraMove('WhipPan', WhipPan);
  registerCameraMove('ZoomIn', ZoomIn);
  registerCameraMove('ZoomOut', ZoomOut);
  // Voices
  registerVoice('Doraemon', DoraemonVoice);
  registerVoice('Nobita', NobitaVoice);
  registerVoice('Shizuka', ShizukaVoice);

  // Directors
  registerDirector('CourtDirector', CourtDirector);
}