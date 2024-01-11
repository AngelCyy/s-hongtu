/**
* @author Chion82 https://miria.moe
*/

THREE.TouchFPSControls = function(camera, options) {

  var pitchObject = new THREE.Object3D();
  var yawObject = new THREE.Object3D();

  var leftVelocity = new THREE.Vector3();
  var rightVelocity = new THREE.Vector3();

  var joystick,control;

  this.options = options || {
    controlsContainer:null,
    joystickContainer : null,
    verticalControlsContainer : null,
    moveSpeed : 3,
    canFly : true,
    viewMovingSpeed: 7,
    border : {
      maxX : 1000,
      minX : -1000,
      maxY : 1000,
      minY : 0,
      maxZ : 1000,
      minZ : -1000
    },
    view:{
        maxX : 20,
        minX : -20,
        maxY : 20,
        minY : -20,
        maxZ : 20,
        minZ : -20
    },
    controlsPosition:{
        x:0,
        y:0,
    },
    joystickPosition:{
        x:0,
        y:0,
    },
    url:null,
    moveWidth:220,
    moveHeight:220,
    debug : false,
    movingMiddleware : function(){}
  }

  var leftCallback = options ? options.leftCallback : null;
    var rightCallback = options ? options.rightCallback : null;

  this._controlsContainer = document.createElement("div");
  this._camera = camera;
  this._canvasDOM = document.createElement("div");
  this._joystickContainer = document.createElement("div");
  this._verticalControlsContainer = null;
  this._moveSpeed = this.options.moveSpeed || 3;
  this._viewMovingSpeed = this.options.viewMovingSpeed || 2;
  this._canFly = this.options.canFly;
  this._border = this.options.border;
  this._view = this.options.view;
  this.moveWidth = this.options.moveWidth;
  this.moveHeight = this.options.moveHeight;
  this._movingMiddleware = this.options.movingMiddleware || function(){};
  this._positon = this.options.controlsPosition;
  this._init = function() {
    pitchObject.add(this._camera);
    yawObject.add(pitchObject);
    document.body.appendChild(this._canvasDOM);
    this._canvasDOM.appendChild(this._controlsContainer);
      this._canvasDOM.appendChild(this._joystickContainer);
      this._canvasDOM.style.position = "absolute";
      /*this._canvasDOM.addEventListener('touchstart', this._onTouchStart.bind(this));
      this._canvasDOM.addEventListener('touchend', this._onTouchEnd.bind(this));
      this._canvasDOM.addEventListener('touchmove', this._onTouchMove.bind(this));*/

    if (this._joystickContainer)
      this._initJoystick();

    if(this._controlsContainer)
       this._initControls();
    if (this._verticalControlsContainer) {
      this._initVerticalControls();
    }

    if (this.options.debug) {
      this._initDebug();
    }

  }
  this._initControls =function(){
    control = new VirtualJoystick({
        name:"control",
        url:this.options.url,
        container	: this._controlsContainer,
        mouseSupport	: true,
        stationaryBase	: true,
        baseX		: 100,
        baseY		: 100,
        limitStickTravel: true,
        stickRadius	: 50,
        pos:"right",
        posX:this.options.controlsPosition.x,
        posY:this.options.controlsPosition.y,
        width:this.moveWidth,
        height:this.moveHeight
    });
      var that = this;
      setInterval(function()
      {
          var delta = that._moveSpeed * 0.0001;
          var deltaX = control.deltaX();
          var deltaY = control.deltaY();

          if (deltaX > that._view.maxX) {
              deltaX = that._view.maxX;
          }
          if (deltaX < that._view.minX) {
              deltaX = that._view.minX;
          }
          if (deltaY > that._view.maxY) {
              deltaY = that._view.maxY;
          }
          if (deltaY < that._view.minY) {
              deltaY = that._view.minY;
          }
          rightVelocity.z = deltaY;
          rightVelocity.x = deltaX;

          if (!control.up() && !control.down() && !control.left() && !control.right())
          {
              rightVelocity.x = 0;
              rightVelocity.y = 0;
              rightVelocity.z = 0;
          }

          if (rightCallback)
          {
              rightCallback(rightVelocity);
          }
      }, 10);
  }

  this._initVerticalControls = function() {
    this._verticalControlsContainer.innerHTML = '<div id="arrow-up-button" style="margin-bottom: 20px;"><i class="icon iconfont" style="font-size: 50px;">&#xe936;</i></div><div id="arrow-down-button" ><i class="icon iconfont" style="font-size: 50px;">&#xe92f;</i></div>';
    document.getElementById('arrow-up-button').addEventListener('touchstart', function(e){
      e.preventDefault();
      this._moveUpButtonDown = true;
    }.bind(this));
    document.getElementById('arrow-up-button').addEventListener('touchend', function(e){
      e.preventDefault();
      this._moveUpButtonDown = false;
    }.bind(this));
    document.getElementById('arrow-down-button').addEventListener('touchstart', function(e){
      e.preventDefault();
      this._moveDownButtonDown = true;
    }.bind(this));
    document.getElementById('arrow-down-button').addEventListener('touchend', function(e){
      e.preventDefault();
      this._moveDownButtonDown = false;
    }.bind(this));

    setInterval(function(){
      if (this._moveUpButtonDown) {
        this.getObject().position.y += this._moveSpeed;
      }
      if (this._moveDownButtonDown) {
        this.getObject().position.y -= this._moveSpeed;
      }

    }.bind(this), 10);

  }

  this._initDebug = function() {
    var debugBox = document.createElement('div');
    debugBox.id = 'threejs-debug-box';
    debugBox.style.position = 'fixed';
    debugBox.style.right = '0px';
    debugBox.style.top = '0px';
    debugBox.style.fontSize = '12px';
    debugBox.innerHTML = 'Debug Info';
    // this._canvasDOM.appendChild(debugBox);

    setInterval(function(){
      var cameraPosition = this.getObject().position;

      debugBox.innerHTML = 'Camera Position: x=' + cameraPosition.x
        + '; y=' + cameraPosition.y + '; z=' + cameraPosition.z
        + '<br/>Yaw Rotation: y=' + yawObject.rotation.y
        + '<br/>Pitch Rotation: x=' + pitchObject.rotation.x;
    }.bind(this), 10);
  }

  this._initJoystick = function() {
    joystick	= new VirtualJoystick({
      name:"joystick",
      url:this.options.url,
      container	: this._joystickContainer,
      mouseSupport	: true,
      stationaryBase	: true,
      baseX		: 100,
      baseY		: 100,
      limitStickTravel: true,
      stickRadius	: 50,
      pos:"left",
      width:this.moveWidth,
      height:this.moveHeight,
      posX:this.options.joystickPosition.x,
      posY:this.options.joystickPosition.y
    });

    var that = this;
    setInterval(function(){

      var delta = that._moveSpeed * 0.01;

      var deltaX = joystick.deltaX();
      var deltaY = joystick.deltaY();

        if (deltaX > that._view.maxX) {
            deltaX = that._view.maxX;
        }
        if (deltaX < that._view.minX) {
            deltaX = that._view.minX;
        }
        if (deltaY > that._view.maxY) {
            deltaY = that._view.maxY;
        }
        if (deltaY < that._view.minY) {
            deltaY = that._view.minY;
        }

      leftVelocity.z = deltaY;
        leftVelocity.x = deltaX;

      if (!joystick.up() && !joystick.down() && !joystick.left() && !joystick.right()) {
          leftVelocity.x = 0;
          leftVelocity.y = 0;
          leftVelocity.z = 0;
      }

      if (leftCallback)
      {
          leftCallback(leftVelocity);
      }

    }, 10);
  }

  this._isTouchDown = false;

  this._touchIndex = 0;
  this._onTouchStart = function(e) {
    //e.preventDefault();
    this._isTouchDown = true;
    var touchObj;
    if (e.touches) {
      this._touchIndex = e.touches.length - 1;
      touchObj = e.touches[this._touchIndex];
    } else {
      touchObj = e;
    }
    lastTouchPos.x = touchObj.clientX;
    lastTouchPos.y = touchObj.clientY;
  }

  this._onTouchEnd = function(e) {
    //e.preventDefault();
    this._isTouchDown = false;
  }

  var lastTouchPos = {x:0, y:0};
  this._onTouchMove = function(e) {
    e.preventDefault();
    if (!this._isTouchDown) {
      return;
    }

    var touchObj;
    if (e.touches) {
      touchObj = e.touches[this._touchIndex];
    } else {
      touchObj = e;
    }

    yawObject.rotation.y -= (touchObj.clientX - lastTouchPos.x) *  (0.001 * this._viewMovingSpeed);
    pitchObject.rotation.x -= (touchObj.clientY - lastTouchPos.y) * (0.001 * this._viewMovingSpeed);

    lastTouchPos.x = touchObj.clientX;
    lastTouchPos.y = touchObj.clientY;
  }

  this.getObject = function() {
    return yawObject;
  }

  this.setYawRotation = function() {
    yawObject.rotation.set.apply(yawObject.rotation, arguments);
  }

  this.setPitchRotation = function() {
    pitchObject.rotation.set.apply(pitchObject.rotation, arguments);
  }

  this.setPosition = function() {
    this.getObject().position.set.apply(this.getObject().position, arguments);
  }

  this.getYawRotation = function() {
    return yawObject.rotation;
  }

  this.getPitchRotation = function() {
    return pitchObject.rotation;
  }

  this.getPosition = function() {
    return this.getObject().position;
  }

  this._init();

}
