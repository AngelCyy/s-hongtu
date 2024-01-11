var VirtualJoystick	= function(opts)
{
	opts			= opts			|| {};
    this._width = opts.width < 126 || opts.width === undefined ? 126:opts.width;
    this._height = opts.height < 126 || opts.height === undefined ? 126:opts.height;
	this._container		= opts.container	|| document.body;
	this._strokeStyle	= opts.strokeStyle	|| 'cyan';
	this._stickEl		= opts.stickElement	|| this._buildJoystickStick(opts.url,opts.name);
	this._baseEl		= opts.baseElement	|| this._buildJoystickBase(opts.url);
	this._mouseSupport	= opts.mouseSupport !== undefined ? opts.mouseSupport : false;
	this._stationaryBase	= opts.stationaryBase || false;
	this._baseX		= this._stickX = opts.baseX || 0;
	this._baseY		= this._stickY = opts.baseY || 0;
	this._limitStickTravel	= opts.limitStickTravel || false;
	this._posX = opts.posX || 0;
    this._posY = opts.posY || 0;

    this.ulrPos = opts.url||null;
    this._name = opts.name||null;
    this._pos  = opts.pos

    this._stickRadius	= opts.stickRadius !== undefined ? opts.stickRadius : 100
	this._useCssTransform	= opts.useCssTransform !== undefined ? opts.useCssTransform : false

	this._container.style.position	= "fixed";
    this._container.style.width	= this._width + "px";
    this._container.style.height	= this._height +"px";
    this._container.style[opts.pos]	= this._posX + "px";
    this._container.style.bottom	= this._posY + "px";
    this._container.style.zIndex = 1000;
	this._container.appendChild(this._baseEl);
	this._baseEl.style.position	= "absolute";
	this._container.appendChild(this._stickEl);
	this._stickEl.style.position	= "absolute";
	this._pressed	= false;
	this._touchIdx	= null;
    if(this._stationaryBase === true){
        this._baseEl.style.display	= "";
        if(this._pos == "left"){
            this._baseEl.style.left		= "0px";
        }else{
            this._baseEl.style.left		= (this._container.offsetWidth - this._baseEl.width)+"px";
        }
        this._baseEl.style.bottom		= "0px";
    }

    this._stickEl.style.left	= (this._baseEl.width - this._stickEl.width)/2+this._baseEl.offsetLeft+"px";
    this._stickEl.style.bottom	= (this._baseEl.width - this._stickEl.height)/2+"px";

	this._transform	= this._useCssTransform ? this._getTransformProperty() : false;
	this._has3d	= this._check3D();

	var __bind	= function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	this._$onTouchStart	= __bind(this._onTouchStart	, this);
	this._$onTouchEnd	= __bind(this._onTouchEnd	, this);
	this._$onTouchMove	= __bind(this._onTouchMove	, this);
	this._container.addEventListener( 'touchstart'	, this._$onTouchStart	, false );
	this._container.addEventListener( 'touchend'	, this._$onTouchEnd	, false );
	this._container.addEventListener( 'touchmove'	, this._$onTouchMove	, false );
	if( this._mouseSupport ){
		this._$onMouseDown	= __bind(this._onMouseDown	, this);
		this._$onMouseUp	= __bind(this._onMouseUp	, this);
		this._$onMouseMove	= __bind(this._onMouseMove	, this);
		this._container.addEventListener( 'mousedown'	, this._$onMouseDown	, false );
		this._container.addEventListener( 'mouseup'	, this._$onMouseUp	, false );
		this._container.addEventListener( 'mousemove'	, this._$onMouseMove	, false );
	}
}

VirtualJoystick.prototype.destroy	= function()
{
	this._container.removeChild(this._baseEl);
	this._container.removeChild(this._stickEl);

	this._container.removeEventListener( 'touchstart'	, this._$onTouchStart	, false );
	this._container.removeEventListener( 'touchend'		, this._$onTouchEnd	, false );
	this._container.removeEventListener( 'touchmove'	, this._$onTouchMove	, false );
	if( this._mouseSupport ){
		this._container.removeEventListener( 'mouseup'		, this._$onMouseUp	, false );
		this._container.removeEventListener( 'mousedown'	, this._$onMouseDown	, false );
		this._container.removeEventListener( 'mousemove'	, this._$onMouseMove	, false );
	}
}

