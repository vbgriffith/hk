// ════════════════════════════════════════════════════════════
//  ManorExteriorScene — The driveway approach
// ════════════════════════════════════════════════════════════

class ManorExteriorScene extends BaseScene {
  constructor() { super({ key: 'ManorExteriorScene', sceneId: 'manor_exterior' }); }

  create() {
    const { W, H } = this.baseCreate();
    this.sceneId = 'manor_exterior';

    this.buildBackground(W, H);
    this.buildManor(W, H);
    this.buildForeground(W, H);
    this.buildHotspots(W, H);
    this.addExitZone('foyer', 'Approach the Door', W * 0.35, H * 0.55, W * 0.3, H * 0.25);
    this.addExitZone('carriage_house', 'Carriage House', W * 0.05, H * 0.65, W * 0.15, H * 0.2);

    // Announce location
    uiManager.showLocationBanner('manor_exterior');
  }

  buildBackground(W, H) {
    const bg = this.add.graphics();
    // Night sky gradient
    this.drawGradientSky(bg, W, H * 0.6, 0x06060e, 0x0d0c18);

    // Stars
    const stars = this.add.graphics();
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H * 0.5);
      const a = Phaser.Math.FloatBetween(0.08, 0.4);
      stars.fillStyle(0xc8c0a8, a);
      stars.fillCircle(x, y, Phaser.Math.FloatBetween(0.3, 1.3));
    }

    // Cloud suggestions — barely visible
    const clouds = this.add.graphics();
    clouds.fillStyle(0x0e0d18, 0.6);
    [[W * 0.1, H * 0.08, 140, 30], [W * 0.6, H * 0.12, 180, 25],
     [W * 0.35, H * 0.05, 120, 20]].forEach(([cx, cy, cw, ch]) => {
      clouds.fillEllipse(cx, cy, cw, ch);
    });

    // Ground
    const ground = this.add.graphics();
    ground.fillStyle(0x060502, 1);
    ground.fillRect(0, H * 0.62, W, H * 0.38);
    // Ground texture — wet gravel
    ground.fillStyle(0x0a0806, 0.5);
    ground.fillRect(0, H * 0.62, W, H * 0.05);

    // Lawn
    const lawn = this.add.graphics();
    lawn.fillStyle(0x060802, 0.8);
    lawn.fillRect(0, H * 0.65, W, H * 0.1);

    return { bg, ground, lawn };
  }

  buildManor(W, H) {
    // Silhouette layers for depth

    // Distant tree line
    const treeLine = this.add.graphics();
    treeLine.fillStyle(0x040302, 1);
    for (let tx = -20; tx < W + 60; tx += 28) {
      const th = Phaser.Math.Between(50, 120);
      const treeW = Phaser.Math.Between(20, 36);
      treeLine.fillTriangle(tx, H * 0.65, tx + treeW/2, H * 0.65 - th, tx + treeW, H * 0.65);
    }

    // Manor body — deep shadow
    const manorBg = this.add.graphics();
    manorBg.fillStyle(0x040302, 1);
    // Main block
    manorBg.fillRect(W * 0.27, H * 0.18, W * 0.46, H * 0.44);
    // West wing
    manorBg.fillRect(W * 0.11, H * 0.27, W * 0.18, H * 0.35);
    // East wing
    manorBg.fillRect(W * 0.71, H * 0.27, W * 0.18, H * 0.35);

    // Manor detail layer — slightly lighter edges for depth
    const manorDetail = this.add.graphics();
    manorDetail.lineStyle(1, 0x282010, 0.5);
    manorDetail.strokeRect(W * 0.27, H * 0.18, W * 0.46, H * 0.44);
    manorDetail.strokeRect(W * 0.11, H * 0.27, W * 0.18, H * 0.35);
    manorDetail.strokeRect(W * 0.71, H * 0.27, W * 0.18, H * 0.35);

    // Roof — main pointed
    const roofs = this.add.graphics();
    roofs.fillStyle(0x050402, 1);
    roofs.fillTriangle(W * 0.27, H * 0.18, W * 0.5, H * 0.03, W * 0.73, H * 0.18);
    // Tower roofs
    roofs.fillTriangle(W * 0.11, H * 0.27, W * 0.13, H * 0.18, W * 0.15, H * 0.27);
    roofs.fillTriangle(W * 0.85, H * 0.27, W * 0.87, H * 0.18, W * 0.89, H * 0.27);
    // Chimney stacks
    roofs.fillRect(W * 0.36, H * 0.02, W * 0.03, H * 0.17);
    roofs.fillRect(W * 0.61, H * 0.02, W * 0.03, H * 0.17);

    // Windows (ambient glow)
    const windowGlow = this.add.graphics();
    let wt = 0;

    const winPositions = [
      { x: W * 0.37, y: H * 0.27, w: 14, h: 18, bright: 0.3 },
      { x: W * 0.47, y: H * 0.27, w: 14, h: 18, bright: 0.3 },
      { x: W * 0.57, y: H * 0.27, w: 14, h: 18, bright: 0.3 },
      { x: W * 0.37, y: H * 0.40, w: 14, h: 18, bright: 0.3 },
      { x: W * 0.57, y: H * 0.40, w: 14, h: 18, bright: 0.25 },
      // Study window — key story window
      { x: W * 0.47, y: H * 0.40, w: 16, h: 20, bright: 0.5, isStudy: true },
      { x: W * 0.15, y: H * 0.34, w: 12, h: 16, bright: 0.2 },
      { x: W * 0.75, y: H * 0.34, w: 12, h: 16, bright: 0.35 },
    ];

    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        wt++;
        windowGlow.clear();
        winPositions.forEach((win, idx) => {
          const f = win.bright + Math.sin(wt * 0.04 + idx * 1.1) * (win.isStudy ? 0.15 : 0.08);
          windowGlow.fillStyle(0xd4a840, Math.max(0, f));
          windowGlow.fillRect(win.x, win.y, win.w, win.h);
          // Light cone from window
          windowGlow.fillStyle(0xd4a840, f * 0.04);
          windowGlow.fillTriangle(
            win.x, win.y + win.h,
            win.x + win.w, win.y + win.h,
            win.x + win.w + 30, win.y + win.h + 60
          );
          windowGlow.fillTriangle(
            win.x, win.y + win.h,
            win.x - 30, win.y + win.h + 60,
            win.x + win.w + 30, win.y + win.h + 60
          );
        });
      }
    });

    // Front door — slightly distinguishable
    const door = this.add.graphics();
    door.fillStyle(0x0a0806, 1);
    door.fillRect(W * 0.47, H * 0.52, W * 0.06, H * 0.1);
    door.lineStyle(1, 0x302010, 0.5);
    door.strokeRect(W * 0.47, H * 0.52, W * 0.06, H * 0.1);
    // Door knocker glint
    door.fillStyle(0x806030, 0.6);
    door.fillCircle(W * 0.5, H * 0.565, 2.5);

    return { manorBg, manorDetail, roofs, windowGlow, door };
  }

  buildForeground(W, H) {
    // Driveway
    const drive = this.add.graphics();
    drive.fillStyle(0x0e0c08, 0.8);
    drive.fillTriangle(
      W * 0.35, H,
      W * 0.65, H,
      W * 0.55, H * 0.62,
    );
    drive.fillTriangle(
      W * 0.35, H,
      W * 0.45, H * 0.62,
      W * 0.65, H,
    );
    // Drive edges
    drive.lineStyle(1, 0x302810, 0.3);
    drive.lineBetween(W * 0.45, H * 0.62, W * 0.35, H);
    drive.lineBetween(W * 0.55, H * 0.62, W * 0.65, H);

    // Fog at ground level
    const fog = this.add.graphics();
    fog.fillStyle(0x0a0c12, 0.35);
    fog.fillRect(0, H * 0.6, W, H * 0.1);

    // Foreground bushes / low shapes
    const shrubs = this.add.graphics();
    shrubs.fillStyle(0x040402, 1);
    [[W * 0.08, H * 0.72, 70, 20], [W * 0.18, H * 0.74, 50, 15],
     [W * 0.78, H * 0.72, 80, 22], [W * 0.88, H * 0.74, 45, 14]].forEach(([sx, sy, sw, sh]) => {
      shrubs.fillEllipse(sx, sy, sw, sh);
    });

    // Carriage house suggestion at left
    const ch = this.add.graphics();
    ch.fillStyle(0x050403, 1);
    ch.fillRect(W * 0.05, H * 0.58, W * 0.12, H * 0.1);
    ch.lineStyle(1, 0x201810, 0.3);
    ch.strokeRect(W * 0.05, H * 0.58, W * 0.12, H * 0.1);

    this.createRain(40);
    this.createDustMotes(8);

    return { drive, fog, shrubs };
  }

  buildHotspots(W, H) {
    // Tire tracks on driveway
    this.addHotspot(W * 0.4, H * 0.72, W * 0.2, H * 0.12, {
      id: 'tire_tracks',
      label: 'Examine Tracks',
      clueId: 'tire_tracks',
      dialogue: [
        'Fresh tire tracks in the gravel. Deep, precise impressions.',
        'High-performance tires — wide, low-profile. City car, not a truck.',
        'The tracks leave and return. Someone came back last night.',
        'I photograph them with my phone.'
      ]
    });

    // Front porch step (shed key location - after Dorothea reveals it)
    this.addHotspot(W * 0.46, H * 0.62, W * 0.08, H * 0.05, {
      id: 'porch_step',
      label: 'Check Porch Step',
      dialogue: ['Three stone steps. Old. Well-worn.']
    });

    // Manor sign / entrance
    this.addHotspot(W * 0.44, H * 0.48, W * 0.12, H * 0.08, {
      id: 'manor_entrance',
      label: 'Approach',
      dialogue: [
        'Ashwood Manor.',
        'The brass knocker is a hawk mid-dive.',
        'I count the steps. Old habit. Three.'
      ]
    });
  }
}
