/*globals $, svgedit, svgroot*/
/*jslint vars: true, eqeq: true, continue: true*/
/**
 * Package: svgedit.path
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2011 Alexis Deveria
 * Copyright(c) 2011 Jeff Schiller
 */

// Dependencies:
// 1) jQuery
// 2) browser.js
// 3) math.js
// 4) svgutils.js

(function() {'use strict';

	if (!svgedit.path) {
		svgedit.path = {};
	}

	var NS = svgedit.NS;
	var uiStrings = {
		'pathNodeTooltip': 'Drag node to move it. Double-click node to change segment type',
		'pathCtrlPtTooltip': 'Drag control point to adjust curve properties'
	};

	var segData = {
		2: ['x', 'y'],
		4: ['x', 'y'],
		6: ['x', 'y', 'x1', 'y1', 'x2', 'y2'],
		8: ['x', 'y', 'x1', 'y1'],
		10: ['x', 'y', 'r1', 'r2', 'angle', 'largeArcFlag', 'sweepFlag'],
		12: ['x'],
		14: ['y'],
		16: ['x', 'y', 'x2', 'y2'],
		18: ['x', 'y']
	};

	var pathFuncs = [];

	var link_control_pts = false;

	var pointGripSize = 2;

	var pointCtrlSize = 1;

	var fuzzyShrinkDistance = 0.9;

// Stores references to paths via IDs.
// TODO: Make this cross-document happy.
	var pathData = {};

	var ptGripColor = '#4b7bff';

	svgedit.path.setLinkControlPoints = function(lcp) {
		link_control_pts = lcp;
	};

	svgedit.path.path = null;

	var ptQuadSize = 5;

	var editorContext_ = null;

	svgedit.path.init = function(editorContext) {
		editorContext_ = editorContext;

		pathFuncs = [0, 'ClosePath'];
		var pathFuncsStrs = ['Moveto', 'Lineto', 'CurvetoCubic', 'CurvetoQuadratic', 'Arc',
			'LinetoHorizontal', 'LinetoVertical', 'CurvetoCubicSmooth', 'CurvetoQuadraticSmooth'];
		$.each(pathFuncsStrs, function(i, s) {
			pathFuncs.push(s+'Abs');
			pathFuncs.push(s+'Rel');
		});
	};

	svgedit.path.insertItemBefore = function(elem, newseg, index) {
		// Support insertItemBefore on paths for FF2
		var list = elem.pathSegList;

		if (svgedit.browser.supportsPathInsertItemBefore()) {
			list.insertItemBefore(newseg, index);
			return;
		}
		var len = list.numberOfItems;
		var arr = [];
		var i;
		for (i=0; i < len; i++) {
			var cur_seg = list.getItem(i);
			arr.push(cur_seg);
		}
		list.clear();
		for (i=0; i < len; i++) {
			if (i == index) { //index+1
				list.appendItem(newseg);
			}
			list.appendItem(arr[i]);
		}
	};

// TODO: See if this should just live in replacePathSeg
	svgedit.path.ptObjToArr = function(type, seg_item) {
        var arr = segData[type],len;
        // console.log("这个报错是为什么=====",arr);
		if(arr){
            len = arr.length;
		} else{
			return;
		}
		var i, out = [];
		for (i = 0; i < len; i++) {
			out[i] = seg_item[arr[i]];
		}
		return out;
	};

	svgedit.path.getGripPt = function(seg, alt_pt) {
		var out = {
			x: alt_pt? alt_pt.x : seg.item.x,
			y: alt_pt? alt_pt.y : seg.item.y
		}, path = seg.path;

		if (path.matrix) {
			var pt = svgedit.math.transformPoint(out.x, out.y, path.matrix);
			out = pt;
		}

		out.x *= editorContext_.getCurrentZoom();
		out.y *= editorContext_.getCurrentZoom();

		return out;
	};

	svgedit.path.getPointFromGrip = function(pt, path) {
		var out = {
			x: pt.x,
			y: pt.y
		};

		if (path.matrix) {
			pt = svgedit.math.transformPoint(out.x, out.y, path.imatrix);
			out.x = pt.x;
			out.y = pt.y;
		}

		out.x /= editorContext_.getCurrentZoom();
		out.y /= editorContext_.getCurrentZoom();

		return out;
	};

    svgedit.path.removePointGrip = function(index)
	{
        // create the container of all the point grips
        var pointGripContainer = svgedit.path.getGripContainer();

        var pointGrip = svgedit.utilities.getElem('pathpointgrip_' +index);
        // hide it
        if (pointGrip)
        {
            svgedit.utilities.assignAttributes(pointGrip, {
                'display': 'none'
            });
        }
    };

	svgedit.path.addPointGrip = function(index, x, y) {
		// create the container of all the point grips
		var pointGripContainer = svgedit.path.getGripContainer();

		var pointGrip = svgedit.utilities.getElem('pathpointgrip_'+index);
		// create it
		if (!pointGrip) {
			pointGrip = document.createElementNS(NS.SVG, 'polygon');
			svgedit.utilities.assignAttributes(pointGrip, {
				'id': 'pathpointgrip_' + index,
				'display': 'none',
				'r': svgedit.path.getPointCtrlSize(),
				'cxx':0,
				'cyy':0,
				'fill': ptGripColor,
				'stroke': ptGripColor,
				'stroke-width': 2,
				'cursor': 'default',
				'style': 'pointer-events:all',
				'xlink:title': uiStrings.pathNodeTooltip
			});
			pointGrip = pointGripContainer.appendChild(pointGrip);

			var grip = $('#pathpointgrip_'+index);
			grip.dblclick(function()
			{
				/*
				if (svgedit.path.path) {
					svgedit.path.path.setSegType();
				}
				*/
			});
		}
		if (x && y) {
			// set up the point grip element and display it
			svgedit.utilities.assignAttributes(pointGrip, {
				//'cx': x,
				//'cy': y,
                //'cx': x,
                'points': (x - svgedit.path.getPointGripSize()) + ', ' + y + ' ' + (x) + ', ' + (y - svgedit.path.getPointGripSize()) + ' ' +(x + svgedit.path.getPointGripSize()) + ', ' + y + ' ' +(x) + ', ' + (y + svgedit.path.getPointGripSize()),
                'cxx' : x,
				'cyy' : y,
				'csize' : pointGripSize,
				'display': 'inline'
			});
		}
		return pointGrip;
	};

	svgedit.path.getGripContainer = function() {
		var c = svgedit.utilities.getElem('pathpointgrip_container');
		if (!c) {
			var parent = svgedit.utilities.getElem('selectorParentGroup');
			c = parent.appendChild(document.createElementNS(NS.SVG, 'g'));
			c.id = 'pathpointgrip_container';
		}
		return c;
	};

    svgedit.path.removeCtrlGrip = function(id)
	{
        var pointGrip = svgedit.utilities.getElem('ctrlpointgrip_'+id);
        if (pointGrip)
        {
            svgedit.utilities.assignAttributes(pointGrip, {
                'display': 'none'
            });
        }
    };

    svgedit.path.removeCtrlLine = function(id)
    {
        var ctrlLine = svgedit.utilities.getElem('ctrlLine_'+id);
        if (ctrlLine)
        {
            svgedit.utilities.assignAttributes(ctrlLine, {
                'display': 'none'
            });
        }
    };

	svgedit.path.addCtrlGrip = function(id) {
		var pointGrip = svgedit.utilities.getElem('ctrlpointgrip_'+id);
		if (pointGrip) {return pointGrip;}

		pointGrip = document.createElementNS(NS.SVG, 'circle');
		svgedit.utilities.assignAttributes(pointGrip, {
			'id': 'ctrlpointgrip_' + id,
			'display': 'none',
			'r': svgedit.path.getPointCtrlSize(),
			'fill': 'none',
			'stroke': 'none',
			'stroke-width': 1,
			'cursor': 'default',
			'style': 'pointer-events:all',
			'xlink:title': uiStrings.pathCtrlPtTooltip
		});
		// svgedit.path.getGripContainer().appendChild(pointGrip);
		return pointGrip;
	};

	svgedit.path.getCtrlLine = function(id) {
		var ctrlLine = svgedit.utilities.getElem('ctrlLine_'+id);
		if (ctrlLine) {return ctrlLine;}

		ctrlLine = document.createElementNS(NS.SVG, 'line');
		svgedit.utilities.assignAttributes(ctrlLine, {
			'id': 'ctrlLine_'+id,
			'stroke': '#555',
			'stroke-width': 1,
			'style': 'pointer-events:none;display:none'
		});
		svgedit.path.getGripContainer().appendChild(ctrlLine);
		return ctrlLine;
	};

	svgedit.path.getPointCtrlSize = function()
	{
		return pointCtrlSize / svgCanvas.getCanvasScale();
	}

	svgedit.path.getPointGripSize = function()
	{
		//console.log('===================================== canvasale : ' + svgCanvas.getCanvasScale());
		return pointGripSize / svgCanvas.getCanvasScale();
	}

	svgedit.path.getPointGrip = function(seg, update) {
		var index = seg.index;
		var pointGrip = svgedit.path.addPointGrip(index);

		if (update) {
			var pt = svgedit.path.getGripPt(seg);
			svgedit.utilities.assignAttributes(pointGrip, {
				//'cx': pt.x,
				//'cy': pt.y,
                'points': (pt.x - svgedit.path.getPointGripSize()) + ', ' + pt.y + ' ' + (pt.x) + ', ' + (pt.y - svgedit.path.getPointGripSize()) + ' ' +(pt.x + svgedit.path.getPointGripSize()) + ', ' + pt.y + ' ' +(pt.x) + ', ' + (pt.y + svgedit.path.getPointGripSize()),
                'cxx' : pt.x,
                'cyy' : pt.y,
                'csize' : pointGripSize,
				'display': 'inline'
			});
		}

		return pointGrip;
	};

	svgedit.path.getControlPoints = function(seg) {
		var item = seg.item;
		var index = seg.index;
		if (!('x1' in item) || !('x2' in item)) {return null;}
		var cpt = {};
		var pointGripContainer = svgedit.path.getGripContainer();

		// Note that this is intentionally not seg.prev.item
		var prev = svgedit.path.path.segs[index-1].item;

		var seg_items = [prev, item];

		var i;
		for (i = 1; i < 3; i++) {
			var id = index + 'c' + i;

			var ctrlLine = cpt['c' + i + '_line'] = svgedit.path.getCtrlLine(id);

			var pt = svgedit.path.getGripPt(seg, {x:item['x' + i], y:item['y' + i]});
			var gpt = svgedit.path.getGripPt(seg, {x:seg_items[i-1].x, y:seg_items[i-1].y});

			svgedit.utilities.assignAttributes(ctrlLine, {
				'x1': pt.x,
				'y1': pt.y,
				'x2': gpt.x,
				'y2': gpt.y,
				'display':  ctrlLine.hasAttribute('__extshow__') ? ctrlLine.getAttribute('__extshow__') : 'inline'
			});

			cpt['c' + i + '_line'] = ctrlLine;

			// create it
			var pointGrip = cpt['c' + i] = svgedit.path.addCtrlGrip(id);

			svgedit.utilities.assignAttributes(pointGrip, {
				'cx': pt.x,
				'cy': pt.y,
				'display': pointGrip.hasAttribute('__extshow__') ? pointGrip.getAttribute('__extshow__') : 'inline'
			});
			cpt['c' + i] = pointGrip;
		}
		return cpt;
	};

// This replaces the segment at the given index. Type is given as number.
	svgedit.path.replacePathSeg = function(type, index, pts, elem) {
		var path = elem || svgedit.path.path.elem;

		var func = 'createSVGPathSeg' + pathFuncs[type];
		var seg = path[func].apply(path, pts);

		if (svgedit.browser.supportsPathReplaceItem()) {
			path.pathSegList.replaceItem(seg, index);
		} else {
			var segList = path.pathSegList;
			var len = segList.numberOfItems;
			var arr = [];
			var i;
			for (i = 0; i < len; i++) {
				var cur_seg = segList.getItem(i);
				arr.push(cur_seg);
			}
			segList.clear();
			for (i = 0; i < len; i++) {
				if (i == index) {
					segList.appendItem(seg);
				} else {
					segList.appendItem(arr[i]);
				}
			}
		}
	};

	svgedit.path.getSegSelector = function(seg, update) {
		var index = seg.index;
		var segLine = svgedit.utilities.getElem('segline_' + index);
		if (!segLine) {
			var pointGripContainer = svgedit.path.getGripContainer();
			// create segline
			segLine = document.createElementNS(NS.SVG, 'path');
			svgedit.utilities.assignAttributes(segLine, {
				'id': 'segline_' + index,
				'display': 'none',
				'fill': 'none',
				'stroke': '#0FF',
				'stroke-width': 2,
				'style':'pointer-events:none',
				'd': 'M0,0 0,0'
			});
			pointGripContainer.appendChild(segLine);
		}

		if (update) {
			var prev = seg.prev;
			if (!prev) {
				segLine.setAttribute('display', 'none');
				return segLine;
			}

			var pt = svgedit.path.getGripPt(prev);
			// Set start point
			svgedit.path.replacePathSeg(2, 0, [pt.x, pt.y], segLine);

			var pts = svgedit.path.ptObjToArr(seg.type, seg.item, true);
			var i;
			for (i = 0; i < pts.length; i += 2) {
				pt = svgedit.path.getGripPt(seg, {x:pts[i], y:pts[i+1]});
				pts[i] = pt.x;
				pts[i+1] = pt.y;
			}

			svgedit.path.replacePathSeg(seg.type, 1, pts, segLine);
		}
		return segLine;
	};

// Function: smoothControlPoints
// Takes three points and creates a smoother line based on them
//
// Parameters:
// ct1 - Object with x and y values (first control point)
// ct2 - Object with x and y values (second control point)
// pt - Object with x and y values (third point)
//
// Returns:
// Array of two "smoothed" point objects
	svgedit.path.smoothControlPoints = function(ct1, ct2, pt) {
		// each point must not be the origin
		var x1 = ct1.x - pt.x,
			y1 = ct1.y - pt.y,
			x2 = ct2.x - pt.x,
			y2 = ct2.y - pt.y;

		if ( (x1 != 0 || y1 != 0) && (x2 != 0 || y2 != 0) ) {
			var anglea = Math.atan2(y1, x1),
				angleb = Math.atan2(y2, x2),
				r1 = Math.sqrt(x1*x1+y1*y1),
				r2 = Math.sqrt(x2*x2+y2*y2),
				nct1 = editorContext_.getSVGRoot().createSVGPoint(),
				nct2 = editorContext_.getSVGRoot().createSVGPoint();
			if (anglea < 0) { anglea += 2*Math.PI; }
			if (angleb < 0) { angleb += 2*Math.PI; }

			var angleBetween = Math.abs(anglea - angleb),
				angleDiff = Math.abs(Math.PI - angleBetween)/2;

			var new_anglea, new_angleb;
			if (anglea - angleb > 0) {
				new_anglea = angleBetween < Math.PI ? (anglea + angleDiff) : (anglea - angleDiff);
				new_angleb = angleBetween < Math.PI ? (angleb - angleDiff) : (angleb + angleDiff);
			}
			else {
				new_anglea = angleBetween < Math.PI ? (anglea - angleDiff) : (anglea + angleDiff);
				new_angleb = angleBetween < Math.PI ? (angleb + angleDiff) : (angleb - angleDiff);
			}

			// rotate the points
			nct1.x = r1 * Math.cos(new_anglea) + pt.x;
			nct1.y = r1 * Math.sin(new_anglea) + pt.y;
			nct2.x = r2 * Math.cos(new_angleb) + pt.x;
			nct2.y = r2 * Math.sin(new_angleb) + pt.y;

			return [nct1, nct2];
		}
		return undefined;
	};

	svgedit.path.Segment = function(index, item) {
		this.selected = false;
		this.index = index;
		this.item = item;
		this.type = item.pathSegType;

		this.ctrlpts = [];
		this.ptgrip = null;
		this.segsel = null;
	};

    svgedit.path.Segment.prototype.cleanupCPFlag = function()
	{
        if (this.ctrlpts)
        {
            if (this.ctrlpts.hasOwnProperty('c1'))
            {
                this.ctrlpts['c1'].removeAttribute('__extshow__');
            }

            if (this.ctrlpts.hasOwnProperty('c1_line'))
            {
                this.ctrlpts['c1_line'].removeAttribute('__extshow__');
            }

            if (this.ctrlpts.hasOwnProperty('c2'))
            {
                this.ctrlpts['c2'].removeAttribute('__extshow__');
            }

            if (this.ctrlpts.hasOwnProperty('c2_line'))
            {
                this.ctrlpts['c2_line'].removeAttribute('__extshow__');
            }
        }
	}

    svgedit.path.Segment.prototype.showCtrlPtsC1 = function(y)
	{
        if (this.ctrlpts)
        {
            if (this.ctrlpts.hasOwnProperty('c1'))
            {
                this.ctrlpts['c1'].setAttribute('display', y ? 'inline' : 'none');

                this.ctrlpts['c1'].setAttribute('__extshow__', y ? 'inline' : 'none');
            }

            if (this.ctrlpts.hasOwnProperty('c1_line'))
            {
                this.ctrlpts['c1_line'].setAttribute('display', y ? 'inline' : 'none');

                this.ctrlpts['c1_line'].setAttribute('__extshow__', y ? 'inline' : 'none');
            }
        }
    };

    svgedit.path.Segment.prototype.showCtrlPtsC2 = function(y)
	{
		if (this.ctrlpts)
		{
            if (this.ctrlpts.hasOwnProperty('c2'))
            {
                this.ctrlpts['c2'].setAttribute('display', y ? 'inline' : 'none');

                this.ctrlpts['c2'].setAttribute('__extshow__', y ? 'inline' : 'none');
            }

            if (this.ctrlpts.hasOwnProperty('c2_line'))
            {
                this.ctrlpts['c2_line'].setAttribute('display', y ? 'inline' : 'none');

                this.ctrlpts['c2_line'].setAttribute('__extshow__', y ? 'inline' : 'none');
            }
		}
    };

	svgedit.path.Segment.prototype.setCtrlPtsC1 = function(posX , posY)
	{
		var cur_pts, item = this.item;

		// fix for path tool dom breakage, amending item does bad things now, so we take a copy and use that. Can probably improve to just take a shallow copy of object
		var cloneItem = $.extend({}, item);

		if (this.ctrlpts)
		{
			if (this.ctrlpts.hasOwnProperty('c1'))
			{
				if (this.ctrlpts['c1'].getAttribute('display') == 'none')
				{
					cur_pts = [cloneItem.x, cloneItem.y, posX, posY, cloneItem.x2, cloneItem.y2];

					svgedit.path.replacePathSeg(this.type, this.index, cur_pts);

					this.update(true);
				}
			}
		}
	}

	svgedit.path.Segment.prototype.setCtrlPtsC2 = function(posX , posY)
	{
		var cur_pts, item = this.item;

		// fix for path tool dom breakage, amending item does bad things now, so we take a copy and use that. Can probably improve to just take a shallow copy of object
		var cloneItem = $.extend({}, item);

		if (this.ctrlpts)
		{
			if (this.ctrlpts.hasOwnProperty('c2'))
			{
				if (this.ctrlpts['c2'].getAttribute('display') == 'none')
				{
					cur_pts = [cloneItem.x, cloneItem.y, cloneItem.x1, cloneItem.y1, posX, posY];

					svgedit.path.replacePathSeg(this.type, this.index, cur_pts);

					this.update(true);
				}
			}
		}
	}

    svgedit.path.Segment.prototype.moveCtrlPtsC1 = function(diffX , diffY)
    {
        var cur_pts, item = this.item;

        // fix for path tool dom breakage, amending item does bad things now, so we take a copy and use that. Can probably improve to just take a shallow copy of object
        var cloneItem = $.extend({}, item);

        if (this.ctrlpts)
        {
            cur_pts = [cloneItem.x, cloneItem.y, cloneItem.x1 += diffX, cloneItem.y1 += diffY, cloneItem.x2, cloneItem.y2];

            svgedit.path.replacePathSeg(this.type, this.index, cur_pts);

            this.update(true);
        }
    }

    svgedit.path.Segment.prototype.moveCtrlPtsC2 = function(diffX , diffY)
	{
        var cur_pts, item = this.item;

        // fix for path tool dom breakage, amending item does bad things now, so we take a copy and use that. Can probably improve to just take a shallow copy of object
        var cloneItem = $.extend({}, item);

        if (this.ctrlpts)
        {
            cur_pts = [cloneItem.x, cloneItem.y, cloneItem.x1, cloneItem.y1, cloneItem.x2 += diffX, cloneItem.y2 += diffY];

            svgedit.path.replacePathSeg(this.type, this.index, cur_pts);

            this.update(true);
        }
	}

	svgedit.path.Segment.prototype.showCtrlPts = function(y) {
		var i;
		for (i in this.ctrlpts) {
			if (this.ctrlpts.hasOwnProperty(i))
			{
				var newY = y;

				if (y && this.ctrlpts[i].hasAttribute('__extshow__'))
				{
                    newY = (this.ctrlpts[i].getAttribute('__extshow__') === 'inline');

                    //console.log('============================================= show ctrl pts: ' + newY + ', ' + this.ctrlpts[i].getAttribute('__extshow__'));
				}

                this.ctrlpts[i].setAttribute('display', newY ? 'inline' : 'none');
			}
		}
	};

	svgedit.path.Segment.prototype.selectCtrls = function(y) {
		$('#ctrlpointgrip_' + this.index + 'c1, #ctrlpointgrip_' + this.index + 'c2').
		attr('fill', y ? '#0FF' : '#EEE');
	};

	svgedit.path.Segment.prototype.show = function(y) {
		if (this.ptgrip) {
			this.ptgrip.setAttribute('display', y ? 'inline' : 'none');
			this.segsel.setAttribute('display', y ? 'inline' : 'none');
			// Show/hide all control points if available
			this.showCtrlPts(y);
		}
	};

	svgedit.path.Segment.prototype.select = function(y) {
		if (this.ptgrip) {
			this.ptgrip.setAttribute('stroke', y ? '#F00' : ptGripColor);
			//this.segsel.setAttribute('display', y ? 'inline' : 'none');
			this.segsel.setAttribute('display' , 'none');
			if (this.ctrlpts) {
				this.selectCtrls(y);
			}
			this.selected = y;
		}
	};

	svgedit.path.Segment.prototype.addGrip = function() {
		this.ptgrip = svgedit.path.getPointGrip(this, true);
		this.ctrlpts = svgedit.path.getControlPoints(this, true);
		this.segsel = svgedit.path.getSegSelector(this, true);
	};

	svgedit.path.Segment.prototype.update = function(full) {
		if (this.ptgrip) {
			var pt = svgedit.path.getGripPt(this);
			svgedit.utilities.assignAttributes(this.ptgrip, {
				//'cx': pt.x,
				//'cy': pt.y
                'cxx' : pt.x,
                'cyy' : pt.y,
                'csize' : pointGripSize,
                'points': (pt.x - svgedit.path.getPointGripSize()) + ', ' + pt.y + ' ' + (pt.x) + ', ' + (pt.y - svgedit.path.getPointGripSize()) + ' ' +(pt.x + svgedit.path.getPointGripSize()) + ', ' + pt.y + ' ' +(pt.x) + ', ' + (pt.y + svgedit.path.getPointGripSize()),
			});

			svgedit.path.getSegSelector(this, true);

			if (this.ctrlpts) {
				if (full) {
					this.item = svgedit.path.path.elem.pathSegList.getItem(this.index);
					this.type = this.item.pathSegType;
				}
				svgedit.path.getControlPoints(this);
			}
			// this.segsel.setAttribute('display', y?'inline':'none');
		}
	};

	svgedit.path.Segment.prototype.move = function(dx, dy)
	{
		var cur_pts, item = this.item;

		// fix for path tool dom breakage, amending item does bad things now, so we take a copy and use that. Can probably improve to just take a shallow copy of object
		var cloneItem = $.extend({}, item);

		if (this.ctrlpts)
		{
            if (this.ctrlpts.hasOwnProperty('c2') && false)//this.ctrlpts['c2'].getAttribute('__extshow__') == 'none')
            {
                cloneItem.x += dx;
                cloneItem.y += dy;

                cur_pts = [cloneItem.x, cloneItem.y, cloneItem.x1, cloneItem.y1, cloneItem.x, cloneItem.y];
            }
            else
			{
                cur_pts = [cloneItem.x += dx, cloneItem.y += dy, cloneItem.x1, cloneItem.y1, cloneItem.x2 += dx * 0, cloneItem.y2 += dy * 0];
			}
		}
		else
		{
			cur_pts = [cloneItem.x += dx, cloneItem.y += dy];
		}
		//fix
		svgedit.path.replacePathSeg(this.type, this.index, cur_pts);

		/*

		console.log("------------------------------------S"+this.ctrlpts);
		console.log(cloneItem);

		if (this.next && this.next.ctrlpts) {
			var next = this.next.item;
			var next_pts = [next.x, next.y,
				next.x1 += dx, next.y1 += dy, next.x2, next.y2];
			svgedit.path.replacePathSeg(this.next.type, this.next.index, next_pts);
		}
		 */

		if (this.mate) {
			// The last point of a closed subpath has a 'mate',
			// which is the 'M' segment of the subpath
			item = this.mate.item;
			var pts = [item.x += dx, item.y += dy];
			svgedit.path.replacePathSeg(this.mate.type, this.mate.index, pts);
			// Has no grip, so does not need 'updating'?
		}
		else if (this.index == 0)
		{
            var pts = [item.x += dx, item.y += dy];
            svgedit.path.replacePathSeg(this.type, this.index, pts);
		}

		this.update(true);

		if (this.next)
		{
            if (this.next.ctrlpts)
            {
                if (this.next.ctrlpts.hasOwnProperty('c1') && false)//this.next.ctrlpts['c1'].getAttribute('__extshow__') == 'none')
                {
                    var nexCloneItem = $.extend({}, this.next.item);

                    var next_pts = [nexCloneItem.x, nexCloneItem.y, cloneItem.x, cloneItem.y ,nexCloneItem.x2, nexCloneItem.y2];

                    svgedit.path.replacePathSeg(this.next.type, this.next.index, next_pts);
                }
            }

			this.next.update(true);
		}
	};

	svgedit.path.Segment.prototype.setLinked = function(num) {
		var seg, anum, pt;
		if (num == 2) {
			anum = 1;
			seg = this.next;
			if (!seg) {return;}
			pt = this.item;
		} else {
			anum = 2;
			seg = this.prev;
			if (!seg) {return;}
			pt = seg.item;
		}

		var item = seg.item;
		// fix for path tool dom breakage, amending item does bad things now, so we take a copy and use that. Can probably improve to just take a shallow copy of object
		var cloneItem = $.extend({}, item);
		cloneItem['x' + anum ] = pt.x + (pt.x - this.item['x' + num]);
		cloneItem['y' + anum ] = pt.y + (pt.y - this.item['y' + num]);

		var pts = [cloneItem.x, cloneItem.y,
			cloneItem.x1, cloneItem.y1,
			cloneItem.x2, cloneItem.y2];
		//end fix


		svgedit.path.replacePathSeg(seg.type, seg.index, pts);
		seg.update(true);
	};

	svgedit.path.Segment.prototype.getPosition = function()
	{
		var item = this.item;

		// fix for path tool dom breakage, amending item does bad things now, so we take a copy and use that. Can probably improve to just take a shallow copy of object
		var cloneItem = $.extend({}, item);

		return cloneItem;
	};

	svgedit.path.Segment.prototype.moveCtrl = function(num, dx, dy) {
		var item = this.item;

		// fix for path tool dom breakage, amending item does bad things now, so we take a copy and use that. Can probably improve to just take a shallow copy of object
		var cloneItem = $.extend({}, item);
		cloneItem['x' + num] += dx;
		cloneItem['y' + num] += dy;

		var pts = [cloneItem.x,cloneItem.y,
			cloneItem.x1,cloneItem.y1, cloneItem.x2,cloneItem.y2];
		// end fix

		svgedit.path.replacePathSeg(this.type, this.index, pts);
		this.update(true);

		// Check distance
		if (num == 1)
		{
			if (this.prev)
			{
				var dist = (this.prev.getPosition().x - this.getPosition().x1) * (this.prev.getPosition().x - this.getPosition().x1) +
					(this.prev.getPosition().y - this.getPosition().y1) * (this.prev.getPosition().y - this.getPosition().y1);
				
				if (dist < fuzzyShrinkDistance)
				{
					this.showCtrlPtsC1(false);

					svgedit.path.path.dragctrl = false;
					svgedit.path.path.clearSelection();
				}
			}
		}
		else
		{
			var dist = (this.getPosition().x - this.getPosition().x2) * (this.getPosition().x - this.getPosition().x2) +
				(this.getPosition().y - this.getPosition().y2) * (this.getPosition().y - this.getPosition().y2);

			if (dist < fuzzyShrinkDistance)
			{
				this.showCtrlPtsC2(false);

				svgedit.path.path.dragctrl = false;
				svgedit.path.path.clearSelection();
			}
		}
	};

	svgedit.path.Segment.prototype.setType = function(new_type, pts) {
		svgedit.path.replacePathSeg(new_type, this.index, pts);
		this.type = new_type;
		this.item = svgedit.path.path.elem.pathSegList.getItem(this.index);
		this.showCtrlPts(new_type === 6);
		this.ctrlpts = svgedit.path.getControlPoints(this);
		this.update(true);
	};

	svgedit.path.Path = function(elem) {
		if (!elem || elem.tagName !== 'path') {
			throw 'svgedit.path.Path constructed without a <path> element';
		}

		this.elem = elem;
		this.segs = [];
		this.selected_pts = [];
		svgedit.path.path = this;

		this.init();
	};

// Reset path data
	svgedit.path.Path.prototype.init = function() {
		// Hide all grips, etc

		//fixed, needed to work on all found elements, not just first
		$(svgedit.path.getGripContainer()).find('*').each( function() { $(this).attr('display', 'none') });

		var segList = this.elem.pathSegList;
		var len = segList.numberOfItems;
		this.segs = [];
		this.selected_pts = [];
		this.first_seg = null;

		// Set up segs array
		var i;
		for (i = 0; i < len; i++) {
			var item = segList.getItem(i);
			var segment = new svgedit.path.Segment(i, item);
			segment.path = this;
			this.segs.push(segment);
		}

		var segs = this.segs;
		var start_i = null;

		for (i = 0; i < len; i++) {
			var seg = segs[i];
			var next_seg = (i+1) >= len ? null : segs[i+1];
			var prev_seg = (i-1) < 0 ? null : segs[i-1];
			var start_seg;
			if (seg.type === 2) {
				if (prev_seg && prev_seg.type !== 1) {
					// New sub-path, last one is open,
					// so add a grip to last sub-path's first point
					start_seg = segs[start_i];
					start_seg.next = segs[start_i+1];
					start_seg.next.prev = start_seg;
					start_seg.addGrip();
				}
				// Remember that this is a starter seg
				start_i = i;
			} else if (next_seg && next_seg.type === 1) {
				// This is the last real segment of a closed sub-path
				// Next is first seg after "M"
				seg.next = segs[start_i+1];

				// First seg after "M"'s prev is this
				seg.next.prev = seg;
				seg.mate = segs[start_i];
				seg.addGrip();
				if (this.first_seg == null) {
					this.first_seg = seg;
				}
			} else if (!next_seg) {
				if (seg.type !== 1) {
					// Last seg, doesn't close so add a grip
					// to last sub-path's first point
					start_seg = segs[start_i];
					start_seg.next = segs[start_i+1];
					start_seg.next.prev = start_seg;
					start_seg.addGrip();
					seg.addGrip();

					if (!this.first_seg) {
						// Open path, so set first as real first and add grip
						this.first_seg = segs[start_i];
					}
				}
			} else if (seg.type !== 1){
				// Regular segment, so add grip and its "next"
				seg.addGrip();

				// Don't set its "next" if it's an "M"
				if (next_seg && next_seg.type !== 2) {
					seg.next = next_seg;
					seg.next.prev = seg;
				}
			}
		}
		return this;
	};

	svgedit.path.Path.prototype.eachSeg = function(fn) {
		var i;
		var len = this.segs.length;
		for (i = 0; i < len; i++) {
			var ret = fn.call(this.segs[i], i);
			if (ret === false) {break;}
		}
	};

    svgedit.path.Path.prototype.scissorSeg = function(_x , _y , index , r)
    {
    	var isClosed = false;
        svgedit.path.path.eachSeg(function(i)
		{
            if (this.type === 2)
            {

            }
            if (this.type === 1)
            {
                isClosed = true;
            }
        });

        if (isClosed == false)
		{
            var seg = this.segs[index];
            if (!seg.prev) {return;}

            var prev = seg.prev;
            var next = seg.next;
            var newseg, new_x, new_y;

            // http://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm#Geometric_interpretation
            var p0_x = (prev.item.x * (1.0 - r) + seg.item.x1 * r);
            var p0_y = (prev.item.y * (1.0 - r) + seg.item.y1 * r);

            var p1_x = (seg.item.x1 * (1.0 - r) + seg.item.x2 * r);
            var p1_y = (seg.item.y1 * (1.0 - r) + seg.item.y2 * r);

            var p2_x = (seg.item.x2 * (1.0 - r) + seg.item.x * r);
            var p2_y = (seg.item.y2 * (1.0 - r) + seg.item.y * r);

            var p01_x = (p0_x * (1.0 - r) + p1_x * r);
            var p01_y = (p0_y * (1.0 - r) + p1_y * r);

            var p12_x = (p1_x * (1.0 - r) + p2_x * r);
            var p12_y = (p1_y * (1.0 - r) + p2_y * r);

            new_x = _x;
            new_y = _y;

            var ptsPrev = [new_x, new_y, p0_x, p0_y, p01_x, p01_y];
            svgedit.path.replacePathSeg(seg.type, index, ptsPrev);

			/*
			 var nums = this.segs.length - index - 1;

			 for (var i = 0 ; i < nums ; ++i)
			 {
			 svgedit.path.path.init();

			 svgedit.path.path.deleteSeg(this.segs.length - 1);
			 }
			 */

            console.log(this.elem);

			/******************************************************************/
            var drawn_path = svgCanvas.addSvgElementFromJson({
                element: 'path',
                curStyles: true,
                attr: {
                    d: 'M ' + new_x + ' ' + new_y,
                    id: svgCanvas.getNextId()
                }
            });

            ///*
            var seglist = drawn_path.pathSegList;
            var nums = this.segs.length - index - 1;
            for (var i = index ; i <  this.segs.length ; ++i)
            {
                var subItem = $.extend({} , this.segs[i]);
                seglist.appendItem(subItem.item);
            }

            var ptsPrev = [seg.item.x, seg.item.y, p12_x, p12_y, p2_x, p2_y];
            svgedit.path.replacePathSeg(6 , 1 , ptsPrev , drawn_path);
            //*/

            console.log(drawn_path);

            var insertCmd = new svgedit.history.InsertElementCommand(drawn_path);
            insertCmd.prevCmdNums = 1;
            svgCanvas.undoMgr.addCommandToHistory(insertCmd);

			/******************************************************************/
            var nums = this.segs.length - index - 1;

            for (var i = 0 ; i < nums ; ++i)
            {
                svgedit.path.path.init();

                svgedit.path.path.deleteSeg(this.segs.length - 1);
            }

			/*****************************************************************/
        }
        else
		{
			///*
            var seg = this.segs[index];
            if (!seg.prev) {return;}

            var prev = seg.prev;
            var next = seg.next;
            var newseg, new_x, new_y;

            // http://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm#Geometric_interpretation
            var p0_x = (prev.item.x * (1.0 - r) + seg.item.x1 * r);
            var p0_y = (prev.item.y * (1.0 - r) + seg.item.y1 * r);

            var p1_x = (seg.item.x1 * (1.0 - r) + seg.item.x2 * r);
            var p1_y = (seg.item.y1 * (1.0 - r) + seg.item.y2 * r);

            var p2_x = (seg.item.x2 * (1.0 - r) + seg.item.x * r);
            var p2_y = (seg.item.y2 * (1.0 - r) + seg.item.y * r);

            var p01_x = (p0_x * (1.0 - r) + p1_x * r);
            var p01_y = (p0_y * (1.0 - r) + p1_y * r);

            var p12_x = (p1_x * (1.0 - r) + p2_x * r);
            var p12_y = (p1_y * (1.0 - r) + p2_y * r);

            new_x = _x;
            new_y = _y;

            svgedit.path.path.insertSeg(_x , _y , index , r);
            svgedit.path.path.init();
            svgedit.path.path.show(true).update();

			//*/
			/******************************************************************/
            var drawn_path = svgCanvas.addSvgElementFromJson({
                element: 'path',
                curStyles: true,
                attr: {
                    d: 'M ' + this.segs[(index) % this.segs.length].item.x + ' ' + this.segs[(index) % this.segs.length].item.y,
                    id: svgCanvas.getNextId()
                }
            });

            ///*
            var seglist = drawn_path.pathSegList;
            for (var i = 0 ; i <  this.segs.length ; ++i)
            {
                var subItem = $.extend({}, this.segs[(i + index + 1) % this.segs.length]);
                seglist.appendItem(subItem.item);
            }

            svgedit.path.path.init();
            svgedit.path.path.show(true).update();

            console.log(this.elem);

            var openPath = drawn_path.getAttribute('d');

            var newPath = 'M ';

            var splitPaths = openPath.split('M');
            var counter = 0;
            for (var i = 0 ; i < splitPaths.length ; ++i)
            {
                if (splitPaths[i].length > 0)
                {
                    var curPath = '';
                    if (counter == 0)
					{
                        curPath = splitPaths[i];
					}
					else
					{
						var subpaths = splitPaths[i].split('C');

                        for (var j = 0 ; j < subpaths.length ; ++j)
						{
							if (j > 0)
							{
								curPath += 'C' + subpaths[j];
							}
						}
					}

					// Chromium with 'z' , IE core with 'Z'
					curPath = curPath.replace('z' , '').replace('Z' , '');

                    newPath += curPath;

                    counter++;
                }
            }
			/******************************************************************/

            this.elem.setAttribute('d' , newPath);
            drawn_path.parentNode.removeChild(drawn_path);
            drawn_path = this.elem;
		}

        return drawn_path;
    };

	svgedit.path.Path.prototype.insertSeg = function(_x , _y , index , r)
	{
        var seg = this.segs[index];
        if (!seg.prev) {return;}

        var prev = seg.prev;
        var next = seg.next;
        var newseg, new_x, new_y;

        // http://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm#Geometric_interpretation
        var p0_x = (prev.item.x * (1.0 - r) + seg.item.x1 * r);
		var p0_y = (prev.item.y * (1.0 - r) + seg.item.y1 * r);

		var p1_x = (seg.item.x1 * (1.0 - r) + seg.item.x2 * r);
		var p1_y = (seg.item.y1 * (1.0 - r) + seg.item.y2 * r);

		var p2_x = (seg.item.x2 * (1.0 - r) + seg.item.x * r);
		var p2_y = (seg.item.y2 * (1.0 - r) + seg.item.y * r);

		var p01_x = (p0_x * (1.0 - r) + p1_x * r);
		var p01_y = (p0_y * (1.0 - r) + p1_y * r);

        var p12_x = (p1_x * (1.0 - r) + p2_x * r);
		var p12_y = (p1_y * (1.0 - r) + p2_y * r);

		new_x = _x;
        new_y = _y;

        newseg = this.elem.createSVGPathSegCurvetoCubicAbs(new_x, new_y, p0_x, p0_y, p01_x, p01_y);
        svgedit.path.insertItemBefore(this.elem, newseg, index);

        var ptsPrev = [seg.item.x, seg.item.y, p12_x, p12_y, p2_x, p2_y];
        svgedit.path.replacePathSeg(seg.type, index + 1, ptsPrev);
	};

	svgedit.path.Path.prototype.addSeg = function(index) {
		// Adds a new segment
		var seg = this.segs[index];
		if (!seg.prev) {return;}

		var prev = seg.prev;
		var newseg, new_x, new_y;
		switch(seg.item.pathSegType) {
			case 4:
				new_x = (seg.item.x + prev.item.x) / 2;
				new_y = (seg.item.y + prev.item.y) / 2;
				newseg = this.elem.createSVGPathSegLinetoAbs(new_x, new_y);
				break;
			case 6: //make it a curved segment to preserve the shape (WRS)
					// http://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm#Geometric_interpretation
				var p0_x = (prev.item.x + seg.item.x1)/2;
				var p1_x = (seg.item.x1 + seg.item.x2)/2;
				var p2_x = (seg.item.x2 + seg.item.x)/2;
				var p01_x = (p0_x + p1_x)/2;
				var p12_x = (p1_x + p2_x)/2;
				new_x = (p01_x + p12_x)/2;
				var p0_y = (prev.item.y + seg.item.y1)/2;
				var p1_y = (seg.item.y1 + seg.item.y2)/2;
				var p2_y = (seg.item.y2 + seg.item.y)/2;
				var p01_y = (p0_y + p1_y)/2;
				var p12_y = (p1_y + p2_y)/2;
				new_y = (p01_y + p12_y)/2;
				newseg = this.elem.createSVGPathSegCurvetoCubicAbs(new_x, new_y, p0_x, p0_y, p01_x, p01_y);
				var pts = [seg.item.x, seg.item.y, p12_x, p12_y, p2_x, p2_y];
				svgedit.path.replacePathSeg(seg.type, index, pts);
				break;
		}

		svgedit.path.insertItemBefore(this.elem, newseg, index);
	};

	svgedit.path.Path.prototype.deleteSeg = function(index) {
		var seg = this.segs[index];
		var list = this.elem.pathSegList;

		seg.show(false);
		var next = seg.next;
		var pt;
		if (seg.mate) {
			// Make the next point be the "M" point
			pt = [next.item.x, next.item.y];
			svgedit.path.replacePathSeg(2, next.index, pt);

			// Reposition last node
			svgedit.path.replacePathSeg(4, seg.index, pt);

			list.removeItem(seg.mate.index);
		} else if (!seg.prev) {
			// First node of open path, make next point the M
			var item = seg.item;
			pt = [next.item.x, next.item.y];
			svgedit.path.replacePathSeg(2, seg.next.index, pt);
			list.removeItem(index);
		} else {
			list.removeItem(index);
		}
	};

	svgedit.path.Path.prototype.subpathIsClosed = function(index) {
		var closed = false;
		// Check if subpath is already open
		svgedit.path.path.eachSeg(function(i) {
			if (i <= index) {return true;}
			if (this.type === 2) {
				// Found M first, so open
				return false;
			}
			if (this.type === 1) {
				// Found Z first, so closed
				closed = true;
				return false;
			}
		});

		return closed;
	};

	svgedit.path.Path.prototype.removePtFromSelection = function(index) {
		var pos = this.selected_pts.indexOf(index);
		if (pos == -1) {
			return;
		}
		this.segs[index].select(false);
		this.selected_pts.splice(pos, 1);
	};

	svgedit.path.Path.prototype.clearSelection = function() {
		this.eachSeg(function() {
			// 'this' is the segment here
			this.select(false);
		});
		this.selected_pts = [];
	};

	svgedit.path.Path.prototype.storeD = function() {
		this.last_d = this.elem.getAttribute('d');
	};

	svgedit.path.Path.prototype.show = function(y) {
		// Shows this path's segment grips
		this.eachSeg(function() {
			// 'this' is the segment here
			this.show(y);
		});
		if (y) {
			this.selectPt(this.first_seg.index);
		}
		return this;
	};

// Move selected points
	svgedit.path.Path.prototype.movePts = function(d_x, d_y , isRelated) {
		var i = this.selected_pts.length;
		while(i--) {
			var seg = this.segs[this.selected_pts[i]];
			seg.move(d_x, d_y);

			if (isRelated == true)
			{
                seg.moveCtrlPtsC2(d_x , d_y);

                if (seg.next)
                {
                    seg.next.moveCtrlPtsC1(d_x , d_y);
                }
			}
		}
	};

	svgedit.path.Path.prototype.moveCtrl = function(d_x, d_y) {
		var seg = this.segs[this.selected_pts[0]];
		seg.moveCtrl(this.dragctrl, d_x, d_y);
		if (link_control_pts || svgCanvas.bitmapUtils.shiftKeyDown())
		{
			seg.setLinked(this.dragctrl);
		}
	};

	svgedit.path.Path.prototype.setSegType = function(new_type) {
		this.storeD();
		var i = this.selected_pts.length;
		var text;
		while(i--) {
			var sel_pt = this.selected_pts[i];

			// Selected seg
			var cur = this.segs[sel_pt];
			var prev = cur.prev;
			if (!prev) {continue;}

			if (!new_type) { // double-click, so just toggle
				text = 'Toggle Path Segment Type';

				// Toggle segment to curve/straight line
				var old_type = cur.type;

				new_type = (old_type == 6) ? 4 : 6;
			}

			new_type = Number(new_type);

			var cur_x = cur.item.x;
			var cur_y = cur.item.y;
			var prev_x = prev.item.x;
			var prev_y = prev.item.y;
			var points;
			switch ( new_type ) {
				case 6:
					if (cur.olditem) {
						var old = cur.olditem;
						points = [cur_x, cur_y, old.x1, old.y1, old.x2, old.y2];
					} else {
						var diff_x = cur_x - prev_x;
						var diff_y = cur_y - prev_y;
						// get control points from straight line segment
						/*
						 var ct1_x = (prev_x + (diff_y/2));
						 var ct1_y = (prev_y - (diff_x/2));
						 var ct2_x = (cur_x + (diff_y/2));
						 var ct2_y = (cur_y - (diff_x/2));
						 */
						//create control points on the line to preserve the shape (WRS)
						var ct1_x = (prev_x + (diff_x/3));
						var ct1_y = (prev_y + (diff_y/3));
						var ct2_x = (cur_x - (diff_x/3));
						var ct2_y = (cur_y - (diff_y/3));
						points = [cur_x, cur_y, ct1_x, ct1_y, ct2_x, ct2_y];
					}
					break;
				case 4:
					points = [cur_x, cur_y];

					// Store original prevve segment nums
					cur.olditem = cur.item;
					break;
			}

			cur.setType(new_type, points);
		}
		svgedit.path.path.endChanges(text);
	};

	svgedit.path.Path.prototype.selectPt = function(pt, ctrl_num) {
		this.clearSelection();
		if (pt == null) {
			this.eachSeg(function(i) {
				// 'this' is the segment here.
				if (this.prev) {
					pt = i;
				}
			});
		}
		this.addPtsToSelection(pt);
		if (ctrl_num) {
			this.dragctrl = ctrl_num;

			if (link_control_pts) {
				this.segs[pt].setLinked(ctrl_num);
			}
		}
	};

// Update position of all points
	svgedit.path.Path.prototype.update = function() {
		var elem = this.elem;
		if (svgedit.utilities.getRotationAngle(elem)) {
			this.matrix = svgedit.math.getMatrix(elem);
			this.imatrix = this.matrix.inverse();
		} else {
			this.matrix = null;
			this.imatrix = null;
		}

		this.eachSeg(function(i) {
			this.item = elem.pathSegList.getItem(i);
			this.update();
		});

		return this;
	};

	svgedit.path.getPath_ = function(elem) {
		var p = pathData[elem.id];
		if (!p) {
			p = pathData[elem.id] = new svgedit.path.Path(elem);
		}
		return p;
	};

	svgedit.path.removePath_ = function(id) {
		if (id in pathData) {delete pathData[id];}
	};
	var newcx, newcy, oldcx, oldcy, angle;
	var getRotVals = function(x, y) {
		var dx = x - oldcx;
		var dy = y - oldcy;

		// rotate the point around the old center
		var r = Math.sqrt(dx*dx + dy*dy);
		var theta = Math.atan2(dy, dx) + angle;
		dx = r * Math.cos(theta) + oldcx;
		dy = r * Math.sin(theta) + oldcy;

		// dx,dy should now hold the actual coordinates of each
		// point after being rotated

		// now we want to rotate them around the new center in the reverse direction
		dx -= newcx;
		dy -= newcy;

		r = Math.sqrt(dx*dx + dy*dy);
		theta = Math.atan2(dy, dx) - angle;

		return {'x': r * Math.cos(theta) + newcx,
			'y': r * Math.sin(theta) + newcy};
	};

// If the path was rotated, we must now pay the piper:
// Every path point must be rotated into the rotated coordinate system of 
// its old center, then determine the new center, then rotate it back
// This is because we want the path to remember its rotation

// TODO: This is still using ye olde transform methods, can probably
// be optimized or even taken care of by recalculateDimensions
	svgedit.path.recalcRotatedPath = function() {
		var current_path = svgedit.path.path.elem;
		angle = svgedit.utilities.getRotationAngle(current_path, true);
		if (!angle) {return;}
//	selectedBBoxes[0] = svgedit.path.path.oldbbox;
		var box = svgedit.utilities.getBBox(current_path),
			oldbox = svgedit.path.path.oldbbox; //selectedBBoxes[0],
		oldcx = oldbox.x + oldbox.width/2;
		oldcy = oldbox.y + oldbox.height/2;
		newcx = box.x + box.width/2;
		newcy = box.y + box.height/2;

		// un-rotate the new center to the proper position
		var dx = newcx - oldcx,
			dy = newcy - oldcy,
			r = Math.sqrt(dx*dx + dy*dy),
			theta = Math.atan2(dy, dx) + angle;

		newcx = r * Math.cos(theta) + oldcx;
		newcy = r * Math.sin(theta) + oldcy;

		var list = current_path.pathSegList,
			i = list.numberOfItems;
		while (i) {
			i -= 1;
			var seg = list.getItem(i),
				type = seg.pathSegType;
			if (type == 1) {continue;}

			var rvals = getRotVals(seg.x, seg.y),
				points = [rvals.x, rvals.y];
			if (seg.x1 != null && seg.x2 != null) {
				var c_vals1 = getRotVals(seg.x1, seg.y1);
				var c_vals2 = getRotVals(seg.x2, seg.y2);
				points.splice(points.length, 0, c_vals1.x , c_vals1.y, c_vals2.x, c_vals2.y);
			}
			svgedit.path.replacePathSeg(type, i, points);
		} // loop for each point

		box = svgedit.utilities.getBBox(current_path);
//	selectedBBoxes[0].x = box.x; selectedBBoxes[0].y = box.y;
//	selectedBBoxes[0].width = box.width; selectedBBoxes[0].height = box.height;

		// now we must set the new transform to be rotated around the new center
		var R_nc = svgroot.createSVGTransform(),
			tlist = svgedit.transformlist.getTransformList(current_path);
		R_nc.setRotate((angle * 180.0 / Math.PI), newcx, newcy);
		tlist.replaceItem(R_nc,0);
	};

// ====================================
// Public API starts here

	svgedit.path.clearData =  function() {
		pathData = {};
	};

}());
