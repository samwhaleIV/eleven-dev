const DEFAULT_IMAGE = "boat";
const ROW_TIME = 400;
const ROW_ANGLE_DAMPENING = 4;

function BoatSprite(world,occupant,imageName=DEFAULT_IMAGE) {

    /* Start render control variables */
    this.angle = 0;
    this.paddleIntensity = 0;

    this.leftPaddlePolarity = 1;
    this.rightPaddlePolarity = 1;

    this.xVelocity = 0;
    this.yVelocity = 0;
    /* End render control variables */

    const occupantYOffset = -0.2, occupantYPart = 0.65;

    const image = Eleven.ResourceManager.getImage(imageName);

    const frameWidth = 16, frameHeight = 18;
    const paddleWidth = 13, paddleHeight = 4;

    const paddleWidthRatio = paddleWidth / frameWidth;
    const paddleHeightRatio = paddleHeight / frameHeight;

    const frameWidthRatio = 16 / frameWidth, frameHeightRatio = 16 / frameHeight;

    this.width = frameWidth / 16, this.height = frameHeight / 16;

    const renderBase = (context,x,y,width,height) => {
        context.drawImage(image,0,0,frameWidth,frameHeight,x,y,width,height);
    };

    const paddleY = 7 / frameHeight;
    const leftPaddleX = 4 / frameWidth, rightPaddleX = 12 / frameWidth;

    const rotateY = 9 / frameHeight;

    const rotateXOffset = 0.25;
    const leftRotateX = rotateXOffset / frameWidth;
    const rightRotateX = (16-rotateXOffset) / frameWidth;

    let leftPaddleAngle = 0, rightPaddleAngle = 0;

    const PI2 = Math.PI * 2;

    const {grid} = world;

    this.roundRenderLocation = true;

    const updatePosition = ({deltaSecond}) => {
        this.x += grid.roundToPixels(deltaSecond * this.xVelocity);
        this.y += grid.roundToPixels(deltaSecond * this.yVelocity);
    };

    this.update = time => {

        updatePosition(time);

        let duration = ROW_TIME, intensity = this.paddleIntensity;

        if(intensity <= 0) {
            leftPaddleAngle = 0, rightPaddleAngle = 0;
            return;
        }
        const angle = time.now / duration * PI2;

        const paddleAngle = (Math.sin(angle) * Math.min(intensity,1)) / ROW_ANGLE_DAMPENING;

        leftPaddleAngle = paddleAngle * this.leftPaddlePolarity * -1;
        rightPaddleAngle = paddleAngle * this.rightPaddlePolarity;
    };

    const renderPaddle = (
        context,x,y,renderWidth,renderHeight,isLeft
    ) => {
        let textureY = 5;
        if(isLeft) {
            x -= renderWidth;
            textureY = 0;
        }
        context.drawImage(
            image,16,textureY,paddleWidth,paddleHeight,
            x,y,renderWidth,renderHeight
        );
    };

    const renderPaddles = (context,x,y,width,height) => {
        const renderWidth = paddleWidthRatio * width, renderHeight = paddleHeightRatio * height;
        const renderY = y + paddleY * height;
        const renderRotateY = y + rotateY * height;

        let renderRotateX = x + leftRotateX * width;

        let transform = context.getTransform();

        context.translate(renderRotateX,renderRotateY);
        context.rotate(leftPaddleAngle);
        context.translate(-renderRotateX,-renderRotateY);
        renderPaddle(
            context,x+leftPaddleX*width,renderY,renderWidth,renderHeight,true
        );
        context.setTransform(transform);

        renderRotateX = x + rightRotateX * width;

        transform = context.getTransform();
        context.translate(renderRotateX,renderRotateY);
        context.rotate(rightPaddleAngle);
        context.translate(-renderRotateX,-renderRotateY);
        renderPaddle(
            context,x+rightPaddleX*width,renderY,renderWidth,renderHeight,false
        );
        context.setTransform(transform);
    };

    const occupantBuffer = new OffscreenCanvas(0,0);
    const bufferContext = occupantBuffer.getContext("2d",{alpha:true});

    const inRange = (value,min,max) => value >= min && value <= max;

    const getOccupantDirection = () => {
        const angle = this.angle * 180 / Math.PI;
        if(inRange(angle,0,45) || inRange(315,360)) {
            return 2;
        } else if(inRange(angle,45,135)) {
            return 3;
        } else if(inRange(angle,135,225)) {
            return 0;
        } else if(inRange(angle,225,315)) {
            return 1;
        }
        return 2;
    };

    const renderOccupant = (width,height) => {
        const occupantWidth = Math.floor(width * frameWidthRatio);
        const occupantHeight = Math.floor(height * frameHeightRatio);
        if(occupantBuffer.width === occupantWidth && occupantBuffer.height === occupantHeight) {
            bufferContext.clearRect(0,0,occupantWidth,occupantHeight);
        } else {
            occupantBuffer.width = occupantWidth, occupantBuffer.height = occupantHeight;
            bufferContext.imageSmoothingEnabled = false;
        }
        occupant.direction = getOccupantDirection();
        occupant.render(bufferContext,0,0,occupantWidth,occupantHeight);
    };

    const renderOccupantTop = (context,x,y,width,headHeight) => {
        context.drawImage(occupantBuffer,0,0,width,headHeight,x,y,width,headHeight);
    };
    const renderOccupantBottom = (context,x,y,width,headHeight,legHeight) => {
        context.drawImage(occupantBuffer,0,headHeight,width,legHeight,x,y+headHeight,width,legHeight);
    };

    this.render = (context,x,y,width,height) => {
        let centerX = x + width / 2, centerY = y + height / 2;

        renderOccupant(width,height);
        const deferBottom = occupant.direction === 0;

        const startTransform = context.getTransform();

        context.translate(centerX,centerY);
        context.rotate(this.angle);
        context.translate(-centerX,-centerY);

        const occupantWidth = occupantBuffer.width, occupantHeight = occupantBuffer.height;
        centerX -= occupantWidth / 2, centerY -= occupantHeight / 2;
        centerY += height * occupantYOffset;

        const headHeight = occupantHeight * occupantYPart;
        const legHeight = occupantHeight - headHeight;

        renderBase(context,x,y,width,height);

        if(!deferBottom) {
            const superTransform = context.getTransform();
            context.setTransform(startTransform);
            renderOccupantBottom(context,centerX,centerY,occupantWidth,headHeight,legHeight);
            context.setTransform(superTransform);
        }

        renderPaddles(context,x,y,width,height);
        context.setTransform(startTransform);
        if(deferBottom) {
            renderOccupantBottom(context,centerX,centerY,occupantWidth,headHeight,legHeight); 
        }
        renderOccupantTop(context,centerX,centerY,occupantWidth,headHeight,legHeight);
    };
}

export default BoatSprite;