/**
 * @returns {Boolean} true if touchscreen is currently available, false otherwise
*/
VirtualJoystick.touchScreenAvailable	= function()
{
	return 'createTouch' in document ? true : false;
}

/**
 * microevents.js - https://github.com/jeromeetienne/microevent.js
*/
;(function(destObj){
	destObj.addEventListener	= function(event, fct){
		if(this._events === undefined) 	this._events	= {};
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(fct);
		return fct;
	};
	destObj.removeEventListener	= function(event, fct){
		if(this._events === undefined) 	this._events	= {};
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	};
	destObj.dispatchEvent		= function(event /* , args... */){
		if(this._events === undefined) 	this._events	= {};
		if( this._events[event] === undefined )	return;
		var tmpArray	= this._events[event].slice();
		for(var i = 0; i < tmpArray.length; i++){
			var result	= tmpArray[i].apply(this, Array.prototype.slice.call(arguments, 1))
			if( result !== undefined )	return result;
		}
		return undefined
	};
})(VirtualJoystick.prototype);

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype.deltaX	= function(){
  deltaX = this._baseEl.offsetLeft - this._stickEl.offsetLeft+(this._baseEl.offsetWidth-this._stickEl.offsetWidth)/2;
  return deltaX;
}
VirtualJoystick.prototype.deltaY	= function(){
  deltaY = this._baseEl.offsetTop - this._stickEl.offsetTop+(this._baseEl.offsetWidth-this._stickEl.offsetWidth)/2;
  return deltaY;
}

VirtualJoystick.prototype.up	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaY >= 0 )				return false;
	if( Math.abs(deltaX) > 2*Math.abs(deltaY) )	return false;
	return true;
}
VirtualJoystick.prototype.down	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaY <= 0 )				return false;
	if( Math.abs(deltaX) > 2*Math.abs(deltaY) )	return false;
	return true;
}
VirtualJoystick.prototype.right	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaX <= 0 )				return false;
	if( Math.abs(deltaY) > 2*Math.abs(deltaX) )	return false;
	return true;
}
VirtualJoystick.prototype.left	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaX >= 0 )				return false;
	if( Math.abs(deltaY) > 2*Math.abs(deltaX) )	return false;
	return true;
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._onUp	= function()
{
	this._pressed	= false;
	// this._stickEl.style.display	= "none";

	/*if(this._stationaryBase == false){*/
		// this._baseEl.style.display	= "none";
    this._baseX	= this._baseY	= 0;
	this._stickX	= this._stickY	= 0;

    // }
}

