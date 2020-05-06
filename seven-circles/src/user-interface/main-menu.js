import GetSong from "../storage/song-getter.js";
import Constants from "../constants.js";

const MENU_SONG = Constants.MenuSong;

const PLANET_OVERLAY = "planet-overlay";
const MENU_BUTTONS = "menu-buttons";

const ROTATION_TIME = 60000;
const PI2 = Math.PI * 2;

const STAR_COUNT = 150;
const STAR_SIZE = 2;
const STAR_BUFFER_SIZE = 1000;

const PLANET_IMAGE_SIZE = 1024;
const PLANET_RADIUS = 0.775;

const LOGO_POSITION_Y = 20;

const LOGO_MIN_SCALE = 2;

const LOGO_BOTTOM_MARGIN = LOGO_POSITION_Y;

const BUTTON_SCALE = 0.75;
const BUTTONS_TOP_MARGIN = 0.1;

const LOGO = "logo-white";
const BACKGROUND_COLOR = "black";
const STAR_COLOR = "white";
const PLANET_COLOR = "#7F0000";

const buttonBaseHeight = 56;
const buttonBaseWidth = 112;

const buttonAreas = [
    [44,16,24,13,1],
    [12,36,36,13,2],
    [60,36,46,13,3]
];
for(let i = 0;i<buttonAreas.length;i++) {
    const values = buttonAreas[i];
    values[0] /= buttonBaseWidth;
    values[1] /= buttonBaseHeight;
    values[2] /= buttonBaseWidth;
    values[3] /= buttonBaseHeight;
}

const {ResourceManager,AudioManager,CanvasManager} = Eleven;

function GetPlanetImage(size) {
    const buffer = new OffscreenCanvas(size,size);
    const context = buffer.getContext("2d",{alpha:true});
    const halfSize = size / 2;

    context.beginPath();
    context.arc(halfSize,halfSize,halfSize*PLANET_RADIUS,0,PI2);
    context.fillStyle = PLANET_COLOR;
    context.fill();

    return buffer;
}

function GetStars(count,size,width,height) {
    const buffer = new OffscreenCanvas(width,height);
    const context = buffer.getContext("2d",{alpha:false});

    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0,0,width,height);
    
    context.fillStyle = STAR_COLOR;

    for(let i = 0;i<count;i++) {
        const x = Math.floor(width * Math.random());
        const y = Math.floor(height * Math.random());
        context.fillRect(x,y,size,size);
    }

    context.fill();

    return buffer;
}

