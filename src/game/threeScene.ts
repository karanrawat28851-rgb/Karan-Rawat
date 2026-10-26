import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { InteractiveStation } from '../types/game';

// Reusable math scratchpad (Zero GC in animation loop)
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();

export interface GameSceneCallbacks {
  onNearStation: (station: InteractiveStation | null) => void;
  onUpdateStats: (healthDelta: number, zoneRadius: number) => void;
}

export class SurvivalGameWorld {
  public container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;

  // Actors & Objects
  private playerGroup!: THREE.Group;
  private playerTorso!: THREE.Mesh;
  private leftArm!: THREE.Group;
  private rightArm!: THREE.Group;
  private leftLeg!: THREE.Group;
  private rightLeg!: THREE.Group;
  private beaconBeams: THREE.Mesh[] = [];

  // World Elements
  private interactiveMeshes: { station: InteractiveStation; group: THREE.Group; light?: THREE.PointLight }[] = [];
  private fireFlickerLights: THREE.PointLight[] = [];
  private flameParticles: THREE.Points[] = [];
  private rotorBlades: THREE.Mesh[] = [];
  private zoneRingMesh!: THREE.Mesh;
  public currentZoneRadius = 88;

  // State & Inputs
  public isPaused = false;
  public isTitleScreen = true;
  private keys: Record<string, boolean> = {};
  public playerPos = new THREE.Vector3(0, 0, 16);
  private playerVelocity = new THREE.Vector3();
  private playerRotation = 0;
  private animTime = 0;
  private frameId = 0;
  private lastTime = performance.now();
  private callbacks: GameSceneCallbacks;
  private isSoftwareGl = false;

  constructor(container: HTMLElement, callbacks: GameSceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.init();
  }

  private init() {
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b1120);
    this.scene.fog = new THREE.FogExp2(0x0b1120, 0.014);

    this.camera = new THREE.PerspectiveCamera(
      55,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      400
    );
    this.camera.position.set(0, 14, 28);