VirtualJoystick.prototype._onDown	= function(x, y)
{
	this._pressed	= true;

	var stickX;
	var stickY;
    /*var startX = this._container.offsetLeft+(this._baseEl.offsetLeft);
    var startY = this._container.offsetTop + this._baseEl.offsetTop ;*/

   /* if(x > startX && x < startX + this._baseEl.width && y > startY && y < startY +this._baseEl.height){
        this._stickEl.style.display	= "";
        var deltaX	= x - (startX+this._baseEl.width/2);
        var deltaY	= y - (startY+this._baseEl.height/2);
        var stickDistance = Math.sqrt( (deltaX * deltaX) + (deltaY * deltaY) );
        var baseDistance = this._baseEl.width/2;
        if(stickDistance > baseDistance){
            var stickNormalizedX = deltaX / stickDistance;
            var stickNormalizedY = deltaY / stickDistance;
            stickX = stickNormalizedX * this._baseEl.width/2 +this._baseEl.width/2;
            stickY = stickNormalizedY * this._baseEl.height/2+this._baseEl.height/2;
            this._move(this._stickEl.style, (stickX - this._stickEl.width/2 ), ( this._stickEl.height/2 )-stickY+this._stickEl.height/2);
        } else {
            this._move(this._stickEl.style, ( deltaX + (this._baseEl.width - this._stickEl.width )/2 ), ((this._baseEl.height-this._stickEl.height)/2 - deltaY ));
        }
    }
    else{*/
        var disX = x - this._container.offsetLeft;
        var disY = this._container.offsetHeight - (y - this._container.offsetTop);
        var baseDisX = disX,baseDisY = disY,stickX = disX,stickY = disY;
        /*if(x-this._baseEl.width/2<this._container.offsetLeft){
            baseDisX += this._baseEl.width/2  - (x- this._container.offsetLeft);
        }
        /!*if(x+this._baseEl.width/2>this._container.offsetLeft+this._container.offsetWidth){
            baseDisX -= (x+this._baseEl.width/2)  - ( this._container.offsetLeft+this._container.offsetWidth);
        }*!/
        if(y-this._baseEl.height/2<this._container.offsetTop){
            baseDisY -= this._baseEl.height/2  - (y- this._container.offsetTop);
        }
        /!*if(y+this._baseEl.height/2>this._container.offsetTop+this._container.offsetHeight){
            baseDisY += (y+this._baseEl.height/2)  - ( this._container.offsetTop+this._container.offsetHeight);
        }*!/
        if(x-this._stickEl.width/2<this._container.offsetLeft){
            stickX += this._stickEl.width/2  - (x- this._container.offsetLeft);
        }
        /!*if(x+this._stickEl.width/2>this._container.offsetLeft+this._container.offsetWidth){
            stickX -= (x+this._stickEl.width/2)  - ( this._container.offsetLeft+this._container.offsetWidth);
        }*!/
        /!*if(y-this._stickEl.height/2<this._container.offsetTop){
            stickY -= this._stickEl.height/2  - (y- this._container.offsetTop);
        }*!/
        if(y+this._stickEl.height/2>this._container.offsetTop+this._container.offsetHeight){
            stickY += (y+this._stickEl.height/2)  - ( this._container.offsetTop+this._container.offsetHeight);
        }*/

        if(x >  this._container.offsetLeft && x < this._container.offsetLeft+this._container.offsetWidth
            &&y >  this._container.offsetTop && y < this._container.offsetTop+this._container.offsetHeight){
            this._stickEl.style.left =  stickX  - ( this._stickEl.width)/2 + "px";
            this._stickEl.style.bottom =  stickY - (this._stickEl.height)/2 + "px";
            this._baseEl.style.left =  baseDisX - this._baseEl.width/2  + "px";
            this._baseEl.style.bottom =  baseDisY - this._baseEl.height/2 + "px";
        }

   /* }*/
}

VirtualJoystick.prototype._onMove	= function(x, y)
{
  var stickX, stickY
	if( this._pressed === true ){
		this._stickX	= x;
		this._stickY	= y;
        var startX = this._container.offsetLeft+(this._baseEl.offsetLeft);
        var startY = this._container.offsetTop + this._baseEl.offsetTop ;
        if(x > startX && x < startX + this._baseEl.width && y > startY && y < startY +this._baseEl.height){
            this._stickEl.style.display	= "";
            var deltaX	= x - (startX+this._baseEl.width/2);
            var deltaY	= y - (startY+this._baseEl.height/2);
            var stickDistance = Math.sqrt( (deltaX * deltaX) + (deltaY * deltaY) );
            var baseDistance = this._baseEl.width/2;
            if(stickDistance > baseDistance){
                var stickNormalizedX = deltaX / stickDistance;
                var stickNormalizedY = deltaY / stickDistance;
                stickX = stickNormalizedX * this._baseEl.width/2 +this._baseEl.width/2;
                stickY = stickNormalizedY * this._baseEl.height/2+this._baseEl.height/2;
                this._move(this._stickEl.style, (stickX - this._stickEl.width/2), ( this._stickEl.height/2 )-stickY+this._stickEl.height/2);
            } else {
                this._move(this._stickEl.style, ( deltaX + (this._baseEl.width - this._stickEl.width )/2), ((this._baseEl.height-this._stickEl.height)/2 - deltaY ));
            }
        }
		/*if(this._limitStickTravel === true){
			var deltaX	= x - (this._container.offsetLeft + this._width/2);
			var deltaY	= y - (this._container.offsetTop + this._height/2);
			var stickDistance = Math.sqrt( (deltaX * deltaX) + (deltaY * deltaY) );
			var baseDistance = this._width/2;
			if(stickDistance > baseDistance){
				var stickNormalizedX = deltaX / stickDistance;
				var stickNormalizedY = deltaY / stickDistance;

				stickX = stickNormalizedX * this._width/2 +this._width/2;
				stickY = stickNormalizedY * this._height/2+this._width/2;
        		this._move(this._stickEl.style, (stickX - this._stickEl.width/2 ), (stickY - this._stickEl.height/2 ));
			} else {
        		this._move(this._stickEl.style, (deltaX + (this._width - this._stickEl.width )/2 ), (deltaY + (this._height - this._stickEl.height )/2));
      		}
		}*/

	}
}