function MainMenu() {

    let logoImage, planetImage, starsImage, overlayImage, buttonsImage;

    this.load = async () => {
        ResourceManager.queueImage([LOGO,PLANET_OVERLAY,MENU_BUTTONS]);
        await ResourceManager.load();

        planetImage = GetPlanetImage(PLANET_IMAGE_SIZE);
        starsImage = GetStars(
            STAR_COUNT,STAR_SIZE,STAR_BUFFER_SIZE,STAR_BUFFER_SIZE
        );
        logoImage = ResourceManager.getImage(LOGO);

        overlayImage = ResourceManager.getImage(PLANET_OVERLAY);

        buttonsImage = ResourceManager.getImage(MENU_BUTTONS);

        const song = await GetSong(MENU_SONG)
        AudioManager.playMusicLooping(song);
    };

    let buttonImageArea = {x:-1,y:-1,width:0,height:0};

    let selection = 0;

    const getSelectionID = (px,py,target) => {
        const [x,y,width,height,selectionID] = target;
        const inX = px > x && px < x + width;
        const inY = py > y && py < y + height;
        if(inX && inY) return selectionID;
        return false;
    };

    const updateSelection = (x,y) => {

        x -= buttonImageArea.x;
        y -= buttonImageArea.y;

        x /= buttonImageArea.width;
        y /= buttonImageArea.height;

        for(let i = 0;i<buttonAreas.length;i++) {
            const result = getSelectionID(x,y,buttonAreas[i]);
            if(result !== false) {
                selection = result; return;
            }
        }
        selection = 0;
    };

    const setupDOMExit = () => {

    };

    const enterSelection = fromClick => {
        switch(selection) {
            case 1: SVCC.Runtime.LoadWorld(); break;
            case 2:  SVCC.Runtime.ConfigAudio(); setupDOMExit(); break;
            case 3: SVCC.Runtime.ConfigKeyBinds(); setupDOMExit(); break;
            default: return;
        }
        if(fromClick) selection = 0;
    };

    let startSelection = 0;
    this.clickDown = ({x,y}) => {
        updateSelection(x,y);
        startSelection = selection;
    };
    this.clickUp = ({x,y}) => {
        updateSelection(x,y);
        if(selection === startSelection) enterSelection(true);
    };
    this.pointerMove = ({x,y}) => {
        updateSelection(x,y);
    };

    const keyUp = () => {};

    const keyDown = ({repeat,impulse}) => {
        if(repeat) return;

        if(impulse.startsWith("Move")) {
            if(selection === 0) {
                selection = 1; return;
            }
            switch(impulse) {
                case "MoveLeft":
                case "MoveUp":
                    if(--selection < 1) selection = 3;
                    break;

                case "MoveDown":
                case "MoveRight":
                    if(++selection > 3) selection = 1;
                    break;
            }
        }

        if(impulse === "Enter") {
            enterSelection(false);
        }
    };

    const {InputServer} = SVCC.Runtime;
    const managedGamepad = InputServer.managedGamepad;
    const {keyBind} = InputServer;
    this.inputGamepad = managedGamepad.poll;
    managedGamepad.keyDown = keyDown;
    managedGamepad.keyUp = keyUp;
    this.keyDown = keyBind.impulse(keyDown);
    this.keyUp = keyBind.impulse(keyUp);

    this.render = (context,{width,halfWidth,height,greaterWidth},time) => {
        context.imageSmoothingEnabled = true;

        if(greaterWidth) {
            context.scale(width,width);
        } else {
            context.scale(height,height);
        }

        const logoScale = Math.max(height / 100,LOGO_MIN_SCALE);

        const logoWidth = logoImage.width * logoScale, logoHeight = logoImage.height * logoScale;
    
        context.drawImage(starsImage,0,0,starsImage.width,starsImage.height,0,0,1,1);
        context.resetTransform();

        const bottomAreaTop = LOGO_POSITION_Y + logoHeight + LOGO_BOTTOM_MARGIN;

        const bottomAreaHeight = height-logoHeight-LOGO_POSITION_Y-LOGO_BOTTOM_MARGIN

        let planetWidth = Math.min(width,bottomAreaHeight*2);

        context.translate(halfWidth,height);
        context.rotate((time.now / ROTATION_TIME) % PI2);
        context.translate(-halfWidth,-height);

        const planetRadius = planetWidth / 2;

        context.translate(halfWidth-planetRadius,height-planetRadius);
        context.scale(planetWidth,planetWidth);

        context.drawImage(
            planetImage,0,0,planetImage.width,planetImage.height,0,0,1,1
        );

        context.imageSmoothingEnabled = false;
        context.drawImage(
            overlayImage,0,0,overlayImage.width,overlayImage.height,0,0,1,1
        );
        context.resetTransform();

        context.drawImage(
            logoImage,0,0,logoImage.width,logoImage.height,
            halfWidth-logoWidth/2,LOGO_POSITION_Y,logoWidth,logoHeight
        );
        
        const buttonImageHeight = bottomAreaHeight * BUTTON_SCALE;
        const buttonImageWidth = buttonsImage.width / buttonBaseHeight * buttonImageHeight;

        const buttonImageX = halfWidth-buttonImageWidth/2;
        const buttonImageY = bottomAreaTop + buttonImageHeight * BUTTONS_TOP_MARGIN;

        context.drawImage(
            buttonsImage,0,selection*buttonBaseHeight,buttonsImage.width,buttonBaseHeight,
            buttonImageX,
            buttonImageY,
            buttonImageWidth,buttonImageHeight
        );

        buttonImageArea.x = buttonImageX;
        buttonImageArea.y = buttonImageY;
        buttonImageArea.width = buttonImageWidth;
        buttonImageArea.height = buttonImageHeight;
    };
}
export default MainMenu;