    // Studio Environment map
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Lighting rig
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.85);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.9);
    sunLight.position.set(40, 60, 30);
    sunLight.castShadow = !this.isSoftwareGl;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 180;
    const d = 55;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Build World
    this.buildTerrain();
    this.buildPlayer();
    this.buildInteractiveStations();
    this.buildHelicopterExtraction();
    this.buildHazardStormZone();

    this.setupInputs();
    window.addEventListener('resize', this.onResize);

    this.lastTime = performance.now();
    this.tick();
  }

  private buildTerrain() {
    const groundGeo = new THREE.PlaneGeometry(260, 260, 48, 48);
    groundGeo.rotateX(-Math.PI / 2);

    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const dist = Math.hypot(x, z);
      let h = 0;
      if (dist > 28) {
        h = Math.sin(x * 0.07) * Math.cos(z * 0.07) * 2.0 + (dist - 28) * 0.07;
      }
      pos.setY(i, h);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.85,
      metalness: 0.15,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = !this.isSoftwareGl;
    this.scene.add(ground);

    // Central Safe Zone Pad
    const platformGeo = new THREE.CylinderGeometry(15, 16, 0.4, 32);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.5,
      metalness: 0.5,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(0, 0.2, 0);
    platform.receiveShadow = true;
    this.scene.add(platform);

    // Decorative natural boulders
    const rockGeo = new THREE.DodecahedronGeometry(2.5, 1);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.9 });
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const r = 48 + (i % 5) * 8;
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(Math.cos(angle) * r, 1.3, Math.sin(angle) * r);
      rock.rotation.set(i * 0.5, i * 0.8, i * 0.2);
      const s = 0.9 + (i % 3) * 0.5;
      rock.scale.set(s, s * 1.5, s);
      rock.castShadow = !this.isSoftwareGl;
      rock.receiveShadow = true;
      this.scene.add(rock);
    }
  }

  private buildPlayer() {
    this.playerGroup = new THREE.Group();

    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant tactical blue
      roughness: 0.35,
      metalness: 0.65,
    });
    const orangeMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Free Fire orange hazard trim
      roughness: 0.3,
      metalness: 0.7,
    });
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.2,
    });
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.9,
    });

    // Torso
    const torsoGeo = new THREE.BoxGeometry(1.05, 1.35, 0.65);
    this.playerTorso = new THREE.Mesh(torsoGeo, armorMat);
    this.playerTorso.position.y = 1.65;
    this.playerTorso.castShadow = !this.isSoftwareGl;
    this.playerGroup.add(this.playerTorso);

    // Armor Plate
    const vestGeo = new THREE.BoxGeometry(0.85, 0.85, 0.25);
    const vest = new THREE.Mesh(vestGeo, orangeMat);
    vest.position.set(0, 0.05, 0.3);
    this.playerTorso.add(vest);

    // Tactical Gear Backpack
    const backpackGeo = new THREE.BoxGeometry(0.8, 0.95, 0.4);
    const backpack = new THREE.Mesh(backpackGeo, jointMat);
    backpack.position.set(0, 0.05, -0.45);
    this.playerTorso.add(backpack);

    // Helmet & Visor
    const headGeo = new THREE.BoxGeometry(0.58, 0.58, 0.58);
    const head = new THREE.Mesh(headGeo, armorMat);
    head.position.set(0, 2.6, 0);
    this.playerGroup.add(head);

    const visorGeo = new THREE.BoxGeometry(0.5, 0.22, 0.2);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.05, 0.26);
    head.add(visor);

    // Arms
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.72, 2.2, 0);
    const armGeo = new THREE.BoxGeometry(0.3, 1.05, 0.32);
    const leftArmMesh = new THREE.Mesh(armGeo, armorMat);
    leftArmMesh.position.y = -0.45;
    this.leftArm.add(leftArmMesh);
    this.playerGroup.add(this.leftArm);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.72, 2.2, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, armorMat);
    rightArmMesh.position.y = -0.45;
    this.rightArm.add(rightArmMesh);
    this.playerGroup.add(this.rightArm);

    // Legs
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.3, 1.0, 0);
    const legGeo = new THREE.BoxGeometry(0.35, 1.1, 0.38);
    const leftLegMesh = new THREE.Mesh(legGeo, jointMat);
    leftLegMesh.position.y = -0.5;
    this.leftLeg.add(leftLegMesh);
    this.playerGroup.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.3, 1.0, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, jointMat);
    rightLegMesh.position.y = -0.5;
    this.rightLeg.add(rightLegMesh);
    this.playerGroup.add(this.rightLeg);

    // Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(1.8, 1.8);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.y = 0.03;
    this.playerGroup.add(shadow);

    this.playerGroup.position.copy(this.playerPos);
    this.scene.add(this.playerGroup);
  }

  private buildInteractiveStations() {
    // 1. CODING LAB (North Sector: [0, 0, -22])
    const codingStation: InteractiveStation = {
      id: 'station-coding',
      type: 'CODING_LAB',
      position: [0, 0, -22],
      titleEn: 'Cyber Hacker & Coding Lab',
      titleHi: 'कोडिंग एवं साइबर लॉजिक स्टेशन',
      badgeEn: 'Tech & Logic',
      badgeHi: 'कोडिंग लॉजिक',
      completed: false,
      score: 0,
      hintEn: 'Press [E] to crack Drone Algorithm & Python Logic',
      hintHi: '[E] दबाएं: ड्रोन एल्गोरिदम व कोडिंग लॉजिक सीखें',
    };
    const codingGroup = new THREE.Group();
    codingGroup.position.set(...codingStation.position);

    // High tech server console
    const consoleGeo = new THREE.BoxGeometry(3.0, 2.5, 1.5);
    const consoleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const consoleMesh = new THREE.Mesh(consoleGeo, consoleMat);
    consoleMesh.position.y = 1.25;
    codingGroup.add(consoleMesh);

    // Glowing Hologram Ring
    const holoGeo = new THREE.TorusGeometry(1.6, 0.06, 16, 32);
    const holoMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const holoRing = new THREE.Mesh(holoGeo, holoMat);
    holoRing.position.set(0, 2.4, 0);
    holoRing.rotation.x = Math.PI / 3;
    codingGroup.add(holoRing);

    const codeBeam = this.createBeaconBeam(0x06b6d4);
    codeBeam.position.set(0, 10, 0);
    codingGroup.add(codeBeam);
    this.beaconBeams.push(codeBeam);

    this.scene.add(codingGroup);
    this.interactiveMeshes.push({ station: codingStation, group: codingGroup });

    // 2. FINANCIAL VAULT (East Sector: [24, 0, -6])
    const financeStation: InteractiveStation = {
      id: 'station-finance',
      type: 'FINANCE_VAULT',
      position: [24, 0, -6],
      titleEn: 'Financial Freedom & Money Vault',
      titleHi: 'वित्तीय साक्षरता एवं धन प्रबंधन',
      badgeEn: 'Money Skills',
      badgeHi: 'स्मार्ट फाइनेंस',
      completed: false,
      score: 0,
      hintEn: 'Press [E] for 50/30/20 Budgeting & Compound Wealth',
      hintHi: '[E] दबाएं: 50-30-20 बजट नियम व चक्रवृद्धि ब्याज सीखें',
    };
    const financeGroup = new THREE.Group();
    financeGroup.position.set(...financeStation.position);

    // Golden bank vault safe
    const vaultGeo = new THREE.BoxGeometry(2.6, 2.6, 2.6);
    const vaultMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.25 });
    const vault = new THREE.Mesh(vaultGeo, vaultMat);
    vault.position.y = 1.3;
    financeGroup.add(vault);

    // Floating gold coin emblem
    const coinGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.15, 24);
    coinGeo.rotateX(Math.PI / 2);
    const coinMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.95, roughness: 0.1 });
    const coin = new THREE.Mesh(coinGeo, coinMat);
    coin.position.set(0, 3.2, 0);
    financeGroup.add(coin);

    const financeBeam = this.createBeaconBeam(0xf59e0b);
    financeBeam.position.set(0, 10, 0);
    financeGroup.add(financeBeam);
    this.beaconBeams.push(financeBeam);

    this.scene.add(financeGroup);
    this.interactiveMeshes.push({ station: financeStation, group: financeGroup });

    // 3. LANGUAGE TOWER (West Sector: [-24, 0, -6])
    const languageStation: InteractiveStation = {
      id: 'station-language',
      type: 'LANGUAGE_TOWER',
      position: [-24, 0, -6],
      titleEn: 'Global Language & Fluency Tower',
      titleHi: 'वैश्विक भाषा एवं वोकैबुलरी टावर',
      badgeEn: 'Global Vocab',
      badgeHi: 'भाषा कौशल',
      completed: false,
      score: 0,
      hintEn: 'Press [E] to unlock High-Impact English & Career Words',
      hintHi: '[E] दबाएं: प्रभावशाली अंग्रेजी शब्द और वार्तालाप सीखें',
    };
    const languageGroup = new THREE.Group();
    languageGroup.position.set(...languageStation.position);

    // Antenna transmitter tower
    const towerGeo = new THREE.ConeGeometry(1.2, 4.2, 4);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, metalness: 0.7, roughness: 0.3 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 2.1;
    languageGroup.add(tower);

    // Floating linguistic satellite dish
    const dishGeo = new THREE.SphereGeometry(1.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xa78bfa, metalness: 0.8 });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(0, 4.2, 0);
    dish.rotation.x = -Math.PI / 4;
    languageGroup.add(dish);

    const languageBeam = this.createBeaconBeam(0x8b5cf6);
    languageBeam.position.set(0, 10, 0);
    languageGroup.add(languageBeam);
    this.beaconBeams.push(languageBeam);

    this.scene.add(languageGroup);
    this.interactiveMeshes.push({ station: languageStation, group: languageGroup });

    // 4. CPR EMERGENCY RESCUE POD (South Sector: [0, 0, 24])
    const cprStation: InteractiveStation = {
      id: 'station-cpr',
      type: 'CPR_STATION',
      position: [0, 0, 24],
      titleEn: 'Emergency CPR & Heart Saver Pod',
      titleHi: 'इमरजेंसी सी.पी.आर एवं हृदय रक्षक',
      badgeEn: 'Life Saver',
      badgeHi: 'जीवन रक्षा',
      completed: false,
      score: 0,
      hintEn: 'Press [E] for 100-120 BPM Hands-Only CPR & AED Test',
      hintHi: '[E] दबाएं: 100-120 BPM सी.पी.आर व AED का अभ्यास करें',
    };
    const cprGroup = new THREE.Group();
    cprGroup.position.set(...cprStation.position);

    // Medical triage pod
    const podGeo = new THREE.CylinderGeometry(2.2, 2.4, 2.0, 16);
    const podMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.3, roughness: 0.5 });
    const pod = new THREE.Mesh(podGeo, podMat);
    pod.position.y = 1.0;
    cprGroup.add(pod);

    // Medical cross badge
    const cross1Geo = new THREE.BoxGeometry(0.4, 1.4, 0.1);
    const crossMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const cross1 = new THREE.Mesh(cross1Geo, crossMat);
    cross1.position.set(0, 1.2, 2.42);
    cprGroup.add(cross1);

    const cross2Geo = new THREE.BoxGeometry(1.4, 0.4, 0.1);
    const cross2 = new THREE.Mesh(cross2Geo, crossMat);
    cross2.position.set(0, 1.2, 2.42);
    cprGroup.add(cross2);

    const cprBeam = this.createBeaconBeam(0xef4444);
    cprBeam.position.set(0, 10, 0);
    cprGroup.add(cprBeam);
    this.beaconBeams.push(cprBeam);

    this.scene.add(cprGroup);
    this.interactiveMeshes.push({ station: cprStation, group: cprGroup });

    // 5. FIRE HAZARD DEPOT (South-East Sector: [18, 0, 18])
    const fireStation: InteractiveStation = {
      id: 'station-fire',
      type: 'FIRE_HAZARD',
      position: [18, 0, 18],
      titleEn: 'Fire Hazard & P.A.S.S. Extinguisher Drill',
      titleHi: 'अग्नि सुरक्षा एवं P.A.S.S. ड्रिल',
      badgeEn: 'Fire Master',
      badgeHi: 'अग्नि सुरक्षा',
      completed: false,
      score: 0,
      hintEn: 'Press [E] to master P.A.S.S. Extinguisher & smoke crawl',
      hintHi: '[E] दबाएं: P.A.S.S. तकनीक से आग बुझाने का अभ्यास करें',
    };
    const fireGroup = new THREE.Group();
    fireGroup.position.set(...fireStation.position);

    // Burning barrel & extinguisher rack
    const barrelGeo = new THREE.CylinderGeometry(0.9, 0.9, 1.8, 16);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.6 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.position.set(0, 0.9, 0);
    fireGroup.add(barrel);

    // Extinguisher canister prop
    const extGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.1, 12);
    const extMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.8, roughness: 0.2 });
    const ext = new THREE.Mesh(extGeo, extMat);
    ext.position.set(1.4, 0.55, 0);
    fireGroup.add(ext);

    // Animated flame particles
    const pGeo = new THREE.BufferGeometry();
    const pCount = 50;
    const pCoords = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pCoords[i * 3] = (Math.random() - 0.5) * 1.8;
      pCoords[i * 3 + 1] = 0.8 + Math.random() * 2.2;
      pCoords[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pCoords, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xff7700,
      size: 0.55,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const flameMesh = new THREE.Points(pGeo, pMat);
    fireGroup.add(flameMesh);
    this.flameParticles.push(flameMesh);

    const fireLight = new THREE.PointLight(0xff5500, 2.2, 16);
    fireLight.position.set(0, 2, 0);
    fireGroup.add(fireLight);
    this.fireFlickerLights.push(fireLight);

    const fireBeam = this.createBeaconBeam(0xff6600);
    fireBeam.position.set(0, 10, 0);
    fireGroup.add(fireBeam);
    this.beaconBeams.push(fireBeam);

    this.scene.add(fireGroup);
    this.interactiveMeshes.push({ station: fireStation, group: fireGroup, light: fireLight });

    // 6. AIRDROP CRATE (South-West Sector: [-18, 0, 18])
    const airdropStation: InteractiveStation = {
      id: 'station-airdrop',
      type: 'AIRDROP_CRATE',
      position: [-18, 0, 18],
      titleEn: 'Legendary Life-Skills Airdrop Crate',
      titleHi: 'महा-स्किल एयरड्रॉप क्रेट',
      badgeEn: 'Mega Loot',
      badgeHi: 'महा लूट',
      completed: false,
      score: 0,
      hintEn: 'Press [E] to claim Master Life Skill Rewards & Go-Bag',
      hintHi: '[E] दबाएं: सर्वाइवल गो-बैग व बोनस ज्ञान प्राप्त करें',
    };
    const crateGroup = new THREE.Group();
    crateGroup.position.set(...airdropStation.position);

    const crateGeo = new THREE.BoxGeometry(2.2, 1.8, 2.2);
    const crateMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.6 });
    const crate = new THREE.Mesh(crateGeo, crateMat);
    crate.position.y = 0.9;
    crateGroup.add(crate);

    const chuteGeo = new THREE.ConeGeometry(1.6, 0.6, 8);
    const chuteMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.8 });
    const chute = new THREE.Mesh(chuteGeo, chuteMat);
    chute.position.set(0, 2.0, 0);
    crateGroup.add(chute);

    const airdropBeam = this.createBeaconBeam(0x10b981);
    airdropBeam.position.set(0, 10, 0);
    crateGroup.add(airdropBeam);
    this.beaconBeams.push(airdropBeam);

    this.scene.add(crateGroup);
    this.interactiveMeshes.push({ station: airdropStation, group: crateGroup });
  }

  private createBeaconBeam(color: number): THREE.Mesh {
    const beamGeo = new THREE.CylinderGeometry(0.25, 0.45, 26, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    return new THREE.Mesh(beamGeo, beamMat);
  }

  private buildHelicopterExtraction() {
    const heliGroup = new THREE.Group();
    heliGroup.position.set(0, 0.2, 0);

    const fuseGeo = new THREE.BoxGeometry(2.8, 1.8, 6.2);
    const fuseMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.7 });
    const fuse = new THREE.Mesh(fuseGeo, fuseMat);
    fuse.position.y = 1.6;
    heliGroup.add(fuse);

    const glassGeo = new THREE.BoxGeometry(2.4, 1.2, 1.8);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75,
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, 1.8, 2.3);
    heliGroup.add(glass);

    const rotorBladeGeo = new THREE.BoxGeometry(0.5, 0.08, 9.6);
    const rotorBladeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const mainRotor = new THREE.Mesh(rotorBladeGeo, rotorBladeMat);
    mainRotor.position.set(0, 2.7, 0);
    heliGroup.add(mainRotor);
    this.rotorBlades.push(mainRotor);

    this.scene.add(heliGroup);
  }

  private buildHazardStormZone() {
    const ringGeo = new THREE.RingGeometry(this.currentZoneRadius - 0.8, this.currentZoneRadius, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    this.zoneRingMesh = new THREE.Mesh(ringGeo, ringMat);
    this.zoneRingMesh.position.y = 0.3;
    this.scene.add(this.zoneRingMesh);
  }

  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      this.keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      this.keys[e.code] = false;
    });
    window.addEventListener('blur', () => {
      this.keys = {};
    });
  }

  public markStationCompleted(stationId: string, score: number) {
    const item = this.interactiveMeshes.find((m) => m.station.id === stationId);
    if (item) {
      item.station.completed = true;
      item.station.score = score;
      item.group.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
          child.material.color.setHex(0x10b981);
        }
      });
      if (item.light) {
        item.light.color.setHex(0x10b981);
      }
    }
  }

  public getNearestStation(): InteractiveStation | null {
    let nearest: InteractiveStation | null = null;
    let minDist = 7.0;

    for (const item of this.interactiveMeshes) {
      _v1.set(...item.station.position);
      const d = this.playerPos.distanceTo(_v1);
      if (d < minDist) {
        minDist = d;
        nearest = item.station;
      }
    }
    return nearest;
  }

  public teleportToStation(type: string) {
    const item = this.interactiveMeshes.find((m) => m.station.type === type);
    if (item) {
      this.playerPos.set(item.station.position[0], 0, item.station.position[2] + 4);
      this.playerGroup.position.copy(this.playerPos);
    }
  }

  public triggerScannerPulse() {
    this.beaconBeams.forEach((b) => {
      b.scale.set(1.9, 1.25, 1.9);
      setTimeout(() => {
        b.scale.set(1, 1, 1);
      }, 350);
    });
  }

  private onResize = () => {
    if (!this.container || !this.renderer) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private tick = () => {
    const now = performance.now();
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const dt = Math.min(rawDt, 0.05);

    this.update(dt);
    this.render();

    this.frameId = requestAnimationFrame(this.tick);
  };

  private update(dt: number) {
    this.animTime += dt;

    // Spin rotors
    this.rotorBlades.forEach((r) => {
      r.rotation.y += dt * 8.0;
    });

    // Flickering fire lights
    this.fireFlickerLights.forEach((light, i) => {
      light.intensity = 2.0 + Math.sin(this.animTime * 12 + i) * 0.8;
    });

    // Animated flame particles
    this.flameParticles.forEach((pts) => {
      const posAttr = pts.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) + dt * 2.5;
        if (y > 3.4) {
          y = 0.5 + Math.random() * 0.4;
        }
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    });

    // Animate beacon beams
    this.beaconBeams.forEach((b, i) => {
      b.rotation.y += dt * 0.8;
      const pulse = 0.4 + Math.sin(this.animTime * 3 + i) * 0.15;
      if (b.material instanceof THREE.MeshBasicMaterial) {
        b.material.opacity = pulse;
      }
    });

    if (this.isTitleScreen) {
      const orbitR = 38;
      const speed = 0.25;
      this.camera.position.x = Math.sin(this.animTime * speed) * orbitR;
      this.camera.position.z = Math.cos(this.animTime * speed) * orbitR;
      this.camera.position.y = 18;
      this.camera.lookAt(0, 2, 0);
      return;
    }

    if (this.isPaused) return;

    // Movement
    const isSprint = this.keys['shift'] || this.keys['shiftleft'] || this.keys['shiftright'];
    const speed = isSprint ? 18 : 10;
    _v1.set(0, 0, 0);

    if (this.keys['w'] || this.keys['arrowup']) _v1.z -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) _v1.z += 1;
    if (this.keys['a'] || this.keys['arrowleft']) _v1.x -= 1;
    if (this.keys['d'] || this.keys['arrowright']) _v1.x += 1;

    const isMoving = _v1.lengthSq() > 0;
    if (isMoving) {
      _v1.normalize();
      const targetAngle = Math.atan2(_v1.x, _v1.z);
      this.playerRotation = THREE.MathUtils.damp(this.playerRotation, targetAngle, 12, dt);
      this.playerGroup.rotation.y = this.playerRotation;

      this.playerVelocity.copy(_v1).multiplyScalar(speed * dt);
      this.playerPos.add(this.playerVelocity);

      const cycle = this.animTime * (isSprint ? 16 : 10);
      this.leftLeg.rotation.x = Math.sin(cycle) * 0.7;
      this.rightLeg.rotation.x = -Math.sin(cycle) * 0.7;
      this.leftArm.rotation.x = -Math.sin(cycle) * 0.7;
      this.rightArm.rotation.x = Math.sin(cycle) * 0.7;
      this.playerTorso.position.y = 1.65 + Math.abs(Math.sin(cycle * 2)) * 0.12;
    } else {
      this.leftLeg.rotation.x = THREE.MathUtils.damp(this.leftLeg.rotation.x, 0, 10, dt);
      this.rightLeg.rotation.x = THREE.MathUtils.damp(this.rightLeg.rotation.x, 0, 10, dt);
      this.leftArm.rotation.x = THREE.MathUtils.damp(this.leftArm.rotation.x, 0, 10, dt);
      this.rightArm.rotation.x = THREE.MathUtils.damp(this.rightArm.rotation.x, 0, 10, dt);
      this.playerTorso.position.y = 1.65 + Math.sin(this.animTime * 2.5) * 0.04;
    }

    const distFromCenter = Math.hypot(this.playerPos.x, this.playerPos.z);
    if (distFromCenter > 75) {
      this.playerPos.x = (this.playerPos.x / distFromCenter) * 75;
      this.playerPos.z = (this.playerPos.z / distFromCenter) * 75;
    }

    this.playerGroup.position.copy(this.playerPos);

    // Camera Follow
    const camOffset = new THREE.Vector3(0, 7.5, 12.5);
    _v2.copy(this.playerPos).add(camOffset);
    this.camera.position.lerp(_v2, 0.12);
    this.camera.lookAt(this.playerPos.x, this.playerPos.y + 1.8, this.playerPos.z);

    // Zone shrink
    if (this.currentZoneRadius > 35) {
      this.currentZoneRadius -= dt * 0.25;
      this.zoneRingMesh.scale.set(
        this.currentZoneRadius / 88,
        1,
        this.currentZoneRadius / 88
      );
    }

    if (distFromCenter > this.currentZoneRadius) {
      this.callbacks.onUpdateStats(-dt * 3, this.currentZoneRadius);
    } else {
      this.callbacks.onUpdateStats(0, this.currentZoneRadius);
    }

    const near = this.getNearestStation();
    this.callbacks.onNearStation(near);
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onResize);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
  }
}