//////////////////////////////////////////////////////////////////////////////////
//		bind touch events (and mouse events for debug)			//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._onMouseUp	= function(event)
{
	this._pressed = false;
    if(this._stationaryBase === true){
        this._baseEl.style.display	= "";
        if(this._pos == "left"){
            this._baseEl.style.left		= "0px";
        }else{
            this._baseEl.style.left		= (this._container.offsetWidth - this._baseEl.width)+"px";
        }
        this._baseEl.style.bottom		= "0px";
    }

    this._stickEl.style.left	= (this._baseEl.width - this._stickEl.width)/2+this._baseEl.offsetLeft+"px";
    this._stickEl.style.bottom	= (this._baseEl.width - this._stickEl.height)/2+"px";
	return this._onUp();
}

VirtualJoystick.prototype._onMouseDown	= function(event)
{
    this._pressed === true
	event.preventDefault();
	var x	= event.clientX;
	var y	= event.clientY;
	return this._onDown(x, y);
}

VirtualJoystick.prototype._onMouseMove	= function(event)
{
	if(this._pressed == true){
        var x	= event.clientX;
        var y	= event.clientY;
        return this._onMove(x, y);
	}
}

//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._onTouchStart	= function(event)
{
	// if there is already a touch inprogress do nothing
	if( this._touchIdx !== null )	return;

	// notify event for validation
	var isValid	= this.dispatchEvent('touchStartValidation', event);
	if( isValid === false )	return;

	// dispatch touchStart
	this.dispatchEvent('touchStart', event);
	event.preventDefault();
	// get the first who changed
	var touch	= event.changedTouches[0];
	// set the touchIdx of this joystick
	this._touchIdx	= touch.identifier;
	// forward the action
	var x		= touch.clientX;
	var y		= touch.clientY ;
    if(x>this._container.offsetLeft+1&&x<this._container.offsetLeft+this._container.offsetWidth-1){
        return this._onDown(x, y);
    }
}

VirtualJoystick.prototype._onTouchEnd	= function(event)
{
	// if there is no touch in progress, do nothing
	if( this._touchIdx === null )	return;

	// dispatch touchEnd
	this.dispatchEvent('touchEnd', event);
	event.preventDefault();
	// try to find our touch event
	var touchList	= event.changedTouches;
	for(var i = 0; i < touchList.length && touchList[i].identifier !== this._touchIdx; i++);
	// if touch event isnt found,
	if( i === touchList.length)	return;

	// reset touchIdx - mark it as no-touch-in-progress
	this._touchIdx	= null;

//??????
// no preventDefault to get click event on ios
	event.preventDefault();
    if(this._stationaryBase === true){
        this._baseEl.style.display	= "";
        if(this._pos == "left"){
            this._baseEl.style.left		= "0px";
        }else{
            this._baseEl.style.left		= (this._container.offsetWidth - this._baseEl.width)+"px";
        }
        this._baseEl.style.bottom		= "0px";
    }

    this._stickEl.style.left	= (this._baseEl.width - this._stickEl.width)/2+this._baseEl.offsetLeft+"px";
    this._stickEl.style.bottom	= (this._baseEl.width - this._stickEl.height)/2+"px";

	return this._onUp()
}

VirtualJoystick.prototype._onTouchMove	= function(event)
{
	// if there is no touch in progress, do nothing
	if( this._touchIdx === null )	return;

	// try to find our touch event
	var touchList	= event.changedTouches;
	for(var i = 0; i < touchList.length && touchList[i].identifier !== this._touchIdx; i++ );
	// if touch event with the proper identifier isnt found, do nothing
	if( i === touchList.length)	return;
	var touch	= touchList[i];

	event.preventDefault();

	var x		= touch.clientX;
	var y		= touch.clientY;

	return this._onMove(x, y)
}


//////////////////////////////////////////////////////////////////////////////////
//		build default stickEl and baseEl				//
//////////////////////////////////////////////////////////////////////////////////

/**
 * build the canvas for joystick base
 */
VirtualJoystick.prototype._buildJoystickBase	= function(ulr)
{
	var canvas	= document.createElement( 'canvas' );
	canvas.width	= 126;
	canvas.height	= 126;
	var img = new Image();
	img.src = ulr+"background.png";
	var ctx		= canvas.getContext('2d');
    img.onload = function () {
        ctx.drawImage(img, 0, 0,285,286,0,0,126,126);
    }
	return canvas;
}

/**
 * build the canvas for joystick stick
 */
VirtualJoystick.prototype._buildJoystickStick	= function(ulr,name)
{
    var canvas	= document.createElement( 'canvas' );
	canvas.width	= 86;
	canvas.height	= 86;
	var ctx		= canvas.getContext('2d');
    var img = new Image();
    img.src = ulr+""+name+".png";
    img.onload = function () {
        ctx.drawImage(img, 0, 0,173,172,0,0,86,86);
    }
	return canvas;
}

//////////////////////////////////////////////////////////////////////////////////
//		move using translate3d method with fallback to translate > 'top' and 'left'
//      modified from https://github.com/component/translate and dependents
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._move = function(style, x, y)
{
	if (this._transform) {
		if (this._has3d) {
			style[this._transform] = 'translate3d(' + x + 'px,' + y + 'px, 0)';
		} else {
			style[this._transform] = 'translate(' + x + 'px,' + y + 'px)';
		}
	} else {
		style.left = x+this._baseEl.offsetLeft+ 'px';
		style.bottom = y +(this._container.offsetHeight-this._baseEl.offsetTop-this._baseEl.offsetHeight)+ 'px';
	}
}

VirtualJoystick.prototype._getTransformProperty = function()
{
	var styles = [
		'webkitTransform',
		'MozTransform',
		'msTransform',
		'OTransform',
		'transform'
	];

	var el = document.createElement('p');
	var style;

	for (var i = 0; i < styles.length; i++) {
		style = styles[i];
		if (null != el.style[style]) {
			return style;
		}
	}
}

VirtualJoystick.prototype._check3D = function()
{
	var prop = this._getTransformProperty();
	// IE8<= doesn't have `getComputedStyle`
	if (!prop || !window.getComputedStyle) return module.exports = false;

	var map = {
		webkitTransform: '-webkit-transform',
		OTransform: '-o-transform',
		msTransform: '-ms-transform',
		MozTransform: '-moz-transform',
		transform: 'transform'
	};

	// from: https://gist.github.com/lorenzopolidori/3794226
	var el = document.createElement('div');
	el.style[prop] = 'translate3d(1px,1px,1px)';
	document.body.insertBefore(el, null);
	var val = getComputedStyle(el).getPropertyValue(map[prop]);
	document.body.removeChild(el);
	var exports = null != val && val.length && 'none' != val;
	return exports;
}
