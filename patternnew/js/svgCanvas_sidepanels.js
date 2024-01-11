//aside panels tools
    var svgPathElements = [];
    var svgPath_len = 0;
    var svgNS = "http://www.w3.org/2000/svg";
    var count = false;
    var idnum = 0;
    var publicCount = 0;
    var An_point1,anglePath_vertor = [];
    var mouseEvt;
    var RulerArr = [];
    var conversion = 10;//换算像素单位的倍率

paper.install(window);
paper.setup();
//清除浏览器自带右键效果
    document.getElementById("workarea").oncontextmenu = function(e) {
        return false;
    }
    document.getElementById("PopupBox").oncontextmenu = function(e) {
        return false;
    }
    document.getElementById("showBOX").oncontextmenu = function(e) {
        return false;
    }



    svgPathElements = $("#svgcontent g").find("path");

    //获取path路径
    function refresh(){
        svgPathElements = $("#svgcontent g").find("path");
        svgPath_len = svgPathElements.length;
    }
    setInterval(refresh,1000);


//top工具栏
    //clear all path
    $("#ClearAll").click(function(){
        $("#svgcontent g").children().remove();
        addhtmltoExplicate({ title:"删除所有要素", step:"删除所有要素"})
    });

    //delete entity
  /*  $("#delete_entity").click(function(){
        if(svgPath_len > 0) { $(this).removeClass("disabled");addhtmltoExplicate({ title:"删除对象", step:"请点击需要删除的对象！右键确认删除"}) }
    })
*/

$("#Buttons").click(function ()
{
    $(this).removeClass("disabled");
    $("#ButtonInp").siblings().hide();
    $("#ButtonInp").show();
    addhtmltoExplicate({title: "扣子", step: "先输入数值，左键点击扣子的起点和终点，右键生成基线！"});
    addButtons();
})
function addButtons()
{
    var nodeG,nodeLine,clickFirsrt = true,clickNext = false,buttonG;
    var buttGroup,nowId,nowElem;
    var svgroot = document.getElementById("svgroot");
    if($("#svgcontent #pointButtonLineGroup").length < 1){
        nodeG = document.createElementNS(svgNS,"g");
        nodeG.setAttribute("id","pointButtonLineGroup");
        $("#svgcontent").append(nodeG);
    }
    if($("#svgcontent #pointButtonGroup").length < 1){
        buttonG = document.createElementNS(svgNS,"g");
        buttonG.setAttribute("id","pointButtonGroup");
        $("#svgcontent").append(buttonG);
    }
    svgroot.onmousedown = function (evt) {
        if($("#Buttons").hasClass('tool_button_selected')){
            if (evt.button == 0) {
                if (clickFirsrt && !clickNext) {
                    addhtmltoExplicate({title: "扣子", step: "先输入数值，左键点击扣子的起点和终点，右键生成基线！"});
                    nodeLine = document.createElementNS(svgNS, "line");
                    nodeLine.setAttribute("id", "buttonLine_" + idnum);
                    nowId = idnum;
                    buttGroup = document.createElementNS(svgNS, "g");
                    buttGroup.setAttribute("id", "buttonGroup_" + idnum);
                    $("#pointButtonGroup").append(buttGroup);
                    idnum++;
                    var p1 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                    nodeLine.setAttribute("x1", p1.x);
                    nodeLine.setAttribute("y1", p1.y);
                    clickNext = true;
                    clickFirsrt = false;
                    svgroot.onmousemove = function (evt) {
                        var p2 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                        nodeLine.setAttribute("x2", p2.x);
                        nodeLine.setAttribute("y2", p2.y);
                        nodeLine.setAttribute("style", "stroke:#fff;stroke-width:1;fill:none;");
                        $("#pointButtonLineGroup").append(nodeLine);
                    };
                } else if (clickFirsrt && clickNext) {
                    var diameter = $("#diameter").val();
                    var buttonCount = $("#ButtonCount").val();
                    nowElem = $('path#buttonLine_' + nowId).get(0);
                    if (diameter > 0 && buttonCount > 0) {
                        nowElem.setAttribute("stroke-dasharray", "5,5");
                        nowElem.setAttribute("stroke", "green");
                        addEachButton(nowElem, diameter, buttonCount, buttGroup);
                    } else {
                        nowElem.setAttribute("stroke", "#fff");
                        nowElem.setAttribute("stroke-dasharray", "5,5");
                    }
                }
            }
            if (evt.button == 2) {
                if (clickNext && !clickFirsrt) {
                    svgroot.onmousemove = null;
                    var p2 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                    nodeLine.setAttribute("x2", p2.x);
                    nodeLine.setAttribute("y2", p2.y);
                    svgCanvas.convertToPath(nodeLine);
                    nowElem = $('#buttonLine_' + nowId).get(0);
                    var diameter = $("#diameter").val();
                    var buttonCount = $("#ButtonCount").val();
                    if (diameter > 0 && buttonCount > 0) {
                        nowElem.setAttribute("stroke-dasharray", "5,5");
                        nowElem.setAttribute("stroke", "green");
                        addEachButton(nowElem, diameter, buttonCount, buttGroup);
                    } else {
                        nowElem.setAttribute("stroke", "#fff");
                        nowElem.setAttribute("stroke-dasharray", "5,5");
                    }
                    addhtmltoExplicate({title: "扣子", step: "绿色显示时可以修改数值，点左键进行预览，右键结束！"});
                    clickNext = true;
                    clickFirsrt = true;
                } else if (clickFirsrt && clickNext) {
                    if ($('#buttonGroup_' + nowId).children().length == 0) {
                        $('#buttonGroup_' + nowId).remove();
                        $('#buttonLine_' + nowId).remove();
                    } else {
                        $("#buttonLine_" + nowId).attr('stroke', "#fff");
                        var childs = $('#buttonGroup_' + nowId).children();
                        for (var i = 0; i < childs.length; i++) {
                            childs[i].setAttribute('stroke', '#fff');
                        }
                    }
                    addhtmltoExplicate({title: "扣子", step: "先输入数值，左键点击扣子的起点和终点，右键生成基线！"});
                    clickFirsrt = true;
                    clickNext = false;
                }
            }
        }
    }
}
function addEachButton(elem,diameter,buttonCount,buttGroup)
{
    var len = elem.getTotalLength();
    $(buttGroup).children().remove();
    for(var i = 1;i<=buttonCount;i++){
        var point;
        if(i==1){
            point = elem.getPointAtLength(0);
        }else if(i==buttonCount){
            point = elem.getPointAtLength(len);
        }else{
            point = elem.getPointAtLength(len*((i-1)/(buttonCount-1)));
        }
        drawButton(point.x,point.y,diameter,buttGroup);
    }
}
function drawButton(x,y,diameter,buttGroup)
{
    var disy = Math.sin(45*2*Math.PI/360)*diameter/2;
    var disx = Math.cos(45*2*Math.PI/360)*diameter/2;
    var an_line2 = document.createElementNS(svgNS, "path");
    svgedit.utilities.assignAttributes(an_line2, {
        d:'M'+(x-disx)+','+(y-disy)+' L'+(x+disx)+','+(y+disy),
        stroke: "green"
    });
    $(buttGroup).append(an_line2);
    var an_line3 = document.createElementNS(svgNS, "path");
    svgedit.utilities.assignAttributes(an_line3, {
        d:'M'+(x+disx)+','+(y-disy)+' L'+(x-disx)+','+(y+disy),
        stroke: "green"
    });
    $(buttGroup).append(an_line3);
    var cir1 = document.createElementNS(svgNS, "circle");
    svgedit.utilities.assignAttributes(cir1, {
        cx: x,
        cy: y,
        r: diameter/2,
        stroke: "green",
        'fill-opacity':0
    });
    $(buttGroup).append(cir1);

}
//扣眼
$("#Buttonholes").click(function ()
{
    $(this).removeClass("disabled");
    $("#ButtonholeInp").siblings().hide();
    $("#ButtonholeInp").show();
    addhtmltoExplicate({title: "扣眼", step: "先输入数值，左键点击扣眼的起点和终点，右键生成基线！"});
    addButtonholes();
})
function addButtonholes()
{
    var nodeG,nodeLine,clickFirsrt = true,clickNext = false,buttonG;
    var buttGroup,nowId,nowElem,direction='w';
    var svgroot = document.getElementById("svgroot");
    if($("#svgcontent #pointButtonholesLineGroup").length < 1){
        nodeG = document.createElementNS(svgNS,"g");
        nodeG.setAttribute("id","pointButtonholesLineGroup");
        $("#svgcontent").append(nodeG);
    }
    if($("#svgcontent #pointButtonholesGroup").length < 1){
        buttonG = document.createElementNS(svgNS,"g");
        buttonG.setAttribute("id","pointButtonholesGroup");
        $("#svgcontent").append(buttonG);
    }
    svgroot.onmousedown = function (evt) {
        if($("#Buttonholes").hasClass('tool_button_selected')){
            if (evt.button == 0) {
                if (clickFirsrt && !clickNext) {
                    addhtmltoExplicate({title: "扣眼", step: "先输入数值，左键点击扣眼的起点和终点，右键生成基线！"});
                    nodeLine = document.createElementNS(svgNS, "line");
                    nodeLine.setAttribute("id", "buttonholeLine_" + idnum);
                    nowId = idnum;
                    buttGroup = document.createElementNS(svgNS, "g");
                    buttGroup.setAttribute("id", "buttonholeGroup_" + idnum);
                    $("#pointButtonholesGroup").append(buttGroup);
                    idnum++;
                    var p1 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                    nodeLine.setAttribute("x1", p1.x);
                    nodeLine.setAttribute("y1", p1.y);
                    clickNext = true;
                    clickFirsrt = false;
                    svgroot.onmousemove = function (evt) {
                        var p2 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                        nodeLine.setAttribute("x2", p2.x);
                        nodeLine.setAttribute("y2", p2.y);
                        nodeLine.setAttribute("style", "stroke:#fff;stroke-width:1;fill:none;");
                        $("#pointButtonholesLineGroup").append(nodeLine);
                    };
                } else if (clickFirsrt && clickNext) {
                    var diameter = $("#Buttonholediameter").val();
                    var buttonCount = $("#ButtonholeCount").val();
                    var buttonholeDeviate = $("#ButtonholeDeviate").val();
                    nowElem = $('path#buttonholeLine_' + nowId).get(0);
                    if (diameter > 0 && buttonCount > 0) {
                        nowElem.setAttribute("stroke-dasharray", "5,5");
                        nowElem.setAttribute("stroke", "green");
                        var pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                        var dir = getDirection(nowElem,pt);
                        if(evt.ctrlKey){
                            if(direction=='w'){
                                direction='n';
                            }else if(direction=='n'){
                                direction='w';
                            }else if(direction=='e'){
                                direction = 's'
                            }else if(direction=='s'){
                                direction='e'
                            }
                        }else{
                            if(direction=='w'||direction=='e'){
                                if(dir.LR.length>0){
                                    direction = 'w'
                                }else if(dir.LR.length==0){
                                    direction = 'e'
                                }
                            }else if(direction=='n'||direction=='s'){
                                if(dir.UD.length>0){
                                    direction = 'n'
                                }else if(dir.UD.length==0){
                                    direction = 's'
                                }
                            }
                        }
                        addButtonholesEach(nowElem, diameter, buttonCount, buttGroup,buttonholeDeviate,direction);
                    } else {
                        nowElem.setAttribute("stroke", "#fff");
                        nowElem.setAttribute("stroke-dasharray", "5,5");
                    }
                }
            }
            if (evt.button == 2) {
                if (clickNext && !clickFirsrt) {
                    svgroot.onmousemove = null;
                    var p2 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                    nodeLine.setAttribute("x2", p2.x);
                    nodeLine.setAttribute("y2", p2.y);
                    svgCanvas.convertToPath(nodeLine);
                    nowElem = $('#buttonholeLine_' + nowId).get(0);
                    var diameter = $("#Buttonholediameter").val();
                    var buttonCount = $("#ButtonholeCount").val();
                    var buttonholeDeviate = $("#ButtonholeDeviate").val();
                    if (diameter > 0 && buttonCount > 0) {
                        nowElem.setAttribute("stroke-dasharray", "5,5");
                        nowElem.setAttribute("stroke", "green");
                        addButtonholesEach(nowElem, diameter, buttonCount, buttGroup,buttonholeDeviate,'w');
                    } else {
                        nowElem.setAttribute("stroke", "#fff");
                        nowElem.setAttribute("stroke-dasharray", "5,5");
                    }
                    addhtmltoExplicate({title: "扣眼", step: "左键指示扣偏侧方向,绿色显示时可修改数值,点左键进行预览,(按住ctrl键可生成纵扣眼)，右键结束！"});
                    clickNext = true;
                    clickFirsrt = true;
                } else if (clickFirsrt && clickNext) {
                    if ($('#buttonholeGroup_' + nowId).children().length == 0) {
                        $('#buttonholeGroup_' + nowId).remove();
                        $('#buttonholeLine_' + nowId).remove();
                    } else {
                        $("#buttonholeLine_" + nowId).attr('stroke', "#fff");
                        var childs = $('#buttonholeGroup_' + nowId).children();
                        for (var i = 0; i < childs.length; i++) {
                            childs[i].setAttribute('stroke', '#fff');
                        }
                    }
                    addhtmltoExplicate({title: "扣眼", step: "先输入数值，左键点击扣眼的起点和终点，右键生成基线！"});
                    clickFirsrt = true;
                    clickNext = false;
                }
            }
        }
    }
}
function getDirection(nowElemStr,pt)
{
    if(typeof nowElemStr=='object'){
        nowElemStr = nowElemStr.getAttribute('d');
    }
    var len = Raphael.getTotalLength(nowElemStr);
    var center = Raphael.getPointAtLength(nowElemStr,len/2);
    var nextCenter = Raphael.getPointAtLength(nowElemStr,(len/2)+1);
    var nextpoint = Raphael.getPointAtLength(nowElemStr,(len/2)+4);
    var endpoint = getVector(center,nextCenter);
    var dis = 10000,dir={};
    var linStr1 = 'M'+(endpoint.vertor.x*dis+center.x)+','+(endpoint.vertor.y*dis+center.y)+' L'+(endpoint.Unvertor.x*dis+center.x)+','+(endpoint.Unvertor.y*dis+center.y);
    var linStr2 = 'M'+(endpoint.direction.x*10+center.x)+','+(endpoint.direction.y*10+center.y)+' L'+pt.x+','+pt.y;
    var linStr3 = 'M'+(endpoint.Undirection.x*dis+center.x)+','+(endpoint.Undirection.y*dis+center.y)+' L'+(endpoint.direction.x*dis+center.x)+','+(endpoint.direction.y*dis+center.y);
    var linStr4 = 'M'+(nextpoint.x)+','+(nextpoint.y)+' L'+pt.x+','+pt.y;
    var rt1 = Raphael.pathIntersection(linStr1,linStr2);
    var rt2 = Raphael.pathIntersection(linStr4,linStr3);
    dir.LR = rt1;
    dir.UD = rt2;
    return dir;
}
//添加扣子
function addButtonholesEach(elem,diameter,buttonCount,buttGroup,buttonholeDeviate,direction)
{
    var len = elem.getTotalLength();
    $(buttGroup).children().remove();
    for(var i = 1;i<=buttonCount;i++){
        var nowpoint,nextpoint;
        if(i==1){
            nowpoint = elem.getPointAtLength(0);
            nextpoint = elem.getPointAtLength(1);
        }else if(i==buttonCount){
            nowpoint = elem.getPointAtLength(len-1);
            nextpoint = elem.getPointAtLength(len);
        }else{
            nowpoint = elem.getPointAtLength(len*((i-1)/(buttonCount-1)));
            nextpoint = elem.getPointAtLength((len*((i-1)/(buttonCount-1)))+1);
        }
        drawButtonholes(nowpoint,nextpoint,diameter,buttGroup,buttonholeDeviate,direction);
    }
}
//画扣眼
function drawButtonholes(nowpoint,nextpoint,diameter,buttGroup,buttonholeDeviate,direction)
{
    var point = getVector(nowpoint,nextpoint);
    var start_x,start_y,end_x,end_y,dir='vertor';
    switch (direction){
        case 'w':
            start_x = nowpoint.x+point.direction.x*buttonholeDeviate;
            start_y = nowpoint.y+point.direction.y*buttonholeDeviate;
            end_x = nowpoint.x+point.Undirection.x*(diameter-buttonholeDeviate);
            end_y = nowpoint.y+point.Undirection.y*(diameter-buttonholeDeviate);
            dir = 'vertor';
            break;
        case 'e':
            start_x = nowpoint.x+point.Undirection.x*buttonholeDeviate;
            start_y = nowpoint.y+point.Undirection.y*buttonholeDeviate;
            end_x = nowpoint.x+point.direction.x*(diameter-buttonholeDeviate);
            end_y = nowpoint.y+point.direction.y*(diameter-buttonholeDeviate);
            dir = 'vertor';
            break;
        case 'n':
            start_x = nowpoint.x+point.vertor.x*buttonholeDeviate;
            start_y = nowpoint.y+point.vertor.y*buttonholeDeviate;
            end_x = nowpoint.x+point.Unvertor.x*(diameter-buttonholeDeviate);
            end_y = nowpoint.y+point.Unvertor.y*(diameter-buttonholeDeviate);
            dir = 'direction';
            break;
        case 's':
            start_x = nowpoint.x+point.Unvertor.x*buttonholeDeviate;
            start_y = nowpoint.y+point.Unvertor.y*buttonholeDeviate;
            end_x = nowpoint.x+point.vertor.x*(diameter-buttonholeDeviate);
            end_y = nowpoint.y+point.vertor.y*(diameter-buttonholeDeviate);
            dir = 'direction';
            break;
    }

    var dis = 2;
    var an_line2 = document.createElementNS(svgNS, "line");
    svgedit.utilities.assignAttributes(an_line2, {
        x1: start_x,
        y1: start_y,
        x2: end_x,
        y2: end_y,
        stroke: "green"
    });
    $(buttGroup).append(an_line2);
    var an_line3 = document.createElementNS(svgNS, "line");
    svgedit.utilities.assignAttributes(an_line3, {
        x1:start_x+point[dir].x*dis,
        y1:start_y+point[dir].y*dis,
        x2:start_x+point['Un'+dir].x*dis,
        y2:start_y+point['Un'+dir].y*dis,
        stroke: "green"
    });
    $(buttGroup).append(an_line3);
    var an_line4 = document.createElementNS(svgNS, "line");
    svgedit.utilities.assignAttributes(an_line4, {
        x1:end_x+point[dir].x*dis,
        y1:end_y+point[dir].y*dis,
        x2:end_x+point['Un'+dir].x*dis,
        y2:end_y+point['Un'+dir].y*dis,
        stroke: "green"
    });
    $(buttGroup).append(an_line4);
}

//单向省
$("#oneWayProvince").click(function () {
    $(this).removeClass("disabled");
    $("#ProvinceInp").siblings().hide();
    $("#ProvinceInp").show();
    addhtmltoExplicate({title: "单向省", step: "先输入省量，左键框选或点选省尖位置"});
    addOneWayProvince();
})
function addOneWayProvince() {
    var clickFirst=true,proviceG,endElem,removeElem,mouseTarget;
    var svgPa = $('#svgcontent').children('g').get(0);
    if($("#svgcontent #oneWayProvinceGroup").length < 1){
        proviceG = document.createElementNS(svgNS,"g");
        proviceG.setAttribute("id","oneWayProvinceGroup");
        $("#svgcontent").append(proviceG);
    }
    var svgroot = document.getElementById("svgroot");
    svgroot.onmousedown = function (evt){
        if($("#oneWayProvince").hasClass('tool_button_selected')) {
            evt.stopPropagation();
            var isCompare = false;
            if (evt.button == 0) {
                if(clickFirst) {
                    var targetElem = svgCanvas.getMouseTarget(evt);
                    if (targetElem != null && targetElem.id.substr(0, 4) == 'svg_') {
                        if ($('#ProvinceCount').val() > 0) {
                            var r = $('#ProvinceCount').val();
                            targetElem.setAttribute('stroke', '#ff2a21');
                            var len = targetElem.getTotalLength();
                            var start = targetElem.getPointAtLength(0);
                            var end = targetElem.getPointAtLength(len);
                            var endPoint ={}
                            var pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                            var result = closestPoint(targetElem, pt).length;
                            var bigPoint, smallPoint,linestart;
                            if (result > (len / 2)) {
                                bigPoint = end;
                                linestart = end;
                                endPoint.x= end.x+getVector(start,end).Unvertor.x*len;
                                endPoint.y= end.y+getVector(start,end).Unvertor.y*len;
                            } else {
                                bigPoint = start;
                                endPoint.x= start.x+getVector(start,end).vertor.x*len;
                                endPoint.y= start.y+getVector(start,end).vertor.y*len;
                                linestart = start;
                            }
                            smallPoint = endPoint;
                            var bigCircle = document.createElementNS(svgNS, "circle");
                            svgedit.utilities.assignAttributes(bigCircle, {
                                id: 'circle_1',
                                cx: bigPoint.x,
                                cy: bigPoint.y,
                                r: len,
                                stroke: 'none',
                                fill: 'none'
                            });
                            $(proviceG).append(bigCircle);
                            svgCanvas.convertToPath(bigCircle);
                            var smallCircle = document.createElementNS(svgNS, "circle");
                            svgedit.utilities.assignAttributes(smallCircle, {
                                id: 'circle_2',
                                cx: smallPoint.x,
                                cy: smallPoint.y,
                                r: r,
                                stroke: 'none',
                                fill: 'none'
                            });
                            $(proviceG).append(smallCircle);
                            svgCanvas.convertToPath(smallCircle);
                            var bigStr = $("#circle_1").attr('d');
                            var smallStr = $("#circle_2").attr('d');
                            var rtC = Raphael.pathIntersection(bigStr, smallStr);
                            var lineA = document.createElementNS(svgNS, "line");
                            svgedit.utilities.assignAttributes(lineA, {
                                id: svgCanvas.getNextId(),
                                x1: linestart.x,
                                y1: linestart.y,
                                x2: rtC[0].x,
                                y2: rtC[0].y,
                                stroke: '#0FF000',
                                fill: 'none'
                            });
                            $(svgPa).append(lineA);
                            var lineB = document.createElementNS(svgNS, "line");
                            svgedit.utilities.assignAttributes(lineB, {
                                id: svgCanvas.getNextId(),
                                x1: linestart.x,
                                y1: linestart.y,
                                x2: rtC[1].x,
                                y2: rtC[1].y,
                                stroke: '#0FF000',
                                fill: 'none'
                            });
                            $(svgPa).append(lineB);
                            $(lineA).hide();
                            $(lineB).hide();
                            addPathMark(lineA);
                            addPathMark(lineB);
                            clickFirst = false;
                            $(proviceG).children().remove();
                            svgroot.onmousemove = function (evt) {
                                var pt2 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                                var dirStr = 'M'+start.x+','+start.y+' L'+end.x+','+end.y;
                                var dir = getDirection(dirStr, pt2);
                                if (dir.LR.length <= 0) {
                                    $(lineA).show();
                                    endElem = $(lineA).attr('id');
                                    removeElem = $(lineB).attr('id');
                                    $(lineB).hide();
                                } else {
                                    $(lineB).show();
                                    endElem = $(lineB).attr('id');
                                    removeElem = $(lineA).attr('id');
                                    $(lineA).hide();
                                }
                            }
                        } else {
                            alert('注意:请输入省量!');
                        }
                    }
                }else if(!clickFirst){
                    svgroot.onmousemove = null;
                    $('#'+removeElem).remove();
                    $('#'+mouseTarget).attr('stroke',"#fff");
                    svgCanvas.convertToPath($('#'+endElem).get(0));
                    isCompare= true;
                    clickFirst = true;
                }
            }
            if(evt.button==2&&!clickFirst){
                svgroot.mousemove=null;
                $('#'+mouseTarget).attr('stroke',"#fff");
                $('#'+removeElem).remove();
                if(!isCompare){
                    $('#'+endElem).remove();
                }
            }
        }
    }
}
//省道
$("#provincialHighway").click(function () {
    $(this).removeClass("disabled");
    $("#ProvinceHighwayInp").siblings().hide();
    $("#ProvinceHighwayInp").show();
    addhtmltoExplicate({title: "省道", step: "法向省:先输入省长和省量，按住左键拖动做出省中心线.斜省:先输入省量点选做省线，再点选做省中心线"});
    addProvincialHighway();
})
function addProvincialHighway() {
    var clickFirst=true,provincialHighwayG,endElem,isMove=false,mouseTarget;
    var svgPa = $('#svgcontent').children('g').get(0);
    if($("#svgcontent #provincialHighwayG").length < 1){
        provincialHighwayG = document.createElementNS(svgNS,"g");
        provincialHighwayG.setAttribute("id","provincialHighwayG");
        $("#svgcontent").append(provincialHighwayG);
    }
    var svgroot = document.getElementById("svgroot");
    svgroot.onmousedown = function (evt){
        if($("#provincialHighway").hasClass('tool_button_selected')) {
            evt.stopPropagation();
            if (evt.button == 0) {
                if(clickFirst) {
                    var pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                    var targetElem = svgCanvas.getMouseTarget(evt);
                    if (targetElem != null && targetElem.id.substr(0, 4) == 'svg_') {
                        targetElem.setAttribute('stroke', 'red');
                        var circle = document.createElementNS(svgNS, "circle");
                        svgedit.utilities.assignAttributes(circle, {
                            id: 'provineHighCircle',
                            cx: pt.x,
                            cy: pt.y,
                            r: 2,
                            stroke: '#0FF000',
                            fill: 'green'
                        });
                        $('#provincialHighwayG').append(circle);
                        var line = document.createElementNS(svgNS, "line");
                        svgedit.utilities.assignAttributes(line, {
                            id: 'provineHighLine',
                            x1: pt.x,
                            y1: pt.y,
                            x2: pt.x,
                            y2: pt.y,
                            stroke: '#fff',
                            fill: 'none'
                        });
                        $('#provincialHighwayG').append(line);
                        svgroot.onmousemove = function (evt) {
                            var pt2 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                            line.setAttribute('x2',pt2.x);
                            line.setAttribute('y2',pt2.y);
                            isMove = true;
                        }
                        svgroot.onmouseup = function (evt) {
                            svgroot.onmousemove = null;
                            if($('#ProvinceHighwayCount').val()>0&&$('#ProvinceHighwayLength').val()>0&&isMove){
                                var pt3 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                                var highwayLength = $('#ProvinceHighwayLength').val();
                                var highwayCount = $('#ProvinceHighwayCount').val();
                                var point ={x:pt.x,y:pt.y};
                                var targetLen = targetElem.getTotalLength();
                                var len = closestPoint(targetElem,point).length;
                                if((targetLen-len)<highwayCount/2||len<highwayCount/2){
                                    alert('输入的省量不合理！')
                                }else{
                                    var prevLen = len-highwayCount/2;
                                    var nextLen = len+highwayCount/2;
                                    var nowPoint = targetElem.getPointAtLength(len);
                                    var nextPoint = targetElem.getPointAtLength(len+1);
                                    var prevStr = Raphael.getSubpath(targetElem.getAttribute('d'),0,prevLen);
                                    var nextStr = Raphael.getSubpath(targetElem.getAttribute('d'),nextLen,targetLen);
                                    targetElem.setAttribute('d',prevStr);
                                    var nextPath = document.createElementNS(svgNS, "path");
                                    svgedit.utilities.assignAttributes(nextPath, {
                                        id: svgCanvas.getNextId(),
                                        d: nextStr,
                                        stroke: '#fff',
                                        fill: 'none'
                                    });
                                    $(svgPa).append(nextPath);
                                    addPathMark(nextPath);
                                    var prevPoint = targetElem.getPointAtLength(targetLen);
                                    var nexPoint = nextPath.getPointAtLength(0);
                                    var dir = getDirection(targetElem,pt3).LR;
                                    var endPoint = {
                                        x:nowPoint.x+getVector(nowPoint,nextPoint)[dir.length<=0?'direction':'Undirection'].x*highwayLength,
                                        y:nowPoint.y+getVector(nowPoint,nextPoint)[dir.length<=0?'direction':'Undirection'].y*highwayLength,
                                    }
                                    var PathA = document.createElementNS(svgNS, "path");
                                    svgedit.utilities.assignAttributes(PathA, {
                                        id: svgCanvas.getNextId(),
                                        d:'M'+prevPoint.x+','+prevPoint.y+' L'+endPoint.x+','+endPoint.y,
                                        stroke: '#fff',
                                        fill: 'none'
                                    });
                                    $(svgPa).append(PathA);
                                    addPathMark(PathA);
                                    var PathB = document.createElementNS(svgNS, "path");
                                    svgedit.utilities.assignAttributes(PathB, {
                                        id: svgCanvas.getNextId(),
                                        d:'M'+endPoint.x+','+endPoint.y+' L'+nexPoint.x+','+nexPoint.y,
                                        stroke: '#fff',
                                        fill: 'none'
                                    });
                                    $(svgPa).append(PathB);
                                    addPathMark(PathB);
                                }
                                $(line).remove();
                                $(circle).remove();
                                targetElem.setAttribute('stroke',"#fff");
                                isMove = false;
                            }else if($('#ProvinceHighwayCount').val()<=0||$('#ProvinceHighwayLength').val()<=0){
                                $(line).remove();
                                $(circle).remove();
                                targetElem.setAttribute('stroke','#fff');
                            }
                        }
                    }
                }
            }
        }
    }
}
//省折线
$("#provinceBrokenLine").click(function () {
    $(this).removeClass("disabled");
    $("#ProvinceHighwayInp").siblings().hide();
    $("#ProvinceHighwayInp").show();
    addhtmltoExplicate({title: "省折线", step: "左键框选四条省线;"});
    addProvinceBrokenLine();

})
function addProvinceBrokenLine() {
    var clickFirst=true,provinceBrokenLinG,mouseTarget;
    var elemA={},elemB = {};
    var elemArr = [];
    var arrSelelct =[];
    var isCompare = false;
    var pathCenter=null;
    var svgPa = $('#svgcontent').children('g').get(0);
    if($("#svgcontent #provinceBrokenLinG").length < 1){
        provinceBrokenLinG = document.createElementNS(svgNS,"g");
        provinceBrokenLinG.setAttribute("id","provinceBrokenLinG");
        $("#svgcontent").append(provinceBrokenLinG);
    }
    var svgroot = document.getElementById("svgroot");
    svgroot.onmousedown = function (evt){
        if($("#provinceBrokenLine").hasClass('tool_button_selected')) {
            if (evt.button == 0) {
                if(clickFirst){
                    var targetElem = svgCanvas.getMouseTarget(evt);
                    if (targetElem != null && targetElem.id.substr(0, 4) == 'svg_') {
                        if(!isInArr(elemArr,targetElem)){
                            elemArr.push(targetElem);
                            targetElem.setAttribute('stroke','#ff2a21');
                        }
                        if(elemArr.length==4) {
                            for (var i = 0; i < elemArr.length; i++) {
                                for (var j = 0; j < elemArr.length; j++) {
                                    if(elemArr[i]!=elemArr[j]) {
                                        var pointA = getPathInterPath(elemArr[i],elemArr[j])
                                        if (pointA!=null) {
                                            for (var k = 0; k < elemArr.length; k++) {
                                                if(elemArr[j]!=elemArr[k]&&elemArr[i]!=elemArr[k]) {
                                                    var pointC = getPathInterPath(elemArr[i],elemArr[k]);
                                                    if (pointC!=null) {
                                                        if (!isInArr(arrSelelct, elemArr[i])) {
                                                            arrSelelct.push(elemArr[i]);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            if (arrSelelct.length == 2) {
                                var pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                                elemA = sortElem(elemArr,arrSelelct[0],arrSelelct[1]);
                                elemB = sortElem(elemArr,arrSelelct[1],arrSelelct[0]);
                                addOneBrokenLine(elemA,elemB,'#provinceBrokenLinG',evt);

                                if(elemA.inter == null||elemB.inter==null){return;}
                                var rt = getPathInterPath(elemA.now,elemB.now);
                                var dirA = getVector(rt,elemA.inter).vertor;
                                var dirB = getVector(rt,elemB.inter).vertor;
                                var dirCenter = {x:(dirA.x+dirB.x)/2,y:(dirA.y+dirB.y)/2};
                                var len = 1000;
                                pathCenter = 'M'+(rt.x+dirCenter.x*len)+','+(rt.y+dirCenter.y*len)+' L'+(rt.x-dirCenter.x*len)+','+(rt.y-dirCenter.y*len);
                                var pathStr = 'M'+pt.x+','+pt.y+' L'+elemB.inter.x+','+elemB.inter.y;
                                var rrt = Raphael.pathIntersection(pathCenter,pathStr);
                                if(rrt.length>0){
                                    $('#leftProvince').hide();
                                    $('#rightProvince').show();
                                }else{
                                    $('#rightProvince').hide();
                                    $('#leftProvince').show();
                                }
                                clickFirst = false;
                                for (var i = 0; i<elemArr.length; i++) {
                                    $(elemArr[i]).hide();
                                }
                                isCompare = true;
                            } else {
                                alert('连线不合理');
                                for (var i = 0;i< elemArr.length; i++) {
                                    elemArr[i].setAttribute('stroke', '#fff');
                                }
                                elemArr = [];
                                isCompare = false;
                                clickFirst = true;
                                arrSelelct = [];
                            }
                        }
                        svgroot.onmousemove = function (evt) {
                            if(isCompare){
                                var pt2 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                                if(elemA.inter == null||elemB.inter==null){return;}
                                var pathStr = 'M'+pt2.x+','+pt2.y+' L'+elemB.inter.x+','+elemB.inter.y;
                                var rrt = Raphael.pathIntersection(pathCenter,pathStr);
                                if(rrt.length>0){
                                    $('#leftProvince').hide();
                                    $('#rightProvince').show();
                                }else{
                                    $('#rightProvince').hide();
                                    $('#leftProvince').show();
                                }
                            }
                        }
                    }
                }else{
                    if(!clickFirst&&isCompare){
                        svgroot.onmousemove = null;
                        var pt3 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                        if(elemA.inter == null||elemB.inter==null){return;}
                        var pathStr = 'M'+pt3.x+','+pt3.y+' L'+elemB.inter.x+','+elemB.inter.y;
                        var rrt = Raphael.pathIntersection(pathCenter,pathStr);
                        var childs = [];
                        if(rrt.length>0){
                            childs = $('#rightProvince').children();
                        }else{
                            childs = $('#leftProvince').children();
                        }
                        if(childs.length>0){
                            for(var i = 0;i<elemArr.length;i++){
                                elemArr[i].parentNode.removeChild(elemArr[i]);
                            }
                            for(var i = 0;i<childs.length;i++){
                                $(svgPa).append(childs[i]);
                                childs[i].setAttribute('stroke','#fff');
                            }
                        }
                        if($('#provinceBrokenLinG g').length>0){
                            $('#provinceBrokenLinG g').remove();
                        }
                        clickFirst=true;
                        isCompare =false;
                        elemArr = [];
                        arrSelelct=[];
                    }
                }
            }
            if(evt.button==2){
                svgroot.onmousemove = null;
                if($('#provinceBrokenLinG g').length>0){
                    $('#provinceBrokenLinG g').remove();
                }
                for(var i=0;i<elemArr.length;i++){
                    elemArr[i].setAttribute('stroke','#fff');
                    $(elemArr[i]).show();
                }
                isCompare =false;
                clickFirst=true;
                elemArr = [];
                arrSelelct=[];
            }
        }
    }
}
function getPathInterPath(elemA,elemB) {
    var pointA = getPointData(elemA);
    var pointB = getPointData(elemB);
    var dis = 2;
    var len1 = distanceTwoPoint(pointA.start,pointB.start);
    var len2 = distanceTwoPoint(pointA.start,pointB.end);
    var len3 = distanceTwoPoint(pointA.end,pointB.start);
    var len4 = distanceTwoPoint(pointA.end,pointB.end);
    var i,j;

    if(len1<dis||len2<dis){
        return pointA.start;
    }
    if(len3<dis||len4<dis){
        return pointA.end;
    }
    return null;
}
function sortElem(elemArr,nowElem,nextElem){
    var elem = getPointData(nowElem);
    for(var i = 0;i<elemArr.length;i++){
        if(elemArr[i]!=nowElem&&elemArr[i]!=nextElem){
            var rt = getPathInterPath(elemArr[i],nowElem);
            if(rt!=null){
                elem.now = nowElem;
                elem.next = elemArr[i];
                elem.inter = rt;
            }
        }
    }
    return elem;
}
function addOneBrokenLine(elemA,elemB,gGroup,evt) {
    var rt = getPathInterPath(elemA.now,elemB.now);
    if(rt==null){return;}
    if(elemA.inter == null||elemB.inter==null){return;}
    var dirA = getVector(rt,elemA.inter).vertor;
    var dirB = getVector(rt,elemB.inter).vertor;
    var dirCenter = {x:(dirA.x+dirB.x)/2,y:(dirA.y+dirB.y)/2};
    var len = 1000;
    var pathCenter = 'M'+(rt.x+dirCenter.x*len)+','+(rt.y+dirCenter.y*len)+' L'+(rt.x-dirCenter.x*len)+','+(rt.y-dirCenter.y*len);
    function getNewPath(nowPath,nextPath,dir,oldDir,rt,group,evt) {
        var strLen = nowPath.len;
        var oldLen = nextPath.len;
        var nextRt = {x:rt.x+dir.x*strLen,y:rt.y+dir.y*strLen};
        var nowMirror = getMirrorImage(nowPath.next,nowPath.now);
        var sttr = extendPath(nowMirror,false,2000);
        var ppt = Raphael.pathIntersection(sttr,pathCenter);
        var nowStr = getPathStr(nowPath.inter,ppt[0],sttr);
        var path1 = drawLinePath({
            'id':svgCanvas.getNextId(),
            'firstP':rt,
            'nextP':rt,
            'fill':'none',
            'stroke':'green',
            'addGroup':group
        });
        path1.setAttribute('d',nowStr);
        var nowSttr = extendPath(nowPath.now,false,1000);
        var nowPpt = Raphael.pathIntersection(sttr,nowSttr);
        var newStr = getPathStr(rt,nowPpt[0],nowSttr);
        var path4 = drawLinePath({
            'id':svgCanvas.getNextId(),
            'firstP':rt,
            'nextP':rt,
            'fill':'none',
            'stroke':'green',
            'addGroup':group
        });
        path4.setAttribute('d',newStr);
        var path7 = drawLinePath({
            'id':svgCanvas.getNextId(),
            'firstP':rt,
            'nextP':rt,
            'fill':'none',
            'stroke':'green',
            'addGroup':group
        });
        path7.setAttribute('d',nowPath.next.getAttribute('d'));
        var nextMirror = getMirrorImage(sttr,pathCenter);
        var nextStr = getPathStr(nextRt,ppt[0],nextMirror);
        var path2 = drawLinePath({
            'id':svgCanvas.getNextId(),
            'firstP':rt,
            'nextP':rt,
            'fill':'none',
            'stroke':'green',
            'addGroup':group
        });
        path2.setAttribute('d',nextStr);
        var path5 = drawLinePath({
            'id':svgCanvas.getNextId(),
            'firstP':rt,
            'nextP':rt,
            'fill':'none',
            'stroke':'green',
            'addGroup':group
        });
        var nextSttr = extendPath(nextPath.now,false,1000);
        var nextPpt = Raphael.pathIntersection(nextMirror,nextSttr);
        var oldStr = getPathStr(rt,nextPpt[0],nextSttr);
        path5.setAttribute('d',oldStr);

        var isNextLi = isLine(nextPath.next.getAttribute('d'));
        var point = getPointData(nextPath.next);
        var path6 = drawLinePath({
            'id':svgCanvas.getNextId(),
            'firstP':rt,
            'nextP':rt,
            'fill':'none',
            'stroke':'green',
            'addGroup':group
        });
        path6.setAttribute('d',nextPath.next.getAttribute('d'));
        if(isNextLi){
            var llen = distanceTwoPoint(point.start,nextPath.inter);
            var nextOldStr;
            if(llen<2){
                nextOldStr = 'M' +point.end.x+','+point.end.y+' L'+nextPpt[0].x+','+nextPpt[0].y;
            }else{
                nextOldStr = 'M' +point.start.x+','+point.start.y+' L'+nextPpt[0].x+','+nextPpt[0].y;
            }
            path6.setAttribute('d',nextOldStr);
        }else{
            svgCanvas.pathActions.toEditMode(path6);
            svgCanvas.pathActions.setMouse(nextPath.inter.x,nextPath.inter.y,nextPpt[0].x,nextPpt[0].y);
            svgCanvas.pathActions.toSelectMode();
        }
        var centerStr = 'M'+rt.x+','+rt.y+' L'+ppt[0].x+','+ppt[0].y;
        var path3 = drawLinePath({
            'id':svgCanvas.getNextId(),
            'firstP':rt,
            'nextP':rt,
            'fill':'none',
            'stroke':'green',
            'addGroup':group
        });
        path3.setAttribute('d',centerStr);
    }
    var leftProvince = document.createElementNS(svgNS,"g");
    leftProvince.setAttribute('id','leftProvince');
    $(leftProvince).hide();

    $(gGroup).append(leftProvince);
        getNewPath(elemB,elemA,dirA,dirB,rt,leftProvince,evt);
    var rightProvince = document.createElementNS(svgNS,"g");
    rightProvince.setAttribute('id','rightProvince');
    $(rightProvince).hide();
    $(gGroup).append(rightProvince);
    getNewPath(elemA,elemB,dirB,dirA,rt,rightProvince,evt);
    function getPathStr(pt1,pt2,str) {
        var len1 = closestPoint(str,pt1).length;
        var len2 = closestPoint(str,pt2).length;
        var maxLen = Math.max(len1,len2);
        var minLen = Math.min(len1,len2);
        var newStr = Raphael.getSubpath(str,minLen,maxLen);
        return newStr;
    }
}
function isInArr(arr,target) {
    var isIn = false;
    for(var i=0;i<arr.length;i++){
        if(arr[i]==target){
            isIn = true;
        }
    }
    return isIn;
}

//转省
$("#TurnProvince").click(function () {
    $(this).removeClass("disabled");
    $("#ProvinceHighwayInp").siblings().hide();
    addhtmltoExplicate({title: "转省", step: "请选着所有参与转省的要素，按shift可选择参与转移的要素，按右键结束选择；"});
    addTurnProvince();
})
function addTurnProvince() {
    var clickFirst=true,clickNext=false;
    var selectElems = [],newElem=[];
    var closureBeforeElem,closureAfterElem;
    var svgPa = $('#svgcontent').children('g').get(0);
    var svgroot = document.getElementById("svgroot");
    svgroot.onmousedown = function (evt) {
        if ($("#TurnProvince").hasClass('tool_button_selected')) {
            evt.stopPropagation();
            if (evt.button == 0) {
                if (clickFirst && !clickNext) {
                    addhtmltoExplicate({title: "转省", step: "请选着所有参与转省的要素，按shift可选择参与转移的要素，按右键结束选择；"});
                    var targetElem = svgCanvas.getMouseTarget(evt);
                    if (targetElem != null && targetElem.id.substr(0, 4) == 'svg_') {
                        if (!isInArr(selectElems, targetElem)) {
                            selectElems.push(targetElem);
                            targetElem.setAttribute('stroke', '#ff2a21');
                        }

                    }
                } else if (clickNext && !clickFirst) {
                    var targetBeforeElem = svgCanvas.getMouseTarget(evt);
                    if (targetBeforeElem != null && targetBeforeElem.id.substr(0, 4) == 'svg_') {
                        targetBeforeElem.setAttribute('stroke', 'green');
                        closureBeforeElem = targetBeforeElem;
                        clickNext = true;
                        clickFirst = true;
                        addhtmltoExplicate({title: "转省", step: "请选择闭合后省线"});
                    }
                } else if (clickFirst && clickNext && closureBeforeElem != null) {
                    var targetAfterElem = svgCanvas.getMouseTarget(evt);
                    if (targetAfterElem != null && targetAfterElem.id.substr(0, 4) == 'svg_') {
                        targetAfterElem.setAttribute('stroke', 'green');
                        var segPathString = targetAfterElem.getAttribute('d');
                        var interPoint = Raphael.pathIntersection(closureBeforeElem.getAttribute('d'), segPathString);
                        if (interPoint.length === 1) {
                            var targetElemLen = closureBeforeElem.getTotalLength();
                            var startTargetPoint = closureBeforeElem.getPointAtLength(0);
                            var endTargetPoint = closureBeforeElem.getPointAtLength(targetElemLen);
                            if (((interPoint[0].x < startTargetPoint.x + 1) && (interPoint[0].x > startTargetPoint.x - 1) && (interPoint[0].y < startTargetPoint.y + 1) && (interPoint[0].y > startTargetPoint.y - 1))
                                || ((interPoint[0].x < endTargetPoint.x + 1) && (interPoint[0].x > endTargetPoint.x - 1) && (interPoint[0].y < endTargetPoint.y + 1) && (interPoint[0].y > endTargetPoint.y - 1))) {
                                var beforeElemLen = closureBeforeElem.getTotalLength();
                                var startBeforePoint = closureBeforeElem.getPointAtLength(0);
                                var endBeforePoint = closureBeforeElem.getPointAtLength(beforeElemLen);
                                if (((interPoint[0].x < startBeforePoint.x + 1) && (interPoint[0].x > startBeforePoint.x - 1) && (interPoint[0].y < startBeforePoint.y + 1) && (interPoint[0].y > startBeforePoint.y - 1))
                                    || ((interPoint[0].x < endBeforePoint.x + 1) && (interPoint[0].x > endBeforePoint.x - 1) && (interPoint[0].y < endBeforePoint.y + 1) && (interPoint[0].y > endBeforePoint.y - 1))) {
                                    addhtmltoExplicate({title: "转省", step: "请选择新省线，按右键结束选择"});
                                    closureAfterElem = targetAfterElem;
                                    clickNext = false;
                                    clickFirst = false;
                                }
                            }
                        }
                    }
                } else if (!clickFirst && !clickNext && closureAfterElem != null) {
                    var targetNewElem = svgCanvas.getMouseTarget(evt);
                    if (targetNewElem != null && targetNewElem.id.substr(0, 4) == 'svg_') {
                        if (!isInArr(newElem, targetNewElem)) {
                            newElem.push(targetNewElem);
                            targetNewElem.setAttribute('stroke', 'green');
                        }
                    }
                }
            }
            if (evt.button == 2) {
                if (clickFirst && !clickNext) {
                    if (selectElems.length > 0) {
                        addhtmltoExplicate({title: "转省", step: "请选择闭合前省线"});
                        clickFirst = false;
                        clickNext = true;
                    }
                } else if (!clickNext && !clickFirst && closureBeforeElem != null) {
                    var selectLength = selectElems.length;
                    var interP = [];
                    var angleElem = [];
                    for (var i = 0; i < selectLength; i++) {
                        selectElems[i].setAttribute('stroke', '#fff');
                    }
                    if (newElem.length == 0) {
                        selectElems = [];
                        newElem = [];
                        clickFirst = true;
                        clickNext = false;
                        closureBeforeElem = null;
                        closureAfterElem = null;
                        return;
                    } else if (newElem.length > 0) {
                        var newElemLength = newElem.length;
                        for (var i = 0; i < newElemLength; i++) {
                            for (var j = 0; j < selectLength; j++) {
                                var newPoints = getPointData(newElem[i]);
                                newPoints.start.r = 5;
                                newPoints.end.r = 5;
                                var r1 = getIntersectionPath(newPoints.start, selectElems[j]);
                                var r2 = getIntersectionPath(newPoints.end, selectElems[j]);
                                //判断每一个新省线的起点或者结束点是否与选中的元素是否有交点，如果没有交点则返回，不做任何操作
                                var r = Raphael.pathIntersection(newElem[i].getAttribute('d'), selectElems[j].getAttribute('d'));
                                if (r.length > 0 && (r1.length <= 0 && r2.length <= 0)) {
                                    return;
                                }
                                if ((r1.length > 0 || r2.length > 0) && newElem[i] != selectElems[j]) {
                                    interP.push({
                                        newPath: newElem[i],
                                        selectPath: selectElems[j],
                                        pointStart: r1.length > 0 ? newPoints.start : newPoints.end,
                                        pointEnd: r1.length > 0 ? newPoints.end : newPoints.start
                                    });
                                    if (interP !== null) {
                                        var len = selectElems[j].getTotalLength();
                                        var len3 = closestPoint(selectElems[j], interP[i].pointStart);
                                        var prevStr = Raphael.getSubpath(selectElems[j].getAttribute('d'), 0, len3.length);
                                        var nextStr = Raphael.getSubpath(selectElems[j].getAttribute('d'), len3.length, len);
                                        interP[i].selectPath.setAttribute('d', prevStr);
                                        interP[i].selectStr = prevStr;
                                        var path = document.createElementNS(svgNS, "path");
                                        svgedit.utilities.assignAttributes(path, {
                                            id: svgCanvas.getNextId(),
                                            d: nextStr,
                                            stroke: '#fff',
                                            fill: 'none'
                                        });
                                        $(svgPa).append(path);
                                        angleElem.push(path);
                                        interP[i].nextPath = path;
                                        interP[i].nextStr = nextStr;
                                    }
                                }
                                if (!isInArr(angleElem, selectElems[j])) {
                                    angleElem.push(selectElems[j]);
                                }
                            }
                        }
                        if (interP == null) {
                            return;
                        }
                        sortElems(angleElem, closureAfterElem, closureBeforeElem, newElem);
                        sortElems(angleElem, closureBeforeElem,closureAfterElem,  newElem);
                        var elems = getPathToPath(angleElem, closureAfterElem, closureBeforeElem, interP, true);
                        var elemss = getPathToPath(angleElem, closureBeforeElem, closureAfterElem, interP);
                        if(elemss==null||elems==null){return;}
                        if (!isInArr(elems, closureAfterElem)) {
                            elems.push(closureAfterElem);
                        }
                        if (!isInArr(elemss, closureBeforeElem)) {
                            elemss.push(closureBeforeElem);
                        }
                        var interPoint = Raphael.pathIntersection(closureBeforeElem.getAttribute('d'), closureAfterElem.getAttribute('d'));
                        var angle = getAngle(closureAfterElem, closureBeforeElem);
                        for (var i = 0; i < angleElem.length; i++) {
                            var pathStr = angleElem[i].getAttribute('d');
                            if (!isInArr(elems, angleElem[i])) {
                                if (isInArr(elemss, angleElem[i])) {
                                    var trans1 = 'r' + (2 * angle - 180) + ',' + interPoint[0].x + ',' + interPoint[0].y;
                                    var str1 = mapPathStraight(pathStr, Raphael.toMatrix(pathStr, trans1));
                                    angleElem[i].setAttribute('d', str1.toString());

                                } else {
                                    var trans2 = 'r' + ((2 * angle - 180) / (newElemLength)) + ',' + interPoint[0].x + ',' + interPoint[0].y;
                                    var str2 = mapPathStraight(pathStr, Raphael.toMatrix(pathStr, trans2));
                                    angleElem[i].setAttribute('d', str2.toString());
                                }
                            }
                        }
                        for(var j= 0;j<interP.length;j++){
                            var str = interP[j].selectPath.getAttribute('d');
                            var pointEnd;
                            if(str!=interP[j].selectStr){
                                pointEnd = getPointData(interP[j].selectPath).end;
                            }else{
                                pointEnd = getPointData(interP[j].nextPath).start;
                            }
                            drawLinePath({
                                id:svgCanvas.getNextId(),
                                'firstP':interP[j].pointEnd,
                                'nextP':pointEnd,
                                'stroke':'#fff',
                                'fill':'none',
                                'addGroup':svgPa
                            })
                        }
                        selectElems = [];
                        newElem = [];
                        clickFirst = true;
                        clickNext = false;
                        closureBeforeElem = null;
                        closureAfterElem = null;
                    }
                }
            }
        }
    }
}

function sortElems(selectElems,nowElem,prevElem,newElems){
    var elems = [];
    console.log(selectElems);
    var selectLen = selectElems.length;
    var newLen = newElems.length;
    var now = nowElem;
    var prev = prevElem;
    function isArr(eles,now) {
        var isIn = true;
        for(var i=0;i<eles.length;i++){
            if(eles[i].now==now){
                isIn = false;
            }
        }
        return isIn;
    }
    for(var i=0;i<selectLen;i++){
        for(var k=0;k<selectLen;k++){
            if(selectElems[k]!=now&&selectElems[k]!=prev&&i!=k){
                for(var j=0;j<newLen;j++) {
                    if (selectElems[k] != newElems[j]) {
                        if (isHaveIntersection(selectElems[k], now)&&isArr(elems,now)) {
                            elems.push({
                                'now': now,
                                'prev': prev,
                                'next': selectElems[k]
                            });
                            prev = now;
                            now = selectElems[k];
                        }
                    }
                }
            }
        }
    }
    var sortElems = [];
    var first = nowElem;
    for(var i= 0;i<elems.length;i++){
        for(var j=0;j<elems.length;j++){
            if(elems[j].now==first){
                if(!isInArr(sortElems,first)){
                    sortElems.push(first);
                }
                first = elems[j].next;
            }
        }
    }
    console.log(elems);
    console.log(sortElems);

}
function  isHaveIntersection(pathA,pathB) {
    var pointA = getPointData(pathA);
    var pointB = getPointData(pathB);
    if(isEqual(pointA.start,pointB.end)||isEqual(pointA.start,pointB.start)||isEqual(pointA.end,pointB.end)||isEqual(pointA.end,pointB.start)){
        return true;
    }else{
        return false;
    }
}
//得到一个路径的终点和起点，长度
function getPointData(elem) {
    var elemStr;
    var elemData={};
    if(typeof elem == 'string'){
        elemStr = elem;
    }else{
        elemStr = elem.getAttribute('d');
    }
    elemData.start = Raphael.getPointAtLength(elemStr,0);
    elemData.len = Raphael.getTotalLength(elemStr);
    elemData.end = Raphael.getPointAtLength(elemStr,elemData.len);
    elemData.center = Raphael.getPointAtLength(elemStr,elemData.len/2);
    elemData.dir = getVector(elemData.start,elemData.end);
    return elemData;
}
//获取两条路径的之间的对象
function getPathToPath(selects,interAfterPath,interBeforePath,interP,isMove) {
        var selectLength = selects.length;
        var elems =[];
        for(var i=0;i<selectLength;i++){
            for(var j = i;j<selectLength;j++){
                var points = getPointData(interAfterPath);
                points.start.r = 5;
                points.end.r = 5;
                if(selects[j]!=interAfterPath&&selects[j]!=interBeforePath){
                    var rtStart = getIntersectionPath(points.start,selects[j]);
                    var rtEnd = getIntersectionPath(points.end,selects[j]);
                    if((rtStart.length>0||rtEnd.length>0)) {
                        for (var k = 0; k < interP.length; k++) {
                            if ((interP[k].selectPath == interAfterPath)||(interP[k].nextPath == interAfterPath)) {
                                if(isMove){
                                    if(!isInArr(elems, interP[k].newPath)) {
                                        elems.push(interP[k].newPath)
                                    }
                                }
                                return elems;
                            } else {
                                if (!isInArr(elems, selects[j])) {
                                    elems.push(selects[j]);
                                    interBeforePath = interAfterPath;
                                    interAfterPath = selects[j];
                                }
                            }
                        }
                    }
                }
            }
        }
}

//获取两条路径的夹角
function getAngle(path1,path2) {
    var angle;
    var pathA = getPointData(path1);
    var pathB = getPointData(path2);
    var rt = Raphael.pathIntersection(path1.getAttribute('d'),path2.getAttribute('d'));
    if(rt.length>0){
        var start,end;
        if ((rt[0].x < pathA.end.x + 1) && (rt[0].x > pathA.end.x - 1) && (rt[0].y < pathA.end.y + 1) && (rt[0].y > pathA.end.y - 1)) {
            start=pathA.start;
        }else{
            start = pathA.end;
        }
        if ((rt[0].x < pathB.end.x + 1) && (rt[0].x > pathB.end.x - 1) && (rt[0].y < pathB.end.y + 1) && (rt[0].y > pathB.end.y - 1)) {
            end=pathB.start;
        }else{
            end = pathB.end;
        }
        angle = Raphael.angle(start.x,start.y,rt[0].x,rt[0].y,end.x,end.y);
    }
    return angle;
}

//枣弧省
$("#arcProvince").click(function () {
    $(this).removeClass("disabled");
    $("#ProvinceHighwayInp").siblings().hide();
    addhtmltoExplicate({title: "枣弧省", step: "左键指示省的中心点，在对话框内输入所需的数值"});
    addArcProvince();
})
function addArcProvince() {
    var clickFirst=true,arcProvinceGroup,endElem,isMove=false,mouseTarget;
    var pt;
    var svgPa = $('#svgcontent').children('g').get(0);
    if($("#svgcontent #arcProvinceGroup").length < 1){
        arcProvinceGroup = document.createElementNS(svgNS,"g");
        arcProvinceGroup.setAttribute("id","arcProvinceGroup");
        $("#svgcontent").append(arcProvinceGroup);
    }
    var svgroot = document.getElementById("svgroot");
    svgroot.onmousedown = function (evt){
        pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
        if($("#arcProvince").hasClass('tool_button_selected')) {
            if (evt.button == 0&&clickFirst) {
                addPointCircle(pt,'#arcProvinceGroup');
                $('#provinceAttr').show();
                clickFirst=false;
                function closeArcAttr() {
                    clickFirst = true;
                    $(arcProvinceGroup).children().remove();
                    $('#provinceAttr').hide();
                }
                $('.closeAttr').bind('click',closeArcAttr);
                $('#cancel').bind('click',closeArcAttr);
                $('#preview').bind('click',function(){
                    $('#arcProvinceGroup').children().remove();
                    addArc('#arcProvinceGroup',pt);
                });
            }
        }
    }
    $('#determine').bind('click',function(evt){
        evt.stopPropagation();
        $('#arcProvinceGroup').children().remove();
        addArc(svgPa,pt);
        clickFirst = true;
        $('#provinceAttr').hide();
        pt = null;
    });

    $('#provinceCurve').click(function () {
        if($(this).attr('checked')){
            $('#arcProvinceGroup').children().remove();
            addArc('#arcProvinceGroup',pt);
            $('.bar').mousedown(function (evt) {
                var event = event || window.event;
                var left = event.clientX - this.offsetLeft;
                var that = this;
                $(document).bind('mousemove',function(event){
                    var event = event || window.event;
                    that.style.left = event.clientX - left +"px";
                    var val = parseInt(that.style.left);
                    if(val<0){
                        that.style.left = 0;
                    }else if(val>140){
                        that.style.left = "140px";
                    }
                    $('#arcProvinceGroup').children().remove();
                    addArc('#arcProvinceGroup',pt);
                });
            });
            $('.bar').mouseup(function(){
                $(document).unbind('mousemove');
            })
        }
    })
}
//添加单个枣弧省
function addArc (addGroup,pt) {
    var offsetX = Number($('#offsetX').val());
    var offsetY = Number($('#offsetY').val());
    var arcProvinceCount = Number($('#arcProvinceCount').val());
    var arcProvinceLength = Number($('#arcProvinceLength').val());
    if (arcProvinceCount > 0 && arcProvinceLength > 0 && (offsetY != 0 || offsetX != 0)) {
        var r1 = arcProvinceCount / 2;
        var r2 = Math.sqrt(r1 * r1 + offsetX * offsetX + offsetY * offsetY);
        var pt1 = {x: pt.x, y: pt.y,r:r1};
        var pt2 = {x: pt.x + offsetX, y: pt.y - offsetY,r:r2};
        var rt = getIntersectionPoint(pt1,pt2);
        var path1 = drawLinePath({
            'id':svgCanvas.getNextId(),
            'firstP':pt2,
            'nextP':rt[0],
            'stroke':'#fff',
            'fill':'none',
            'addGroup':addGroup,
        });
        var path2 =drawLinePath({
            'id':svgCanvas.getNextId(),
            'firstP':pt2,
            'nextP':rt[1],
            'stroke':'#fff',
            'fill':'none',
            'addGroup':addGroup,
        });
        var dir = getVector(pt,rt[0]);
        var nextRt ={x:pt.x+dir[offsetX>=0?'direction':'Undirection'].x*arcProvinceLength,y:pt.y+dir[offsetX>=0?'direction':'Undirection'].y*arcProvinceLength};
        var path3 = drawLinePath({
            'id':svgCanvas.getNextId(),
            'firstP':rt[0],
            'nextP':nextRt,
            'stroke':'#fff',
            'fill':'none',
            'addGroup':addGroup,
        });
        var path4= drawLinePath({
            'id':svgCanvas.getNextId(),
            'firstP':rt[1],
            'nextP':nextRt,
            'stroke':'#fff',
            'fill':'none',
            'addGroup':addGroup,
        });
        var pathArr = [path1,path2,path3,path4];
        if($('#provinceCurve').attr('checked')){
            var pathA = 'M'+pt.x+','+pt.y+' L'+pt2.x+','+pt2.y;
            var pathB = 'M'+pt.x+','+pt.y+' L'+nextRt.x+','+nextRt.y;
            var left = $('.bar').position().left;
            var width = $('.barPrent').width();
            var len1 = Raphael.getTotalLength(pathA)/2;
            var len2 = Raphael.getTotalLength(pathB)/2;
            var len3 = len2*(0.3+left/(width*2));
            var len4 = len3;
            var len5 = len1*(0.3+left/(width*2));
            var len6 = len5;
            var dir = getVector(pt2,nextRt);
            var pathStr3 = 'M'+rt[0].x+','+rt[0].y+' C'+(rt[0].x+Number(dir.vertor.x*len3))+','+(rt[0].y+Number(dir.vertor.y*len3))+' '+(nextRt.x+Number(dir.Unvertor.x*len4))+','+(nextRt.y+Number(dir.Unvertor.y*len4))+' '+nextRt.x+','+nextRt.y;
            path3.setAttribute('d',pathStr3);
            var pathStr4 = 'M'+rt[1].x+','+rt[1].y+' C'+(rt[1].x+Number(dir.vertor.x*len3))+','+(rt[1].y+Number(dir.vertor.y*len3))+' '+(nextRt.x+Number(dir.Unvertor.x*len4))+','+(nextRt.y+Number(dir.Unvertor.y*len4))+' '+nextRt.x+','+nextRt.y;
            path4.setAttribute('d',pathStr4);
            var pathStr1 = 'M'+rt[0].x+','+rt[0].y+' C'+(rt[0].x+Number(dir.Unvertor.x*len5))+','+(rt[0].y+Number(dir.Unvertor.y*len5))+' '+(pt2.x+Number(dir.vertor.x*len6))+','+(pt2.y+Number(dir.vertor.y*len6))+' '+pt2.x+','+pt2.y;
            var pathStr2 = 'M'+rt[1].x+','+rt[1].y+' C'+(rt[1].x+Number(dir.Unvertor.x*len5))+','+(rt[1].y+Number(dir.Unvertor.y*len5))+' '+(pt2.x+Number(dir.vertor.x*len6))+','+(pt2.y+Number(dir.vertor.y*len6))+' '+pt2.x+','+pt2.y;
            path1.setAttribute('d',pathStr1);
            path2.setAttribute('d',pathStr2);
        }
        else{
            var pathStr3 = 'M'+rt[0].x+','+rt[0].y+' C'+nextRt.x+','+nextRt.y+' '+(nextRt.x)+','+(nextRt.y)+' '+nextRt.x+','+nextRt.y;
            path3.setAttribute('d',pathStr3);
            var pathStr4 = 'M'+rt[1].x+','+rt[1].y+' C'+(nextRt.x)+','+(nextRt.y)+' '+(nextRt.x)+','+(nextRt.y)+' '+nextRt.x+','+nextRt.y;
            path4.setAttribute('d',pathStr4);
            var pathStr1 = 'M'+rt[0].x+','+rt[0].y+' C'+(pt2.x)+','+(pt2.y)+' '+(pt2.x)+','+(pt2.y)+' '+pt2.x+','+pt2.y;
            var pathStr2 = 'M'+rt[1].x+','+rt[1].y+' C'+pt2.x+','+(pt2.y)+' '+(pt2.x)+','+pt2.y+' '+pt2.x+','+pt2.y;
            path1.setAttribute('d',pathStr1);
            path2.setAttribute('d',pathStr2);
        }
    }
}

//转换路径
function mapPathStraight(path, matrix) {
    if (!matrix) {
        return path;
    }
    var x, y, i, j, ii, jj, pathi;
    //path = path2curve(path);
    path = Raphael.parsePathString(path);
    for (i = 0, ii = path.length; i < ii; i++) {
        pathi = path[i];
        for (j = 1, jj = pathi.length; j < jj; j += 2) {
            x = matrix.x(pathi[j], pathi[j + 1]);
            y = matrix.y(pathi[j], pathi[j + 1]);
            pathi[j] = x;
            pathi[j + 1] = y;
        }
    }
    return path;
}

//要素打断
$("#factorInterruption").click(function () {
    $(this).removeClass("disabled");
    $("#ProvinceHighwayInp").siblings().hide();
    addhtmltoExplicate({title: "要素打断", step: "请选择所有被打断的要素，按右键结束"});
    addFactorInterruption();
})
function addFactorInterruption() {
    var clickFirst=true,clickNext=false;
    var ShearedElems = []; //被断开的元素
    var CutElems =[]; //剪开的要素
    var svgPa = $('#svgcontent').children('g').get(0);
    var svgroot = document.getElementById("svgroot");
    svgroot.onmousedown = function (evt){
        if($("#factorInterruption").hasClass('tool_button_selected')) {
            if (evt.button == 0) {
                if(clickFirst) {
                    //获取被断开的要素
                    var targetElem = svgCanvas.getMouseTarget(evt);
                    if (targetElem != null && targetElem.id.substr(0, 4) == 'svg_') {
                        if (!isInArr(ShearedElems, targetElem)) {
                            ShearedElems.push(targetElem);
                            targetElem.setAttribute('stroke', '#ff2a21');
                        }
                    }
                }else{
                    //获取断开的要素
                    var targetElem = svgCanvas.getMouseTarget(evt);
                    if (targetElem != null && targetElem.id.substr(0, 4) == 'svg_') {
                        if (!isInArr(CutElems, targetElem)) {
                            CutElems.push(targetElem);
                            targetElem.setAttribute('stroke', '#0FF000');
                        }
                    }
                }
            }
            if(evt.button==2){
                if(clickFirst&&ShearedElems.length>0){
                    addhtmltoExplicate({title: "要素打断", step: "请选择所有打断的要素，按右键结束"})
                    clickFirst = false;
                }else if(!clickFirst&&CutElems.length>0){
                    if(CutElems.length>2){
                        for(var i = 0;i<ShearedElems.length;i++) {
                            ShearedElems[i].setAttribute('stroke','#fff');
                        }
                        for(var j = 0;j<CutElems.length;j++) {
                            CutElems[j].setAttribute('stroke','#fff');
                        }
                        return;
                    }
                    var pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                    for(var i = 0;i<ShearedElems.length;i++){
                        ShearedElems[i].setAttribute('stroke','#fff');
                        if(CutElems.length==1&&CutElems[0]!=ShearedElems[i]){
                            CutElems[0].setAttribute('stroke','#fff');
                            var pt1,lenStart,lenEnd,len,elemStr;
                            var cutStr = extendPath(CutElems[0],false,1000);
                            pt1 = Raphael.pathIntersection(ShearedElems[i].getAttribute('d'),cutStr);
                            var point = getPointData(ShearedElems[i]);
                            if(pt1.length>0){
                                if(pt.x<point.center.x){
                                    len = closestPoint(ShearedElems[i].getAttribute('d'),pt1[0]).length;
                                    elemStr = Raphael.getSubpath(ShearedElems[i].getAttribute('d'),len,point.len);
                                    ShearedElems[i].setAttribute('d',elemStr);
                                }else {
                                    len = closestPoint(ShearedElems[i].getAttribute('d'),pt1[pt1.length-1]).length;
                                    elemStr = Raphael.getSubpath(ShearedElems[i].getAttribute('d'),0,len);
                                    ShearedElems[i].setAttribute('d',elemStr);
                                }
                            }else{
                                var strAll = extendPath(ShearedElems[i],true,1000);
                                var shearedStr = extendPath(ShearedElems[i],false,1000);
                                var str = extendPath(CutElems[0],false,1000);
                                var ptStart = Raphael.pathIntersection(strAll.startD,str);
                                var ptEnd = Raphael.pathIntersection(strAll.endD,str);
                                if(ptEnd.length>0){
                                    lenStart = Raphael.getTotalLength(strAll.startD);
                                    len = closestPoint(strAll.endD,ptEnd[0]).length;
                                    lenEnd = lenStart+point.len+len;
                                }else if(ptStart.length>0){
                                    len = Raphael.getTotalLength(strAll.startD);
                                    lenStart =closestPoint(strAll.startD,ptStart[0]).length ;
                                    lenEnd = len+point.len;
                                }else{
                                    return;
                                }
                                elemStr = Raphael.getSubpath(shearedStr,lenStart,lenEnd);
                                ShearedElems[i].setAttribute('d',elemStr);
                            }
                        }else if(CutElems.length == 2&&CutElems[1]!=ShearedElems[i]&&CutElems[0]!=ShearedElems[i]){
                            CutElems[0].setAttribute('stroke','#fff');
                            CutElems[1].setAttribute('stroke','#fff');
                            var shearedS = extendPath(ShearedElems[i],false,1000);
                            var cutS1 = extendPath(CutElems[0],false,1000);
                            var cutS2 = extendPath(CutElems[1],false,1000);
                            var pt2 = Raphael.pathIntersection(shearedS,cutS1);
                            var pt3 = Raphael.pathIntersection(shearedS,cutS2);
                            if(pt2.length>0&&pt3.length>0){
                                var startLen1 = closestPoint(shearedS,pt2[0]).length;
                                var startLen2 = closestPoint(shearedS,pt3[0]).length;
                                var endLen1 = closestPoint(shearedS,pt2[pt2.length-1]).length;
                                var endLen2 = closestPoint(shearedS,pt3[pt3.length-1]).length;
                                var startLen = Math.min(startLen1,startLen2);
                                var endLen = Math.max(startLen2,endLen2);
                                var endStr = Raphael.getSubpath(shearedS,startLen,endLen);
                                ShearedElems[i].setAttribute('d',endStr);
                            }else{
                                return;
                            }
                        }
                    }
                    ShearedElems = [];
                    CutElems = [];
                    clickFirst = true;
                }
            }
        }
    }
}

//形状对接及复制
$("#ShapeDocking").click(function () {
    $(this).removeClass("disabled");
    $("#ProvinceHighwayInp").siblings().hide();
    addhtmltoExplicate({title: "形状对接及复制", step: "请选择对接要素，按右键结束"});
    addShapeDocking();
})
function addShapeDocking() {
    var clickFirst=true,clickNext=false,clickEnd = false;
    var dockingElems = []; //对接元素
    var dockingBeforeElem,dockingAfterElem;//对接前元素，对接后元素
    var beforeStart,afterStart,beforeEnd;//对接前起点，对接后起点
    var svgPa = $('#svgcontent').children('g').get(0);
    var svgroot = document.getElementById("svgroot");
    svgroot.onmousedown = function (evt){
        if($("#ShapeDocking").hasClass('tool_button_selected')) {
            evt.stopPropagation();
            if (evt.button == 0) {
                if(clickFirst&&!clickNext) {
                    var targetElem = svgCanvas.getMouseTarget(evt);
                    if (targetElem != null && targetElem.id.substr(0, 4) == 'svg_') {
                        if (!isInArr(dockingElems, targetElem)) {
                            dockingElems.push(targetElem);
                            targetElem.setAttribute('stroke', '#ff2a21');
                        }
                    }
                }else if(clickNext&&!clickFirst){
                    if(!clickEnd){
                        addhtmltoExplicate({title: "形状对接及复制", step: "请指定对接前终点"});
                        beforeStart = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                        dockingBeforeElem = document.createElementNS(svgNS, "path");
                        svgedit.utilities.assignAttributes(dockingBeforeElem, {
                            id: 'dockingBefore',
                            d: 'M'+beforeStart.x+','+beforeStart.y+' L'+beforeStart.x+','+beforeStart.y,
                            stroke: '#fff',
                            fill: 'none'
                        });
                        $(svgPa).append(dockingBeforeElem);
                        svgroot.onmousemove  =function (evt) {
                            var before = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                            var beforeStr = 'M'+beforeStart.x+','+beforeStart.y+' L'+before.x+','+before.y;
                            dockingBeforeElem.setAttribute('d',beforeStr);
                        }
                        clickEnd = true;
                    }else{
                        addhtmltoExplicate({title: "形状对接及复制", step: "请指定对接后起点"});
                        svgroot.onmousemove = null;
                        beforeEnd = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                        var beforeEndStr = 'M'+beforeStart.x+','+beforeStart.y+' L'+beforeEnd.x+','+beforeEnd.y;
                        dockingBeforeElem.setAttribute('d',beforeEndStr);
                        $(dockingBeforeElem).hide();
                        clickFirst = true;
                        clickNext = true;
                        clickEnd = false;
                    }
                }else if(clickFirst&&clickNext) {
                    if(!clickEnd){
                        addhtmltoExplicate({title: "形状对接及复制", step: "请指定对接后终点"});
                        afterStart = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                        dockingAfterElem = document.createElementNS(svgNS, "path");
                        svgedit.utilities.assignAttributes(dockingAfterElem, {
                            id: 'dockingBefore',
                            d: 'M'+afterStart.x+','+afterStart.y+' L'+afterStart.x+','+afterStart.y,
                            stroke: '#fff',
                            fill: 'none'
                        });
                        $(svgPa).append(dockingAfterElem);
                        svgroot.onmousemove  =function (evt) {
                            var after = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                            var afterStr = 'M'+afterStart.x+','+afterStart.y+' L'+after.x+','+after.y;
                            dockingAfterElem.setAttribute('d',afterStr);
                        }
                        clickEnd = true;
                    }else{
                        svgroot.onmousemove = null;
                        var afterEnd = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                        var afterEndStr = 'M'+afterStart.x+','+afterStart.y+' L'+afterEnd.x+','+afterEnd.y;
                        dockingAfterElem.setAttribute('d',afterEndStr);
                        $(dockingAfterElem).hide();
                        var disX = afterStart.x - beforeStart.x;
                        var disY = afterStart.y - beforeStart.y;
                        var angle = (Raphael.angle(afterEnd.x,afterEnd.y,beforeEnd.x+disX,beforeEnd.y+disY,afterStart.x,afterStart.y));
                        var trans = 't'+disX+','+disY+'r'+angle+','+afterStart.x+','+afterStart.y;
                        if(evt.ctrlKey){
                            for(var i=0;i<dockingElems.length;i++){
                                var path = drawLinePath({
                                    'id':svgCanvas.getNextId(),
                                    'firstP':afterStart,
                                    'nextP':beforeStart,
                                    'fill':'none',
                                    'stroke':'#fff',
                                    'addGroup':svgPa
                                })
                                var dockStr = dockingElems[i].getAttribute('d');
                                var str = mapPathStraight(dockStr,Raphael.toMatrix(dockStr,trans));
                                path.setAttribute('d',str);
                                dockingElems[i].setAttribute('stroke','#fff');
                            }
                        }else{
                            for(var i=0;i<dockingElems.length;i++){
                                var dockStr = dockingElems[i].getAttribute('d');
                                var str = mapPathStraight(dockStr,Raphael.toMatrix(dockStr,trans));
                                dockingElems[i].setAttribute('d',str);
                                dockingElems[i].setAttribute('stroke','#fff');
                            }
                        }
                        addhtmltoExplicate({title: "形状对接及复制", step: "请选择对接要素，按右键结束"});
                        $(dockingBeforeElem).remove();
                        $(dockingAfterElem).remove();
                        beforeStart=null;
                        afterStart=null;
                        dockingBeforeElem = null;
                        dockingAfterElem = null;
                        dockingElems=[];
                        clickFirst = true;
                        clickNext = false;
                        clickEnd = false;
                    }
                }
            }
            if(evt.button==2){
                if(clickFirst&&!clickNext&&dockingElems.length>0){
                    addhtmltoExplicate({title: "形状对接及复制", step: "请指定对接前起点"})
                    clickNext = true;
                    clickFirst = false;
                }else{
                    addhtmltoExplicate({title: "形状对接及复制", step: "请选择对接要素，按右键结束"});
                    if(dockingAfterElem!=null){
                        $(dockingAfterElem).remove();
                    }
                    if(dockingBeforeElem!=null){
                        $(dockingBeforeElem).remove();
                    }
                    if(dockingElems.length>0){
                        for(var i=0;i<dockingElems.length;i++){
                            dockingElems[i].setAttribute('stroke','#fff');
                        }
                    }
                    beforeStart=null;
                    afterStart=null;
                    dockingBeforeElem = null;
                    dockingAfterElem = null;
                    dockingElems=[];
                    clickFirst = true;
                    clickNext = false;
                    clickEnd = false;
                }
            }
        }
    }

}
//形状剪开
$("#ShapeCut").click(function () {
    $(this).removeClass("disabled");
    $("#ProvinceHighwayInp").siblings().hide();
    addhtmltoExplicate({title: "纸形剪开及复制", step: "请选择所有被剪开的要素，按右键结束"});
    addShapeCut();
})
function addShapeCut() {
    var clickFirst=true,clickNext=false;
    var ShearedElems = []; //被剪的元素
    var CutElems =[]; //剪开的要素
    var transElem = [];//需要移动的元素
    var svgPa = $('#svgcontent').children('g').get(0);
    var svgroot = document.getElementById("svgroot");
    svgroot.onmousedown = function (evt){
        if($("#ShapeCut").hasClass('tool_button_selected')) {
            evt.stopPropagation();
            if (evt.button == 0) {
                if(clickFirst&&!clickNext) {
                    svgroot.onmouseup = null;
                    var targetElem = svgCanvas.getMouseTarget(evt);
                    if (targetElem != null && targetElem.id.substr(0, 4) == 'svg_') {
                        if (!isInArr(ShearedElems, targetElem)) {
                            ShearedElems.push(targetElem);
                            targetElem.setAttribute('stroke', '#ff2a21');
                        }
                    }
                }else if(clickNext&&!clickFirst){
                    var targetElem = svgCanvas.getMouseTarget(evt);
                    if (targetElem != null && targetElem.id.substr(0, 4) == 'svg_') {
                        if (!isInArr(CutElems, targetElem)) {
                            CutElems.push(targetElem);
                            targetElem.setAttribute('stroke', '#00FF00');
                        }
                    }
                }else if(clickFirst&&clickNext){
                    var start = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                    var shearedLen = ShearedElems.length;
                    var cutLen = CutElems.length;
                    var selectElem ={};
                    var allElem = [];
                    var removeElem = [];
                    for(var i=0;i<shearedLen;i++){
                        var allPts = new Array()
                        for(var j=0;j<cutLen;j++){
                            if(ShearedElems[i]!=CutElems[j]){
                                var rt = Raphael.pathIntersection(ShearedElems[i].getAttribute('d'),CutElems[j].getAttribute('d'));
                                if(rt.length>0){
                                    for(var k=0;k<rt.length;k++){
                                        var cp = closestPoint(ShearedElems[i],rt[k]);
                                        allPts.push(cp.length);
                                    }
                                    removeElem.push(ShearedElems[i]);
                                }else{
                                    var pathPoint = closestPoint(ShearedElems[i],start);
                                    var pathStr = 'M'+start.x+','+start.y+' L'+pathPoint.x+','+pathPoint.y;
                                    var rt2 = Raphael.pathIntersection(pathStr,CutElems[j].getAttribute('d'));
                                    if(rt2.length==0){
                                        transElem.push(ShearedElems[i]);
                                    }
                                }
                            }
                        }
                        function sortNum(a,b) {
                            return a-b;
                        }
                        allPts.sort(sortNum);
                        var ID = ShearedElems[i].id;
                        selectElem[ID]=[];
                        if(allPts.length>0){
                            var end = Raphael.getTotalLength(ShearedElems[i].getAttribute('d'));
                            for(var j=0;j<allPts.length+1;j++){
                                if(j==0){
                                    selectElem[ID].push({
                                        pt0: Raphael.getPointAtLength(ShearedElems[i].getAttribute('d'), 0) ,
                                        pt1: Raphael.getPointAtLength(ShearedElems[i].getAttribute('d'), allPts[j]) ,
                                        pathStr : Raphael.getSubpath(ShearedElems[i].getAttribute('d') , 0 , allPts[j]),
                                    });
                                }else if(j==allPts.length){
                                    selectElem[ID].push({
                                        pt0: Raphael.getPointAtLength(ShearedElems[i].getAttribute('d'), allPts[j-1]) ,
                                        pt1: Raphael.getPointAtLength(ShearedElems[i].getAttribute('d'), end) ,
                                        pathStr : Raphael.getSubpath(ShearedElems[i].getAttribute('d') , allPts[j-1] ,end),
                                    });
                                }else{
                                    selectElem[ID].push({
                                        pt0: Raphael.getPointAtLength(ShearedElems[i].getAttribute('d'), allPts[j-1]) ,
                                        pt1: Raphael.getPointAtLength(ShearedElems[i].getAttribute('d'), allPts[j]) ,
                                        pathStr : Raphael.getSubpath(ShearedElems[i].getAttribute('d') , allPts[j-1] , allPts[j]),
                                    });
                                }
                            }
                        }
                    }
                    for(var item in selectElem){
                        var arr = selectElem[item];
                        for(var m = 0;m<arr.length;m++){
                            var path = document.createElementNS(svgNS, "path");
                            svgedit.utilities.assignAttributes(path, {
                                id: svgCanvas.getNextId(),
                                d: arr[m].pathStr,
                                stroke: "#fff",
                                fill: 'none'
                            });
                            addPathMark(path);
                            console.log(path)
                            if((start.x>arr[m].pt0.x&&start.x<arr[m].pt1.x)||(start.y>arr[m].pt0.y&&start.y<arr[m].pt1.y)){
                                if(!isInArr(transElem,path)){
                                    transElem.push(path);
                                }
                            }else{
                                allElem.push(path);
                            }
                            $(svgPa).append(path);
                        }
                    }
                    for(var p=0;p<CutElems.length;p++){
                        var path = document.createElementNS(svgNS, "path");
                        svgedit.utilities.assignAttributes(path, {
                            id: svgCanvas.getNextId(),
                            d: CutElems[p].getAttribute('d'),
                            stroke: "#fff",
                            fill: 'none'
                        });
                        $(svgPa).append(path);
                        transElem.push(path);
                        addPathMark(path);
                    }
                    svgroot.onmousemove = function (evt) {
                        var center = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                        var translate = 'translate('+(center.x-start.x)+','+(center.y-start.y)+')';
                        for(var i = 0;i<transElem.length;i++){
                            transElem[i].setAttribute('transform',translate);
                        }
                    }
                    svgroot.onmouseup = function (evt) {
                        svgroot.onmousemove = null;
                        var end = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse())
                        var tras = 't'+(end.x-start.x)+','+(end.y-start.y);
                        if(CutElems.length==0||ShearedElems==0){return;}
                        for(var i = 0;i<transElem.length;i++){
                            transElem[i].removeAttribute('transform');
                            var oldStr = transElem[i].getAttribute('d');
                            var newStr = mapPathStraight(oldStr,Raphael.toMatrix(oldStr,tras));
                            transElem[i].setAttribute('d',newStr.toString());
                        };
                        if(evt.ctrlKey){
                            for(var i= 0;i<allElem.length;i++){
                                $(allElem[i]).remove();
                            }

                        }else{
                            for(var i =0;i<removeElem.length;i++){
                                for(var j = 0;j<cutLen;j++){
                                    if(removeElem[i]!=CutElems[j]){
                                        $(removeElem[i]).remove();
                                    }
                                }
                            }
                        }
                        for(var i =0;i<shearedLen;i++){
                            ShearedElems[i].setAttribute('stroke','#fff');
                        }
                        for(var j = 0;j<cutLen;j++){
                            CutElems[j].setAttribute('stroke','#fff');
                        }
                        addhtmltoExplicate({title: "纸形剪开及复制", step: "请选择所有被剪开的要素，按右键结束"})
                        ShearedElems = [];
                        CutElems =[];
                        transElem=[];
                    }
                    clickFirst=true;
                    clickNext=false;
                }
            }
            if(evt.button==2){
                if(clickFirst&&!clickNext&&ShearedElems.length>0){
                    addhtmltoExplicate({title: "纸形剪开及复制", step: "请选择剪开要素，按右键结束"})
                    clickNext = true;
                    clickFirst = false;
                }else if(!clickFirst&&clickNext&&CutElems.length>0){
                    addhtmltoExplicate({title: "纸形剪开及复制", step: "在移动侧拖动鼠标到指定位置，按ctrl键可以复制"})
                    clickNext = true;
                    clickFirst = true;
                }
            }
        }
    }

}
//获取镜像
function getMirrorImage(nowElem,mirrorElem){
    if( typeof(nowElem) == 'object'){
        nowElem = $(nowElem).attr("d");
    }

    // var mirrorLen = mirrorElem.getTotalLength();
    // var startP = mirrorElem.getPointAtLength(0);
    // var endP = mirrorElem.getPointAtLength(mirrorLen);
    var mirrorData = getPointData(mirrorElem);
    var path;
    // var EquidistantPoint;
    var x1 = Number(mirrorData.start.x),y1= Number(mirrorData.start.y),x2 = Number(mirrorData.end.x),y2=Number(mirrorData.end.y);
    var A = y1 -y2;
    var B = x2 - x1;
    var C = x1*y2 - y1*x2;
    var a = (B*B-A*A)/(B*B+A*A);
    var b = (-2*A*B)/(B*B+A*A);
    var c = (-2*A*C)/(B*B+A*A);
    var d = (-2*A*B)/(B*B+A*A);
    var e = (A*A-B*B)/(B*B+A*A);
    var f = (-2*B*C)/(B*B+A*A);
    path = Raphael.mapPath(nowElem,Raphael.matrix(a,b,d,e,c,f)).toString();
    return path;
}

//判断一个点与路径是否有交点 返回的是交点信息
function getIntersectionPath(point,elem) {
    point.r=5;
    var IntersectionPathGroup = document.createElementNS(svgNS,"g");
    IntersectionPathGroup.setAttribute("id","IntersectionPathGroup");
    $("#svgcontent").append(IntersectionPathGroup);
    var circle1 = document.createElementNS(svgNS, "circle");
    svgedit.utilities.assignAttributes(circle1, {
        id: 'circle1',
        cx: point.x,
        cy: point.y,
        r: point.r,
        stroke: 'green',
        fill: 'none'
    });
    $(IntersectionPathGroup).append(circle1);
    svgCanvas.convertToPath($('#circle1').get(0));
    var rt = Raphael.pathIntersection($('#circle1').attr('d'),$(elem).attr('d'));
    $('#IntersectionPathGroup').remove();
    return rt;
}
//画一条直线路径
function drawLinePath(data) {
    var path = document.createElementNS(svgNS, "path");
    svgedit.utilities.assignAttributes(path, {
        id: data.id,
        d: 'M'+data.firstP.x+','+data.firstP.y+' C'+data.nextP.x+','+data.nextP.y+' '+data.nextP.x+','+data.nextP.y+' '+data.nextP.x+','+data.nextP.y,
        stroke: data.stroke,
        fill: data.fill
    });
    $(data.addGroup).append(path);
    addPathMark(path);
    return path;
}
//获取以两个点为圆心的两个圆的交点
function getIntersectionPoint(firstP,nextP) {
    var IntersectionPointGroup = document.createElementNS(svgNS,"g");
    IntersectionPointGroup.setAttribute("id","IntersectionPointGroup");
    $("#svgcontent").append(IntersectionPointGroup);
    var circle1 = document.createElementNS(svgNS, "circle");
    svgedit.utilities.assignAttributes(circle1, {
        id: 'circle1',
        cx: firstP.x,
        cy: firstP.y,
        r: firstP.r,
        stroke: 'green',
        fill: 'none'
    });
    $(IntersectionPointGroup).append(circle1);
    svgCanvas.convertToPath($('#circle1').get(0));
    var circle2 = document.createElementNS(svgNS, "circle");
    svgedit.utilities.assignAttributes(circle2, {
        id: 'circle2',
        cx: nextP.x,
        cy: nextP.y,
        r: nextP.r,
        stroke: 'green',
        fill: 'none'
    });
    $(IntersectionPointGroup).append(circle2);
    svgCanvas.convertToPath($('#circle2').get(0));
    var rt = Raphael.pathIntersection($('#circle1').attr('d'),$('#circle2').attr('d'));
    $('#IntersectionPointGroup').remove();
    return rt;
}
//点打断
$("#PointInterruption").click(function () {
    $(this).removeClass("disabled");
    $("#ProvinceInp").siblings().hide();
    addhtmltoExplicate({title: "点打断", step: "左键点选要打断的线"});
    addInterruption();
})
function addInterruption() {
    var clickFirst=true,PointInterruptionG,mouseTarget,isCompare=false;
    var path;
    var svgPa = $('#svgcontent').children('g').get(0);
    var svgroot = document.getElementById("svgroot");
    svgroot.onmousedown = function (evt){
        if($("#PointInterruption").hasClass('tool_button_selected')) {
            evt.stopPropagation();
            addhtmltoExplicate({title: "点打断", step: "左键点选要打断的线"});
            if (evt.button == 0) {
                if(clickFirst) {
                    var targetElem = svgCanvas.getMouseTarget(evt);
                    if (targetElem != null ) {
                        var pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                        if(mouseTarget==null||mouseTarget!=targetElem){
                            addhtmltoExplicate({title: "点打断", step: "左键点选要打断的位置"});
                            mouseTarget = targetElem;
                            targetElem.setAttribute('stroke', 'red');
                        }else if(targetElem==mouseTarget&&mouseTarget!=null){
                            addhtmltoExplicate({title: "点打断", step: "左键点选要打断的线"});
                            var len = targetElem.getTotalLength();
                            var len3 = closestPoint(targetElem,pt);
                            mouseTarget.setAttribute('stroke','#fff');

                            var childs = $(targetElem).siblings();
                            for(var i= 0;i<childs.length;i++){
                                if(childs[i].getAttribute('stroke')=='red'){
                                    childs[i].setAttribute('stroke','#fff');
                                }
                            }
                            var prevStr = Raphael.getSubpath(targetElem.getAttribute('d'),0,len3.length);
                            var nextStr = Raphael.getSubpath(targetElem.getAttribute('d'),len3.length,len);
                            targetElem.setAttribute('d',prevStr);
                            path = document.createElementNS(svgNS, "path");
                            svgedit.utilities.assignAttributes(path, {
                                id:svgCanvas.getNextId() ,
                                d: nextStr,
                                stroke: '#0F0',
                                fill: 'none'
                            });
                            $(svgPa).append(path);
                            addPathMark(path);
                            isCompare = true;
                        }
                    }
                }
                if(isCompare&&evt.target!=mouseTarget&&mouseTarget!=null){
                    mouseTarget.setAttribute('stroke','#fff');
                    mouseTarget= null;
                    if(path!=null){
                        path.setAttribute('stroke','#fff');
                    }
                    isCompare = false;
                }
            }
            if(evt.button==2&&clickFirst){
                if(mouseTarget!=null){
                    mouseTarget.setAttribute('stroke','#fff');
                }
                if(path!=null){
                    path.setAttribute('stroke','#fff');
                }

                mouseTarget= null;
            }
        }
    }
}
//添加一个点
function addPointCircle(pt,PointInterruptionG,color) {
    var PointCircle = document.createElementNS(svgNS, "circle");
    svgedit.utilities.assignAttributes(PointCircle, {
        cx: pt.x,
        cy: pt.y,
        r:5,
        stroke: '#6ff',
        fill: '#6ff'
    });

    if(color){
        PointCircle.setAttribute("stroke",color);
        PointCircle.setAttribute("fill",color);
    }

    $(PointInterruptionG).append(PointCircle);
}

//对称
$("#Symmetric").click(function () {
    $(this).removeClass("disabled");
    $("#ProvinceInp").siblings().hide();
    addhtmltoExplicate({title: "对称", step: "左键点选对称要素，右键结束"});
    addSymmetric();
})
function addSymmetric() {
    var clickFirst=true,clickNext=false;
    var selectElems = [],cloneElms=[];
    var pt1,SymmetricLine,points2;
    var svgPa = $('#svgcontent').children('g').get(0);
    var svgroot = document.getElementById("svgroot");
    svgroot.onmousedown = function (evt){
        if($("#Symmetric").hasClass('tool_button_selected')) {
            if (evt.button == 0) {
                if(clickFirst&&!clickNext) {
                    addhtmltoExplicate({title: "对称", step: "左键点选对称要素，右键结束"});
                    var targetElem = svgCanvas.getMouseTarget(evt);
                    if (targetElem != null && targetElem.id.substr(0, 4) == 'svg_') {
                        if(!isInArr(selectElems,targetElem)){
                            selectElems.push(targetElem);
                            targetElem.setAttribute('stroke','#ff2a21');
                        }
                    }
                }else if(clickNext&&!clickFirst){
                    addhtmltoExplicate({title: "对称", step: "请输入对称轴的起点，按ctrl键可进行方向捕捉"});
                    pt1 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                    var ctrl = evt.ctrlKey;
                    SymmetricLine= drawLinePath({
                        'id':'SymmetricLine',
                        'firstP':pt1,
                        'nextP':pt1,
                        'stroke':'#fff',
                        'fill':'none',
                        'addGroup':'#svgcontent'
                    });
                    SymmetricLine.removeAttribute('marker-start');
                    SymmetricLine.removeAttribute('marker-end');
                    svgroot.onmousemove = function(evt){
                        var pt2 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse())
                        var distance = compareLength(pt1,pt2);
                        if(ctrl) {
                            var vertors = getVector({x: 0, y: 0}, {x: 1, y: 0}).vertor;
                            var vertor1 = getVector(pt1, pt2);
                            var angle = VectorAngle(vertors, vertor1.vertor)
                            points2 = {x: vertors.x * distance + pt1.x, y: vertors.y * distance + pt1.y};
                            if (vertor1.vertor.y < 0) {
                                if (angle < 23) {
                                    points2 = {x: vertors.x * distance + pt1.x, y: vertors.y * distance + pt1.y};
                                } else if (angle >= 23 && angle < 68) {
                                    vertors = getVector({x: 0, y: 0}, {x: 1, y: -1}).vertor;
                                    points2 = {x: vertors.x * distance + pt1.x, y: vertors.y * distance + pt1.y};
                                } else if (angle >= 68 && angle < 113) {
                                    vertors = getVector({x: 0, y: 0}, {x: 0, y: -1}).vertor;
                                    points2 = {x: vertors.x * distance + pt1.x, y: vertors.y * distance + pt1.y};
                                } else if (angle >= 113 && angle < 158) {
                                    vertors = getVector({x: 0, y: 0}, {x: -1, y: -1}).vertor;
                                    points2 = {x: vertors.x * distance + pt1.x, y: vertors.y * distance + pt1.y};
                                } else if (angle >= 158 && angle < 180) {
                                    vertors = getVector({x: 0, y: 0}, {x: -1, y: 0}).vertor;
                                    points2 = {x: vertors.x * distance + pt1.x, y: vertors.y * distance + pt1.y};
                                }
                            } else if (vertor1.vertor.y > 0) {
                                if (angle < 23) {
                                    points2 = {x: vertors.x * distance + pt1.x, y: vertors.y * distance + pt1.y};
                                } else if (angle >= 23 && angle < 68) {
                                    vertors = getVector({x: 0, y: 0}, {x: 1, y: 1}).vertor;
                                    points2 = {x: vertors.x * distance + pt1.x, y: vertors.y * distance + pt1.y};
                                } else if (angle >= 68 && angle < 113) {
                                    vertors = getVector({x: 0, y: 0}, {x: 0, y: 1}).vertor;
                                    points2 = {x: vertors.x * distance + pt1.x, y: vertors.y * distance + pt1.y};
                                } else if (angle >= 113 && angle < 158) {
                                    vertors = getVector({x: 0, y: 0}, {x: -1, y: 1}).vertor;
                                    points2 = {x: vertors.x * distance + pt1.x, y: vertors.y * distance + pt1.y};
                                } else if (angle >= 158 && angle < 180) {
                                    vertors = getVector({x: 0, y: 0}, {x: -1, y: 0}).vertor;
                                    points2 = {x: vertors.x * distance + pt1.x, y: vertors.y * distance + pt1.y};
                                }
                            }
                        }else{
                            points2 = pt2;
                        }
                        var d = "M"+pt1.x+","+pt1.y+" C"+points2.x + ","+points2.y+' '+points2.x + ","+points2.y+' '+points2.x + ","+points2.y;
                        $("#SymmetricLine").attr("d",d);
                        clickFirst = true;
                    }
                }else if(clickFirst&&clickNext){
                    addhtmltoExplicate({title: "对称", step: "进行要素修改，按右键结束修改，按shift仅保留原始要素，按ctrl键保留镜像要素"});
                    svgroot.onmousemove=null;
                    var d = "M"+pt1.x+","+pt1.y+" C"+points2.x + ","+points2.y+' '+points2.x + ","+points2.y+' '+points2.x + ","+points2.y;
                    $("#SymmetricLine").attr("d",d);
                    $("#SymmetricLine").hide();
                    for(var i=0;i<selectElems.length;i++){
                        cloneElms[i]=drawLinePath({
                            'id':svgCanvas.getNextId(),
                            'firstP':pt1,
                            'nextP':pt1,
                            'stroke':'green',
                            'fill':'none',
                            'addGroup':svgPa
                        })
                        var str = getMirrorImage(selectElems[i].getAttribute('d'),$('#SymmetricLine').get(0))
                        $(cloneElms[i]).attr('d',str);
                    }
                    clickFirst=false;
                    clickNext = false;
                    $("#SymmetricLine").remove();
                }
            }
            if(evt.button==2){
                if(clickFirst&&!clickNext){
                    if(selectElems.length>0){
                        addhtmltoExplicate({title: "对称", step: "请输入对称轴的起点，按ctrl键可进行方向捕捉"});
                        clickFirst=false;
                        clickNext=true;
                    }
                }else if(!clickNext&&!clickFirst){
                    clickFirst = true;
                    clickNext = false;
                    for(var i=0;i<selectElems.length;i++){
                        $(selectElems[i]).attr('stroke','#fff');
                        $(cloneElms[i]).attr('stroke','#fff');
                    }
                    if(evt.ctrlKey){
                        for(var i=0;i<selectElems.length;i++){
                            $(selectElems[i]).remove();
                        }
                    }
                    if(evt.shiftKey){
                        for(var i=0;i<cloneElms.length;i++){
                            $(cloneElms[i]).remove();
                        }
                    }
                    selectElems=[];
                    cloneElms=[];
                    SymmetricLine=null;
                    pt1=null;
                    points2=null;
                }
            }
        }
    }
}


//片规则拷贝


//1.6 量规
$("#Gauge").click(function(evt){
        var nodeG;
        $("#GaugeInp").siblings().hide();
        $("#GaugeInp").show();
        addhtmltoExplicate({ title:"量规",step:"1.请选择起点,并在上方输入框输入长度" })
        if($("#svgcontent #pointLineGroup").length < 1){
            nodeG = document.createElementNS(svgNS,"g");
            nodeG.setAttribute("id","pointLineGroup");
            $("#svgcontent").append(nodeG);
        }
        getGauge();
        count = false;
    })


//6.1.皮尺测量
$("#tape_measure").on("click",function(){
    $("#Fun_name").html("皮尺测量");
    $("#steps").html("请选择测量要素");

    if($("#svgcontent #tapeRulergroup").length < 1){
        var nodeG = document.createElementNS(svgNS,"g");
        nodeG.setAttribute("id","tapeRulergroup");
        $("#svgcontent").append(nodeG);
    }
    // addListenerOnPathClick()
});

/*// 6.2.要素长度测量
$("#ele_Length").on("click",function(){
    if(svgPath_len > 0){ $("#ele_Length").removeClass("disabled");}
    // addListenerOnPathClick()
});*/

//6.3.两点测量
// $("#twoPoints_length").click(getTwoPointsLength);

 /*   // 6.4.要素上两点测量
$("#eleTwo_length").click(function(){
        if(svgPath_len > 0) {
            $("#eleTwo_length").removeClass("disabled");
            addhtmltoExplicate({ title:"要素上两点测量", step:"1.请选择要素！"})
            // addListenerOnPathClick()
        }
    })*/

    //6.6.角度测量
$("#angle_measure").click(function(){
    if(svgPath_len > 1) { $(this).removeClass("disabled");addhtmltoExplicate({ title:"角度测量", step:"2.请选择进行测量的两条路径！"}) }
    // addListenerOnPathClick();
})

//打版部分
//1.1尺寸表设置

//1.2 规则修改
// $("#RuleModification").click(function(){
    // $("#setSizeRuleTable").siblings().hide();
    // $("#setSizeRuleTable").show();
// })

//量规
function getGauge(){
        var svgroot = document.getElementById("svgroot");
        var GaugeData =[];
        var lengthBetweenTwoPoints = 0;
        var TowClick_flag = 0;
        var nodeText = document.createElementNS(svgNS,"text");
        var nodeLine = document.createElementNS(svgNS, "line");

        nodeLine.setAttribute("id", "Gauge_line");
        nodeText.setAttribute("id","lineLengthText")

        addhtmltoExplicate({ title:"量规", step:"2.请选择要素！"})

        svgroot.onmousedown = function (evt) {
            if(TowClick_flag%2 == 1){
                // console.log("TowClick_flag:"+TowClick_flag)
                TowClick_flag++;
                svgroot.onmousemove = null;
                $("#svgroot #pointLineGroup").children().remove();
            }
            else if($("#Gauge").hasClass("tool_button_selected") && TowClick_flag%2 ==0 && evt.button == 0) {
                // if(){
                // console.log("TowClick_flag:"+TowClick_flag)

                TowClick_flag++;

                GaugeData[0] = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                nodeLine.setAttribute("x1", GaugeData[0].x);
                nodeLine.setAttribute("y1", GaugeData[0].y);

                svgroot.onmousemove = function (evt) {
                    GaugeData[1] = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());

                    var p2 = {};
                    var v = getVector(GaugeData[0],GaugeData[1]);
                    v.vertor.x>0 ? p2 = {x:GaugeData[1].x-0.5}:p2 = {x:GaugeData[1].x+0.5};
                    v.vertor.y>0 ? p2.y = GaugeData[1].y-0.5:p2.y = GaugeData[1].y+0.5;

                    nodeLine.setAttribute("x2", p2.x);
                    nodeLine.setAttribute("y2", p2.y);
                    nodeLine.setAttribute("style", "stroke:#f60;stroke-width:1;fill:none;");
                    lengthBetweenTwoPoints = Math.round(compareLength(GaugeData[0], GaugeData[1]))

                    nodeText.textContent = "半径：" + lengthBetweenTwoPoints;
                    nodeText.setAttribute("x",GaugeData[1].x - 10);
                    nodeText.setAttribute("y", GaugeData[1].y - 10);
                    nodeText.setAttribute("style", "fill:green;");

                    // $("#svgcontent g").eq(0).append(nodePath)
                    $("#pointLineGroup").append(nodeLine);
                    $("#pointLineGroup").append(nodeText);
                    count = true;
                };

            }
            //     else if(evt.button ==2){
            //     }
        }
        svgPathElements.on("mousedown",function(evt){
            svgroot.onmousemove = null;
            var mouse_target = evt.target;

            var downPoint = closestPoint(mouse_target,svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse()))

            if($("#Gauge").hasClass("tool_button_selected") && count && TowClick_flag%2 == 1 && evt.button ==0){
                var  nodePath = document.createElementNS(svgNS, "path");
                nodePath.setAttribute("id",svgCanvas.getNextId());
                nodePath.setAttribute("style", "stroke:#fff;stroke-width:1;fill:#fff;");
                addPathMark(nodePath);
                $("#svgcontent g").eq(0).append(nodePath);
                var r = $("#radius").val();

                var Intersection =  getIntersection(r,GaugeData[0],mouse_target)

                var bestPoint = Intersection[0];
                var bestdistance = Infinity;
                if(Intersection.length > 0){
                    for(var i = 0;i<Intersection.length;i++){
                        var distance = compareLength(downPoint,Intersection[i]);
                        if(distance < bestdistance){
                            bestdistance = distance;bestPoint = Intersection[i];
                        }
                    }
                }
                if(Intersection.length !==0) {
                    nodePath.setAttribute("d", "M " + GaugeData[0].x + "," + GaugeData[0].y + " L " + bestPoint.x + "," + bestPoint.y);
                }else{
                    nodePath.setAttribute("d", "M " + GaugeData[0].x + "," + GaugeData[0].y + " L " + downPoint.x + "," + downPoint.y);
                }

            }
        })
    }

    /*  函数作用：以点point为圆心，以距离distance为半径画圆，得到与pathNode的交点
        pathNode:目标路径
        point：求交点的点,JSON 格式{x:,y:,}，如果是需要传入多个点则采用数组格式[{},{}]，最多两个点
        distance：半径,如果需要多个，采用数组格式传入，与point配套
    */
function getIntersection(distance,points,pathNode){
        var r = distance;
        var Intersection;
        // console.log(distance)
        if(!$.isArray(points)) {
            var circle = document.createElementNS(svgNS, "circle");
            svgedit.utilities.assignAttributes(circle, {
                id: "cir",
                cx: points.x,
                cy: points.y,
                r: r
                // style: "stroke:transparent;fill:transparent;"
            });
            $("#pointLineGroup").append(circle);
            svgCanvas.convertToPath(circle);

            Intersection = Raphael.pathIntersection($("#cir").attr("d"), $(pathNode).attr("d"));
            // $("#pointLineGroup path").remove();

        }else if($.isArray(points)){
            var circle1 = document.createElementNS(svgNS, "circle");
            svgedit.utilities.assignAttributes(circle1, {
                id: "cir1",
                cx: points[0].x,
                cy: points[0].y,
                r: r[0],
                // style: "stroke:transparent;fill:transparent;"
            });

            $("#pointLineGroup").find("#cir1").remove();
            $("#pointLineGroup").append(circle1);
            svgCanvas.convertToPath(circle1);

            var circle2 = document.createElementNS(svgNS, "circle");
            svgedit.utilities.assignAttributes(circle2, {
                id: "cir2",
                cx: points[1].x,
                cy: points[1].y,
                r: r[1],
                // style: "stroke:transparent;fill:none;"
            });
            // $("#pointLineGroup").find("#cir2").remove();
            $("#pointLineGroup").append(circle2);
            svgCanvas.convertToPath(circle2);

            Intersection = Raphael.pathIntersection($("#cir1").attr("d"), $("#cir2").attr("d"));
            // setTimeout("$(\"#pointLineGroup #cir1,#pointLineGroup #cir2\").remove()",0)
            $("#pointLineGroup").find("path").remove();

        }
        return Intersection;
    }

    // 两点间的长度测量
function getTwoPointsLength(evt){
        var nodeG,nodeLine,nodeText,TowClick_flag = false;
        var workarea = document.getElementById("workarea");
        var svgroot = document.getElementById("svgroot");
        // addhtmltoExplicate({ title:"两点测量",step:"1.请左键点击选择起点" });

        if($("#svgcontent #pointLineGroup").length < 1){
            nodeG = document.createElementNS(svgNS,"g");
            nodeG.setAttribute("id","pointLineGroup");
            $("#svgcontent").append(nodeG);
        }

        nodeText = document.createElementNS(svgNS,"text");
        nodeLine = document.createElementNS(svgNS,"line");

        nodeLine.setAttribute("id","pointLine");
        nodeText.setAttribute("id","lineLengthText")

        svgroot.onmousedown = function (evt) {
            if ($("#twoPoints_length").hasClass("tool_button_selected") && evt.button == 0) {
                    var p1 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());

                    var lengthBetweenTwoPoints = 0;
                    nodeLine.setAttribute("x1", p1.x);
                    nodeLine.setAttribute("y1", p1.y);
                    svgroot.onmousemove = function (evt) {
                        // var  p2 = pos(evt);
                        $("#steps").html("2.左键重新选择起点、右键结束选择");

                        var  p2 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                        nodeLine.setAttribute("x2", p2.x);
                        nodeLine.setAttribute("y2", p2.y);
                        nodeLine.setAttribute("style", "stroke:#f60;stroke-width:1;fill:none;");
                        // var lenScale = svgCanvas.getCanvasScale()
                        lengthBetweenTwoPoints = Math.round(compareLength(p1, p2))

                        nodeText.textContent = "路径长度：" + lengthBetweenTwoPoints;
                        nodeText.setAttribute("x", p2.x - 10);
                        nodeText.setAttribute("y", p2.y - 10);
                        nodeText.setAttribute("style", "stroke:green;stroke-width:1;fill:none;");
                        $("#pointLineGroup").append(nodeLine);
                        $("#pointLineGroup").append(nodeText);
                        var dataTo = {
                            title:"两点直线测量",
                            th:{key:"测量值",value:"距离（px）"},
                            content:[
                                {key:"直线距离",value:lengthBetweenTwoPoints}
                            ]
                        }
                        addListeneronDownbutton(dataTo)
                    };
                }
            else if(evt.button ==2){
                svgroot.onmousemove = null;
                $("#svgroot #pointLineGroup").children().remove();
            }
        }

    }

    //从路径上返回距离 传入的坐标 最近的路径上的点
function closestPoint(pathNode, point)
    {
        var pathD;
        if(typeof pathNode=='string'){
            pathD = pathNode;
        }else{
            pathD = $(pathNode).attr("d");
        }
        var pathLength = Raphael.getTotalLength(pathD),
            precision = 4,
            best,
            bestLength,
            bestDistance = Infinity;



        // console.log(pathNode.getPointAtLength(20))
        // linear scan for coarse approximation
        for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision)
        {
            if ((scanDistance = distance2(scan =Raphael.getPointAtLength(pathD, scanLength))) < bestDistance)
            {
                best = scan, bestLength = scanLength, bestDistance = scanDistance;
            }

        }
        // binary search for precise estimate
        precision /= 2;
        while (precision > 0.5)
        {
            var before,
                after,
                beforeLength,
                afterLength,
                beforeDistance,
                afterDistance;
            if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = Raphael.getPointAtLength(pathD,beforeLength))) < bestDistance)
            {
                best = before, bestLength = beforeLength, bestDistance = beforeDistance;
            }
            else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = Raphael.getPointAtLength(pathD,afterLength))) < bestDistance)
            {
                best = after, bestLength = afterLength, bestDistance = afterDistance;
            }
            else
            {
                precision /= 2;
            }
        }

        // best = [best.x, best.y];
        best.distance = Math.sqrt(bestDistance);
        best.length = bestLength;
        return best;

        function distance2(p) {
            // var dx = p.x - point[0],
            //     dy = p.y - point[1];
            var dx = p.x - point.x,
                dy = p.y - point.y;
            return dx * dx + dy * dy;
        }
    }

//计算两条路径之间的角度
function getIntersectionAngle(path1,path2)
{
        var pathData = {};

        var pathData1 = { d:$(path1).attr("d")};
        var pathData2 = { d:$(path2).attr("d")};

        var point =  Raphael.pathIntersection(pathData1.d, pathData2.d);

        if(point.length<1){
            return false;
        }
        pathData1.length = closestPoint(path1,point[0]).length;
        pathData1.beforePoint = path1.getPointAtLength(pathData1.length-4);
        pathData1.afterPoint = path1.getPointAtLength(pathData1.length+4);

        pathData2.length = closestPoint(path2,point[0]).length;
        pathData2.beforePoint = path2.getPointAtLength(pathData2.length-4);
        pathData2.afterPoint = path2.getPointAtLength(pathData2.length+4);

        var VectorDirection1 ={ x:pathData1.afterPoint.x - pathData1.beforePoint.x , y:pathData1.afterPoint.y - pathData1.beforePoint.y}
        var VectorDirection2 ={ x:pathData2.afterPoint.x - pathData2.beforePoint.x , y:pathData2.afterPoint.y - pathData2.beforePoint.y}

        var newV = VectorAngle(VectorDirection1,VectorDirection2)

        pathData.angle =newV;
        return pathData;
    }

//    求向量夹角
function VectorAngle(v1,v2){
    var cosV1V2 = (v1.x * v2.x + v1.y * v2.y) / (Math.sqrt(v1.x * v1.x + v1.y * v1.y)*Math.sqrt(v2.x * v2.x + v2.y * v2.y));
    return Math.round((Math.acos(cosV1V2) * 180 / Math.PI)*100) / 100;
}


//要求传入的是json对象 得到两点的直线距离
function compareLength(point1,point2){
    var result,calx,caly;
    calx = point2.x - point1.x;
    caly = point2.y - point1.y;
    result = Math.round((Math.pow((calx*calx + caly*caly),0.5)))
    return result;
}



//计算角度的向量,返回四个方向的向量
function getAngleVertor(elem,pt){

    if(typeof(elem) == 'Array'){
        elem == elem[0];
    }

    var angle = parseFloat($("#AL_angle").val());

    if(isNaN(angle)){
        angle = 90;
    }


    var vertor;

    var point1 = elem.getPointAtLength(pt.length - 1);
    var point2 = elem.getPointAtLength(pt.length + 1);

    vertor = getVector(point1,point2);

    var referLen = 40;

    var point1 = {
        x:vertor.direction.x * referLen + pt.x,
        y:vertor.direction.y * referLen + pt.y
    }

    var point2 = {
        x:vertor.Undirection.x * referLen + pt.x,
        y:vertor.Undirection.y * referLen + pt.y
    }


    var point3 = {
        x:vertor.vertor.x * referLen + pt.x,
        y:vertor.vertor.y * referLen + pt.y
    }

    var point4 = {
        x:vertor.Unvertor.x * referLen + pt.x,
        y:vertor.Unvertor.y * referLen + pt.y
    }


    var referD ="M " + point1.x + "," + point1.y +" L" +  point2.x + "," + point2.y;
    var referD2 ="M " + point3.x + "," + point3.y +" L" +  point4.x + "," + point4.y;

    if($("#svgcontent #anglePathgroup").length < 1){

        var nodeG =  document.createElementNS(svgNS, "g");
        nodeG.setAttribute("id","anglePathgroup");
        $("#svgcontent").append(nodeG);

    }


    var trans1 = "r"+angle+","+pt.x+","+pt.y;
    var trans2 = "r"+(-angle)+","+pt.x+","+pt.y;


    var newreferD1,newreferD2;

    if(angle == 90){
        newreferD1 = referD2;
        newreferD2 = referD;
    }else{
        newreferD1 = Raphael.transformPath(referD2, trans1).toString();
        newreferD2 = Raphael.transformPath(referD2, trans2).toString();
    }


    // console.log("点后对比,角度=====",trans1,trans2)
    // console.log("点后对比,转换以前的=====",referD2)
    // console.log("点后对比,转换以后的=====",newreferD1,newreferD2)

    if($("#anglePathgroup #refPath1").length <1){

        var refPath0 =  document.createElementNS(svgNS, "path");
        svgedit.utilities.assignAttributes(refPath0, {
            id: "refPath1",
            d: newreferD1,
            stroke:"#0f2",
            "stroke-dasharray":"3 4",
            fill:"none"
        });

        var refPath1 =  document.createElementNS(svgNS, "path");
        svgedit.utilities.assignAttributes(refPath1, {
            id: "refPath2",
            d: newreferD2,
            stroke:"#0f2",
            "stroke-dasharray":"3 4",
            fill:"none"
        });

        $("#anglePathgroup").append(refPath0);

        $("#anglePathgroup").append(refPath1);
    }else{

        $("#refPath1").attr("d",newreferD1);
        $("#refPath2").attr("d",newreferD2);

    }


    //获取方向向量
    var pathdata1 = getPointData(newreferD1);
    var pathdata2 = getPointData(newreferD2);

    var newVertor1 = getVector(pathdata1.start,pathdata1.end);
    var newVertor2 = getVector(pathdata2.start,pathdata2.end);

    var newVertor = {
        v0: newVertor1.vertor,
        v1: newVertor1.Unvertor,
        v2: newVertor2.vertor,
        v3: newVertor2.Unvertor
    }


    return newVertor;
}

//绘制角度线
function getAngleReferLine(elem,pt){

    var newVertor = getAngleVertor(elem,pt);

    //以下为创建角度线
    var anglePath =  document.createElementNS(svgNS, "path");
    svgedit.utilities.assignAttributes(anglePath, {
        id: svgCanvas.getNextId(),
        d: "M "+ pt.x +","+ pt.y,
        stroke:"#fff",
        fill:"none"
    });
    $("#svgcontent g:first-child").append(anglePath);

    addPathMark(anglePath);


    var angleLen =  document.createElementNS(svgNS, "text");
    svgedit.utilities.assignAttributes(angleLen, {
        id: "angleLen",
        x:pt.x,
        y:pt.y,
        stroke:"#fff",
        fill:"none"
    });
    $("#anglePathgroup").append(angleLen);

    var thisID = svgCanvas.getId();

    $("#svgroot").mousemove(function(evt){

        var pt2 = svgedit.math.transformPoint( evt.pageX, evt.pageY,  $('#svgcontent g')[0].getScreenCTM().inverse());

        var newAngleD = "M "+ pt.x +","+ pt.y + " L " + pt2.x + "," + pt2.y;

        var length = Math.round(compareLength(pt, pt2));

        $(angleLen).attr({
            x:(pt.x + pt2.x)/2,
            y:(pt.y + pt2.y)/2
        });

        angleLen.textContent = length;

        $("#"+ thisID).attr("d",newAngleD);

        //如果角度发生改变

        var ie = !!window.ActiveXObject;
        if(ie){
            $("#AL_angle")[0].onpropertychange = function(){
                newVertor = getAngleVertor(elem,pt);
            };
        }else{
            $("#AL_angle")[0].addEventListener("input",function(){

                newVertor = getAngleVertor(elem,pt);
            },false);
        }


        $("#svgroot").on("mousedown",function(evt){

            $("#svgroot").unbind("mousemove");

            var pt2 = svgedit.math.transformPoint( evt.pageX, evt.pageY,  $('#svgcontent g')[0].getScreenCTM().inverse());

            var newV = getVector(pt,pt2).vertor;

            // console.log("这个是新的向量",newV);

            var judAngle = [];

            for(var i in newVertor){

                judAngle.push(VectorAngle(newV,newVertor[i]));

            }

            var minAng = Math.min.apply(null,judAngle)
            var ind = judAngle.indexOf(minAng);

            var len = parseFloat($("#AL_Length").val()) || 50;

            var pointzd = {
                x:newVertor["v"+ind].x * len + pt.x,
                y:newVertor["v"+ind].y * len + pt.y
            }

            // console.log(newVertor["v"+ind],pointzd);

            var AngleD = "M "+ pt.x +","+ pt.y + " L " + pointzd.x + "," + pointzd.y;

            $("#"+ thisID).attr("d",AngleD);

            var defalutAttr = $(elem).attr("_attrColor");

            if(defalutAttr){
                $(elem).attr({stroke:defalutAttr});
                elem.removeAttribute("_attrColor");
            }


            $("#anglePathgroup").remove();
            $("#pointLineGroup").children().remove();

            $("#svgroot").unbind("mousedown");
        })


    });

    // PathColor(elem);

    return true;
}



//绘制路径添加文字
function addText(){
    $("#svgroot").unbind("mousedown");
    $("#svgroot").mousedown(function(evt){
        if(evt.button == 0 && (thisTool == 'everyText' || thisTool == 'textClick' )){
            var pt,points2;
            if(publicCount%2 == 1) {
                console.log("添加文字啊啊=====publicCount，现在展示弹出框："+publicCount)
                $("#svgroot").unbind("mousemove");
                $("#PopupBox").show();
                $("#textInpbox").siblings().hide();
                $("#textInpbox").show();
                $("#textInp").val("");
                publicCount++;
            }
            else if(publicCount%2 == 0) {
                console.log("添加文字啊啊=====publicCount"+publicCount)
                pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                var idn = $("#textGroup").find("path").length;
                var textPath = document.createElementNS(svgNS, "path");
                svgedit.utilities.assignAttributes(textPath, {
                    id: "textPath_" + idn,
                    d: "M " + pt.x + " " + pt.y + " L" + pt.x + " " + pt.y,
                    stroke: "#fff",
                    fill: "none",
                    'display' : 'inline',
                    "stroke-width": 1 / svgCanvas.getCanvasScale(),
                });
                $("#textGroup").append(textPath);

                $("#svgroot").on("mousemove",function(evt){
                    points2 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse())
                    var d = "M " + pt.x + "," + pt.y + " T " + points2.x + "," + points2.y;
                    $("#textPath_" + idn).attr("d", d);
                })
                publicCount++;
            }
        }
        else{
            $("#svgroot").unbind("mousedown");
            publicCount = 0;
            return;
        }
    });
}

//裁片属性设置
function setCutPartAttr() {
    var points2,idn;
    var WovenDesignPoints = [];

    console.log("publicCount" + publicCount);
    $("#svgroot").on("mousedown",function(evt){
        var pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse())
        var IdCount = IsIncutpart(pt);
        if(IdCount){
            WovenDesignPoints.push(pt);
        }
        var vertors  =[];
        if(thisTool == 'AttrDefinition'){

            if (publicCount % 2 == 1) {
                console.log("publicCount" + publicCount);

                $("#svgroot").unbind("mousemove");

                $("#PopupBox").show();
                $("#WovenDesignAttrSet").siblings().hide();
                $("#WovenDesignAttrSet").show();

                var sptId = IdCount.split("_");
                var Count = IdCount.split("_")[1];
                $("#modelName").val("裁片"+Count);

                // $("#cutpartsgroup_"+number).attr({attr_tempNum:tempNum,attr_cutName:cutName,attr_cutNum:cutNum,attr_remark:remark,attr_fabric:fabric})
                var tempNum = $("#cutpartsgroup_"+Count).attr("attr_tempNum");
                var cutName = $("#cutpartsgroup_"+Count).attr("attr_cutName");
                var cutNum = $("#cutpartsgroup_"+Count).attr("attr_cutNum");
                var remark = $("#cutpartsgroup_"+Count).attr("attr_remark");
                var fabric = $("#cutpartsgroup_"+Count).attr("attr_fabric");

                $("#templateNumber").val(tempNum);
                $("#cutpartName").val(cutName);
                $("#cutPartNum").val(cutNum);
                $("#Remarks").val(remark);
                $("#clothfabric").find("option[text="+fabric+"]").attr("selected",true);

                //重新定位裁片属性显示的位置：




                WovenDesignPoints.splice(0, WovenDesignPoints.length);
                publicCount++;
            }
            else if (publicCount % 2 == 0 && IdCount){
                if(WovenDesignPoints.length>0){
                    console.log("publicCount" + publicCount);
                    publicCount++;

                    idn = IdCount.split("_")[1];
                    var hasthisPath = $("#WovenDesigngroup").find("#WovenDesign_"+idn)

                    if(hasthisPath.length>0){
                        $(hasthisPath).remove();
                        $("#WovenDesigngroup defs").find("#Arrow_"+idn).remove();
                        console.log($("#WovenDesigngroup defs").find("#Arrow_"+idn));
                    }

                    var Woven_path = document.createElementNS(svgNS, "path");
                    svgedit.utilities.assignAttributes(Woven_path, {
                        id: "WovenDesign_" + idn,
                        d: "M " + WovenDesignPoints[0].x + " " + WovenDesignPoints[0].y + " T " + WovenDesignPoints[0].x + " " + WovenDesignPoints[0].y,
                        stroke: "#f01",
                        fill: "none",
                        "stroke-width": 1 / svgCanvas.getCanvasScale(),
                        style: "marker-end:url(#Arrow_" + idn + ")"
                    });
                    $("#WovenDesigngroup").append(Woven_path);

                    var WovenMark = document.createElementNS(svgNS, "marker");
                    svgedit.utilities.assignAttributes(WovenMark, {
                        "id": "Arrow_" + idn,
                        "markerWidth": 4,
                        "markerHeight": 8,
                        "refX": 4,
                        "refY": 4,
                    });
                    $("#WovenDesigngroup defs").append(WovenMark);

                    var MarkPath = document.createElementNS(svgNS, "path");
                    MarkPath.setAttribute("d", "M 0 0 4 4 0 8");
                    MarkPath.setAttribute("style", "stroke:red;fill:none;");
                    $("#Arrow_" + idn).append(MarkPath);

                    var RotateDeg = {};
                    RotateDeg = {d: "M 0 0 4 4 0 8", markerWidth: 4, markerHeight: 8, refX: 4, refY: 4};


                    $("#svgroot").on("mousemove",function(evt){
                        var pt2 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                        var distance = compareLength(WovenDesignPoints[0], pt2);
                        vertors[0] = getVector({x: 0, y: 0}, {x: 1, y: 0}).vertor;

                        var vertor1 = getVector(WovenDesignPoints[0], pt2);
                        var angle = VectorAngle(vertors[0], vertor1.vertor);

                        points2 = {
                            x: vertors[0].x * distance + WovenDesignPoints[0].x,
                            y: vertors[0].y * distance + WovenDesignPoints[0].y
                        };

                        if (vertor1.vertor.y < 0) {
                            if (angle < 23) {
                                points2 = {
                                    x: vertors[0].x * distance + WovenDesignPoints[0].x,
                                    y: vertors[0].y * distance + WovenDesignPoints[0].y
                                };
                                RotateDeg = {d: "M 0 0 4 4 0 8", markerWidth: 4, markerHeight: 8, refX: 4, refY: 4};
                            }
                            else if (angle >= 23 && angle < 68) {
                                vertors[1] = getVector({x: 0, y: 0}, {x: 1, y: -1}).vertor;
                                points2 = {
                                    x: vertors[1].x * distance + WovenDesignPoints[0].x,
                                    y: vertors[1].y * distance + WovenDesignPoints[0].y
                                };
                                RotateDeg = {d: "M 0 0 4 0 4 4", markerWidth: 4, markerHeight: 4, refX: 3, refY: 1};
                            }
                            else if (angle >= 68 && angle < 113) {
                                vertors[2] = getVector({x: 0, y: 0}, {x: 0, y: -1}).vertor;
                                points2 = {
                                    x: vertors[2].x * distance + WovenDesignPoints[0].x,
                                    y: vertors[2].y * distance + WovenDesignPoints[0].y
                                };
                                RotateDeg = {d: "M 0 4 4 0 8 4", markerWidth: 8, markerHeight: 4, refX: 4, refY: 0};
                            } else if (angle >= 113 && angle < 158) {
                                vertors[3] = getVector({x: 0, y: 0}, {x: -1, y: -1}).vertor;
                                points2 = {
                                    x: vertors[3].x * distance + WovenDesignPoints[0].x,
                                    y: vertors[3].y * distance + WovenDesignPoints[0].y
                                };
                                RotateDeg = {d: "M 0 4 0 0 4 0", markerWidth: 4, markerHeight: 4, refX: 1, refY: 1};
                            }
                            else if (angle >= 158 && angle < 180) {
                                vertors[4] = getVector({x: 0, y: 0}, {x: -1, y: 0}).vertor;
                                points2 = {
                                    x: vertors[4].x * distance + WovenDesignPoints[0].x,
                                    y: vertors[4].y * distance + WovenDesignPoints[0].y
                                };
                                RotateDeg = {d: "M 4 0 0 4 4 8", markerWidth: 4, markerHeight: 8, refX: 0, refY: 4};
                            }
                        }
                        else if (vertor1.vertor.y > 0) {
                            if (angle < 23) {
                                points2 = {
                                    x: vertors[0].x * distance + WovenDesignPoints[0].x,
                                    y: vertors[0].y * distance + WovenDesignPoints[0].y
                                };
                                RotateDeg = {d: "M 0 0 4 4 0 8", markerWidth: 4, markerHeight: 8, refX: 4, refY: 4};
                            } else if (angle >= 23 && angle < 68) {
                                vertors[5] = getVector({x: 0, y: 0}, {x: 1, y: 1}).vertor;
                                points2 = {
                                    x: vertors[5].x * distance + WovenDesignPoints[0].x,
                                    y: vertors[5].y * distance + WovenDesignPoints[0].y
                                };
                                RotateDeg = {d: "M 4 0 4 4 0 4", markerWidth: 4, markerHeight: 4, refX: 3, refY: 3};
                            } else if (angle >= 68 && angle < 113) {
                                vertors[6] = getVector({x: 0, y: 0}, {x: 0, y: 1}).vertor;
                                points2 = {
                                    x: vertors[6].x * distance + WovenDesignPoints[0].x,
                                    y: vertors[6].y * distance + WovenDesignPoints[0].y
                                };
                                RotateDeg = {d: "M 0 0 4 4 8 0", markerWidth: 8, markerHeight: 4, refX: 4, refY: 4};
                            } else if (angle >= 113 && angle < 158) {
                                vertors[3] = getVector({x: 0, y: 0}, {x: -1, y: 1}).vertor;
                                points2 = {
                                    x: vertors[3].x * distance + WovenDesignPoints[0].x,
                                    y: vertors[3].y * distance + WovenDesignPoints[0].y
                                };
                                RotateDeg = {d: "M 0 0 0 4 4 4", markerWidth: 4, markerHeight: 4, refX: 1, refY: 3};
                            } else if (angle >= 158 && angle < 180) {
                                vertors[4] = getVector({x: 0, y: 0}, {x: -1, y: 0}).vertor;
                                points2 = {
                                    x: vertors[4].x * distance + WovenDesignPoints[0].x,
                                    y: vertors[4].y * distance + WovenDesignPoints[0].y
                                };
                                RotateDeg = {d: "M 4 0 0 4 4 8", markerWidth: 4, markerHeight: 8, refX: 0, refY: 4};
                            }
                        }

                        var d = "M " + WovenDesignPoints[0].x + " " + WovenDesignPoints[0].y + " L " + points2.x + " " + points2.y;
                        $("#WovenDesign_" + idn).attr("d", d);

                        $(MarkPath).attr("d", RotateDeg.d);
                        $(WovenMark).attr({
                            "markerWidth": RotateDeg.markerWidth,
                            "markerHeight": RotateDeg.markerHeight,
                            "refX": RotateDeg.refX,
                            "refY": RotateDeg.refY
                        });
                    });

                }
            }
        }else{
            $("#svgroot").unbind("mousedown");
            return;
        }


    });

}

function drawParallel(pathEle,pt){

    var paralleldis,
        pointArr = [],
        distance = $("#equidistance").val(),
        lineCount = $("#lineCount").val(),
        Pointlen = closestPoint(pathEle,pt),
        plen = Pointlen.length;


    console.log("平行线publicCount，才开始划线 移动：");

    $("#steps").html("请移动鼠标选择绘制平行线的方向以及位置，点击即可绘制！也可以在上面输入数据，点击绘制");

    var beforepoint = pathEle.getPointAtLength(plen+1),
        afterpoint = pathEle.getPointAtLength(plen-1);

    var v = getVector(beforepoint,afterpoint);
    var vertor = v.Undirection;


    var para_line = document.createElementNS(svgNS, "line");
    svgedit.utilities.assignAttributes(para_line, {
        id: "para_line",
        x1: Pointlen.x,
        y1:Pointlen.y,
        x2:Pointlen.x,
        y2:Pointlen.y,
        style: "stroke:green;stroke-dasharray:2 3;fill:none;"
    });
    $("#pointLineGroup").append(para_line);


    var para_lenT = document.createElementNS(svgNS, "text");
    svgedit.utilities.assignAttributes(para_lenT, {
        id: "para_lenT",
        x: Pointlen.x+2,
        y:Pointlen.y+2,
        style: "stroke:green;fill:none;"
    });
    $("#pointLineGroup").append(para_lenT);

    $("#svgroot").on("mousemove",function(evt){

        var px2,py2;

        var pt2 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());

        paralleldis =distanceTwoPoint(pt,pt2);

        var direction = getVector(pt,pt2).vertor;

        var angleDir = VectorAngle(v.direction,direction);
        var angleUndir = VectorAngle(v.Undirection,direction);


        if(angleUndir > angleDir){
            paralleldis = -paralleldis;
        }

        px2 = v.Undirection.x *paralleldis + pt.x;
        py2 = v.Undirection.y *paralleldis + pt.y;

        $("#para_line").attr({x2:px2,y2:py2})

        var line_len =compareLength(Pointlen,{x:px2,y:py2});
        var midPoint = {x:v.Undirection.x *paralleldis/2 + pt.x,y:v.Undirection.y *paralleldis / 2 + pt.y}

        $("#para_lenT").attr({x:midPoint.x,y:midPoint.y})

        $("#para_lenT")[0].textContent = line_len;

    });

    $("#svgroot").on("mousedown",function(evt){
        $("#svgroot").unbind("mousemove mousedown");

        $("#pointLineGroup").children().remove();

        distance = $("#equidistance").val();
        if(distance==0){
            distance = paralleldis
        }else{
            if(paralleldis < 0){
                distance = -distance;
            }
        }

        console.log(distance)

        if(!distance){
            PathColor(pathEle);
            return;
        }

        console.log("lineCount===",lineCount)

        for (var num = 1; num <= lineCount; num++) {
            var equidistance = distance * num;
            getPathPointVector(pathEle, equidistance,$("#svgcontent g:first-child"),true);
        }

        PathColor(pathEle);
    });

}

/*
*传入一个点，判断该点是不是在裁片的内部
*如果没有在CIA片内，返回false
* 如果在裁片内部，返回裁片id
**/
function IsIncutpart(point){
    var Closedpaths = $("#ClosedPathGroup").find("path");

    for(var i=0;i<Closedpaths.length;i++){

        var pathd = $(Closedpaths[i]).attr("d");

        if(Raphael.isPointInsidePath(pathd, point.x, point.y)){

            var sptId = $(Closedpaths[i]).attr("id").split("_");

            var Idc;

            if(sptId.length == 2){

                Idc = "cutpartsgroup_"+sptId[1];

            }else{

                Idc = "cutpartsgroup_"+sptId[1]+"_"+sptId[2];

            }


            return  Idc;
        }
    }
    return false;
}
/*
* 获取对称路径
* 传入原路径以及对称路径
* 传入格式是d值或者对象
* */
function getMirrPath(elem,mirElem){
    if(typeof(elem) == 'object'){
        // elem =
    }
}


$("#exportRule").click(function (evt) {
    publicCount = 0;
    thisTool = this.id;
    $("#exportRuleTable").show()
})

$("#AttrSet_confirm").click(function(){

    // var num = $("#modelName").val();
    // var number = num.charAt(num.length - 1);
    var num = $("#modelName").val().split("_");

    var number;

    if(num.length  == 3){

        number = num[1]+"_"+num[2];

    }else{

        number = num[1];

    }

    var tempNum = $("#templateNumber").val();

    var cutName = $("#cutpartName").val();
    var cutNum = $("#cutPartNum").val();
    var remark = $("#Remarks").val();
    var fabric = $("#clothfabric option:selected").text();

    $("#cutpartsgroup_"+number).attr({attr_tempNum:tempNum,attr_cutName:cutName,attr_cutNum:cutNum,attr_remark:remark,attr_fabric:fabric})
    if(cutName !="" && cutNum != "" && remark != "" && fabric != ""){
        $("#WovenDesign_"+number).attr("stroke","#093");
        $("#Arrow_"+number).find("path").css("stroke","#093");

        var wovenD = $("#WovenDesign_"+number).attr("d");
        for(var i = 1; i<4; i++){
            var tr1 = 12*i;

            if(i == 3){
                tr1 = -12;
            }

            var newPad = getParallelPath22(wovenD,tr1);

            var newPaddata = getPointData(newPad);
            var vertor = getVector(newPaddata.start,newPaddata.end).vertor;
            if(vertor.x < 0){
                newPad = ReversePath(newPad);
            }

            if($("#curPartAttr").find("#attrPath_"+number+"_"+i).length > 0){

                $("#attrPath_"+number+"_"+i).attr("d",newPad);

                switch (i){
                    case 1:
                        $("WovenDesign_"+number+'_txtPath1').textContent = cutName + " * "+cutNum;
                        break;
                    case 2:
                        $("WovenDesign_"+number+'_txtPath2').textContent = "备注："+remark;
                        break;
                    case 3:
                        $("WovenDesign_"+number+'_txtPath3').textContent = fabric;
                        break;
                }



            }else{
                var paraPath = document.createElementNS(svgNS, 'path');
                svgedit.utilities.assignAttributes(paraPath, {
                    id:"attrPath_"+number+"_"+i,
                    class:"WovenDesign_"+number,
                    "d":newPad,
                    "stroke":"#fff",
                    display:"none"
                });
                $("#curPartAttr").append(paraPath);

                //添加文字
                var text = document.createElementNS(svgNS, 'text');
                svgedit.utilities.assignAttributes(text, {
                    id:"WovenDesign_"+number + "_txt"+i,
                    class:"WovenDesign_"+number,
                    'style' : 'text-anchor:middle;stroke-width:0.5;fill:#fff;font-size:8px;pointer-events:none'
                });
                $("#curPartAttr").append(text);

                var textPath = document.createElementNS(svgNS, 'textPath');
                svgedit.utilities.assignAttributes(textPath, {
                    id: "WovenDesign_"+number+'_txtPath'+i,
                    'xlink:href' : "#attrPath_"+number+"_"+i,
                    'startOffset' : '50%'
                });
                text.appendChild(textPath);

                switch (i){
                    case 1:
                        textPath.textContent = cutName + " * "+cutNum;
                        break;
                    case 2:
                        textPath.textContent = "备注："+remark;
                        break;
                    case 3:
                        textPath.textContent = fabric;
                        break;
                }

            }

        }

    }
});



function drawIncircle2(pathArr){

    if(pathArr.length != 2){

        $("#steps").html("请选择"+"<span style='color:#f00;font-size: 16px;'>两条</span>"+"相交的直线绘制内切圆!");

        return false;

    }

    var interPoint = [];

    //延长一下路径获取交点
    var path1 = extendPath(pathArr[0],false,10);
    var path2 = extendPath(pathArr[1],false,10);

    interPoint= Raphael.pathIntersection(path1, path2)[0];

    if( !interPoint || interPoint.length<1){

        $("#steps").html("请选择两条"+"<span style='color:#f00;font-size: 16px;'>相交的</span>"+"直线绘制内切圆！您刚才的选择不合理！！！");

        PathColor(pathArr[0]);
        PathColor(pathArr[1]);
        return false;

    }

    console.log(interPoint)

    var beginText = document.createElementNS(svgNS, "text");
    beginText.setAttribute("style","fill:green;font-size:11px;")

    var beginLine = document.createElementNS(svgNS, "line");
    svgedit.utilities.assignAttributes(beginLine, {
        id: "beginLine",
        x1: interPoint.x,
        y1: interPoint.y,
        x2: interPoint.x,
        y2: interPoint.y,
        r: 2,
        style: "stroke:green;fill:none;stroke-dasharray:2 3;"
    });

    $("#pointLineGroup").append(beginLine);
    $("#pointLineGroup").append(beginText);

    var svgroot = document.getElementById("svgroot");

    var InsidePath = document.createElementNS(svgNS, "path");
    svgedit.utilities.assignAttributes(InsidePath, {
        id: svgCanvas.getNextId(),
        d: "M 0,0",
        stroke:"#fff",
        fill:"none"
    });
    $("#svgcontent g:first-child").append(InsidePath);

    var insidePathId = svgCanvas.getId();


    $("#svgroot").on("mousemove",function(evt){

        var pt = svgedit.math.transformPoint( evt.pageX, evt.pageY,  $('#svgcontent g')[0].getScreenCTM().inverse());

        beginLine.setAttribute("x2",pt.x);
        beginLine.setAttribute("y2",pt.y);
        $(beginText).attr({x:(pt.x - interPoint.x)/2 +interPoint.x,y:(pt.y - interPoint.y)/2 +interPoint.y});
        beginText.textContent = compareLength(interPoint,pt);

        //以下为 动态绘制内切圆

        var pointB = closestPoint(pathArr[0],pt);

        var pointC = closestPoint(pathArr[1],pt);

        var incenter = getIncircleCenter(interPoint,pointB,pointC,pt);

        // console.log(incenter);
        // console.log(pointC);

        var radius = distancePoint(incenter , pt);

        var newPathd;
        if(!isNaN(incenter.x)){

            if($("#pointLineGroup path").length > 0){
                $("#incircle").remove();
            }
            var incir = document.createElementNS(svgNS, "circle");
            svgedit.utilities.assignAttributes(incir, {
                id: "incircle",
                cx: incenter.x,
                cy: incenter.y,
                r: radius+1
            });
            $("#pointLineGroup").append(incir);
            svgCanvas.convertToPath(incir);

            var path0 = document.getElementById("incircle");

            var cirInterPoint1= Raphael.pathIntersection($(pathArr[0]).attr("d"), $(path0).attr("d"));
            var cirInterPoint2= Raphael.pathIntersection($(pathArr[1]).attr("d"), $(path0).attr("d"));

            var InterPoint1 = cirInterPoint1[0],
                InterPoint2 = cirInterPoint2[0],
                len1 = [],
                len2 = [];

            if(cirInterPoint1.length !=0 && cirInterPoint2.length !=0){

                len1.push(compareLength(interPoint,cirInterPoint1[0]));
                len2.push(compareLength(interPoint,cirInterPoint2[0]));

                if(cirInterPoint1.length>1){
                    for(var i = 1;i<cirInterPoint1.length;i++){
                        len1.push(compareLength( interPoint,cirInterPoint1[i] ));
                        if(len1[i]<len1[0]){
                            len1[0] = len1[i];
                            InterPoint1 = cirInterPoint1[i];
                        }
                    }
                }

                if(cirInterPoint2.length>1){
                    for(var i = 1;i<cirInterPoint2.length;i++){
                        len2.push(compareLength( interPoint,cirInterPoint2[i] ));
                        if(len2[i]<len2[0]){
                            len2[0] = len2[i];
                            InterPoint2 = cirInterPoint2[i];
                        }
                    }
                }

                paper.install(window);
                paper.setup();
                var cirPoints = [];

                var myPath = new Path();
                //进行角度判断
                var v1 = getVector(incenter,InterPoint1).vertor;
                var v2 = getVector(incenter,InterPoint2).vertor;
                var v3 = getVector(interPoint,incenter).vertor;
                var angle1 = VectorAngle(v1,{x:1,y:0});
                var angle2 = VectorAngle(v2,{x:1,y:0});

                if(v1.y<0){ angle1 =360-angle1 }
                if(v2.y<0){ angle2 =360-angle2; }
                var start = angle1,end=angle2;

                if(angle2 < angle1){  start = angle2,end=angle1; }
                if(v1.y<0 && v2.y>0 ||v1.y>0&& v2.y<0){
                    if(v3.x<0){
                        var s = start;
                        start = -(360-end);
                        end = s;
                    }
                }

                // console.log(start+"起点终点比较："+end)
                for(var i=start-4;i<=end+4;i+=5){
                    var point = {}
                    point = {x:radius*Math.cos(i*Math.PI / 180) + incenter.x,y:radius*Math.sin(i*Math.PI / 180)+incenter.y}
                    cirPoints.push({point:point,angle:Math.cos(i*Math.PI / 180)});
                    myPath.add(new Point(point.x, point.y));
                }
                myPath.simplify();

                var cpath1 = paper.project.exportSVG(myPath);
                newPathd = $(cpath1).find("path").attr("d");

                $("#"+insidePathId).attr("d",newPathd);

            }else{
                $("#steps").html("请重新选择合适的直线及距离绘制！");
                svgroot.onmousedown = null;
                // $("#pointLineGroup").children().remove();
            }
        }
        else{
            $("#steps").html("请不要把鼠标移到两条线的夹角之外！！！！")
        }



        svgroot.onmousedown = function (evt) {

            $("#svgroot").unbind("mousemove");

            $("#pointLineGroup").children().remove();

            var defalutC0 = $(pathArr[0]).attr("_attrColor");
            var defalutC1 = $(pathArr[1]).attr("_attrColor");

            $(pathArr[0]).attr("stroke",defalutC0);

            $(pathArr[1]).attr("stroke",defalutC1);


            //去掉多余的路径
            if( InterPoint1 && InterPoint2){
                var newPathd1,
                    newPathd2,
                    path1D = $(pathArr[0]).attr("d"),
                    path2D = $(pathArr[1]).attr("d");

                var insidePathd = extendPath(newPathd,false,100),
                    pointMid1 = Raphael.pathIntersection(path1D,insidePathd)[0],
                    pointMid2 = Raphael.pathIntersection(path2D,insidePathd)[0];

                if(!pointMid1 || !pointMid2){
                    console.log("我反悔了啊")
                    return;
                }

                var path1_length1 = closestPoint(path1D,interPoint).length,
                    path2_length1 = closestPoint(path2D,interPoint).length,
                    path1_length2 = closestPoint(path1D,pointMid1).length,
                    path2_length2 = closestPoint(path2D,pointMid2).length,

                    insidePath_length1 = closestPoint(insidePathd,pointMid1).length,
                    insidePath_length2 = closestPoint(insidePathd,pointMid2).length;

                //重绘圆弧
                if(insidePath_length1 > insidePath_length2){
                    var LL = insidePath_length1;
                    insidePath_length1 = insidePath_length2;
                    insidePath_length2 = LL;
                }

                var newInsidePath = Raphael.getSubpath(insidePathd,insidePath_length1,insidePath_length2);

                $("#"+insidePathId).attr("d",newInsidePath);


                //我现在应该判断交点处是起点还是终点，
                // 如果是起点，那就返回从 交点到终点的路径，
                // 如果是终点，那返回从起点到交点的路径

                //判断 从两条路径的交点 到 后面 圆和路径的切点 的走向，
                // 如果 交点 到切点 ， length 变大 代表路径从 起点 走向 终点   返回从 交点到终点的路径，
                // 如果 交点 到 切点，length 变小 代表路径 从终点走向起点      返回从起点到交点的路径

                //先判断第一条线 length变大，路径从 起点 走向 终点，返回从 交点到终点的路径，
                if(path1_length1 < path1_length2){
                    var path1_length3 = Raphael.getTotalLength(path1D);
                    newPathd1 = Raphael.getSubpath(path1D,path1_length2,path1_length3);
                }
                //length 变小 代表路径 从终点走向起点      返回从起点到交点的路径
                else if(path1_length1 > path1_length2){
                    newPathd1 = Raphael.getSubpath(path1D,0,path1_length2);
                }

                //判断第二条线 length变大，路径从 起点 走向 终点，返回从 交点到终点的路径，
                if(path2_length1 < path2_length2){
                    var path2_length3 = Raphael.getTotalLength(path2D);
                    newPathd2 = Raphael.getSubpath(path2D,path2_length2,path2_length3);
                }
                //length 变小 代表路径 从终点走向起点      返回从起点到交点的路径
                else if(path2_length1 > path2_length2){
                    newPathd2 = Raphael.getSubpath(path2D,0,path2_length2);
                }

                //替换原来的d值
                $(pathArr[0]).attr("d",newPathd1);
                $(pathArr[1]).attr("d",newPathd2);







            }

            // var newd1 = Raphael.getSubpath($(pathArr[0]).attr("d"))

            svgroot.onmouseup = function(){
                svgroot.onmousedown = null;
                $("#pointLineGroup").children().remove();
                $(path0).remove()
                svgroot.onmouseup = null;
            }
        }



    })


}

function addKnifeMark() {
    var len = 0,
        markPoint,
        kMarkPaths = [],
        kMark_length = $("#kMark_length").val(),
        kMark_ratio = $("#kMark_ratio").val(),
        markLength,kMark_ratioL;

    var paths = $("#svgcontent g:first-child path[stroke=red]");

    for(var i = 0;i<paths.length;i++){
        kMarkPaths.push({
            d:$(paths[i]).attr("d"),
            p:{
                x: $(paths[i]).attr("attr_ptx"),
                y: $(paths[i]).attr("attr_pty")
            },
            id:paths[i].id
        });
        paths[i].removeAttribute("attr_ptx");
        paths[i].removeAttribute("attr_pty");
    }


    if(kMarkPaths.length == 2){
        var interPoint = Raphael.pathIntersection(kMarkPaths[0].d, kMarkPaths[1]);
        if(interPoint.length>0){
            var dis1,dis2;

            var pathData1 = getPointData(kMarkPaths[0].d);

            dis1 = distanceTwoPoint(kMarkPaths[0].p, pathData1.start);
            dis2 = distanceTwoPoint(kMarkPaths[0].p, pathData1.end);

            var idNum = kMarkPaths[0].id.split("_")[1];

            markPoint = interPoint[0];

            var markL = closestPoint(kMarkPaths[0].d,interPoint[0]).length;
            var v = getVector(Raphael.getPointAtLength(kMarkPaths[0].d,markL-1),Raphael.getPointAtLength(kMarkPaths[0].d,markL+1));

            var mark = document.createElementNS(svgNS, "line");
            svgedit.utilities.assignAttributes(mark, {
                id: "markfor_"+idNum+"_"+markL,
                x1: v.vertor.x * 4+markPoint.x,
                y1: v.vertor.y * 4+markPoint.y,
                x2: v.Unvertor.x * 4+markPoint.x,
                y2: v.Unvertor.y * 4+markPoint.y,
                r: 2,
                style: "stroke:#f90;fill::#f90;"
            });
            $("#knifeMarksgroup").append(mark);

            var defaultC1 = $("#"+kMarkPaths[0].id).attr("_attrColor");
            var defaultC2 = $("#"+kMarkPaths[1].id).attr("_attrColor");
            $("#"+kMarkPaths[0].id).attr("stroke",defaultC1);
            $("#"+kMarkPaths[1].id).attr("stroke",defaultC2);

            return;
        }
    }

    markLength = kMark_length;
    for(var i = 0,beforepoint,afterpoint,dis1,dis2;i<kMarkPaths.length;i++){

        var pathdata = getPointData(kMarkPaths[i].d);
        dis1 = distanceTwoPoint(kMarkPaths[i].p,pathdata.start);
        dis2 = distanceTwoPoint(kMarkPaths[i].p,pathdata.end);

        markPoint = pathdata.start;
        beforepoint = pathdata.start;
        kMark_ratioL = kMark_ratio*pathdata.len;


        if(kMark_length == 0 && kMark_ratioL==0){
            afterpoint = Raphael.getPointAtLength(kMarkPaths[i].d,1);
            if(dis2 < dis1){
                markPoint = pathdata.end;
                beforepoint = Raphael.getPointAtLength(kMarkPaths[i].d,pathdata.len-1);
                afterpoint = pathdata.end;
                markLength = pathdata.len;
            }
        }else if(kMark_length>0 && kMark_ratioL>0){
            if(kMark_ratioL > kMark_length){
                markLength = kMark_ratioL;
            }
            if(dis2 < dis1){
                markLength = pathdata.len - markLength;
            }

            markPoint =  Raphael.getPointAtLength(kMarkPaths[i].d,markLength);
            beforepoint = Raphael.getPointAtLength(kMarkPaths[i].d,markLength-1);
            afterpoint =  Raphael.getPointAtLength(kMarkPaths[i].d,+1);

        }else if(kMark_length>0 || kMark_ratioL>0){
            markLength =kMark_length;
            if(kMark_ratioL>0){
                markLength =kMark_ratioL;
            }
            if(dis2 < dis1){
                markLength = pathdata.len - markLength;
            }

            markPoint =  Raphael.getPointAtLength(kMarkPaths[i].d,markLength);
            beforepoint = Raphael.getPointAtLength(kMarkPaths[i].d,markLength-1);
            afterpoint =  Raphael.getPointAtLength(kMarkPaths[i].d,markLength+1);
        }


        var defalutC = $("#"+kMarkPaths[i].id).attr("_attrColor")
        $("#"+kMarkPaths[i].id).attr("stroke",defalutC)
        document.getElementById(kMarkPaths[i].id).removeAttribute("_attrColor");

        var idNum = kMarkPaths[i].id.split("_")[1];
        var v = getVector(beforepoint,afterpoint);

        var len = Math.round(markLength);

        if($("#knifeMarksgroup").find("#markfor_"+idNum+"_"+len).length > 0){
            alert("请不要添加重复刀口！");
        }else{
            var LL = 8;
            var mark = document.createElementNS(svgNS, "line");
            svgedit.utilities.assignAttributes(mark, {
                id: "markfor_"+idNum+"_"+len,
                class:kMarkPaths[i].id,
                x1: v.direction.x * LL +markPoint.x,
                y1: v.direction.y * LL +markPoint.y,
                x2: v.Undirection.x * LL +markPoint.x,
                y2: v.Undirection.y * LL +markPoint.y,
                style: "stroke:#f90;fill::#f90;",
                "stroke-width":2 / svgCanvas.getCanvasScale()
            });
            $("#knifeMarksgroup").append(mark)
        }
    }
}

function deleteKnifeMark(mark) {
    console.log("在执行修改刀口函数")
    var markData = {
        pt1:{
            x:$(mark).attr("x1"),
            y:$(mark).attr("y1")
        },
        pt2:{
            x:$(mark).attr("x2"),
            y:$(mark).attr("y2")
        }
    }

    var midPoint = {
        x:(markData.pt2.x - markData.pt1.x) / 2 + markData.pt1.x,
        y:(markData.pt2.y - markData.pt1.y) / 2 + markData.pt1.y
    }

    var nodeL = document.createElementNS(svgNS, "line");

    svgedit.utilities.assignAttributes(nodeL, {
        id: "KML",
        style: "stroke:#fff;fill::#fff;",
        "stroke-width":1 / svgCanvas.getCanvasScale()
    });

    $("#pointLineGroup").append(nodeL)


    var vertor,
        extendPoint1 = {},
        extendPoint2 = {};


    $("#svgroot").on("mousemove",function (evt) {
        var pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
        var distance = distanceTwoPoint(midPoint,pt);
        vertor = getVector(midPoint,pt);

        extendPoint1 = {
            x: vertor.vertor.x * distance + midPoint.x,
            y: vertor.vertor.y * distance + midPoint.y
        };
        extendPoint2 = {
            x: vertor.Unvertor.x * distance + midPoint.x,
            y: vertor.Unvertor.y * distance + midPoint.y
        };

        $("#KML").attr({
            x1:extendPoint1.x,
            y1:extendPoint1.y,
            x2:extendPoint2.x,
            y2:extendPoint2.y
        });

    });
    $("#svgroot").on("mousedown",function(){
        var  p1 = {
            x: vertor.vertor.x * 8 + midPoint.x,
            y: vertor.vertor.y * 8 + midPoint.y
        };
        var p2 = {
            x: vertor.Unvertor.x * 8 + midPoint.x,
            y: vertor.Unvertor.y * 8 + midPoint.y
        };
        $(mark).attr({
            x1:p1.x,
            y1:p1.y,
            x2:p2.x,
            y2:p2.y,
            style:"stroke:#f90;fill::#f90;"
        });

        $("#pointLineGroup").children().remove();
        $("#svgroot").unbind("mousemove mousedown");
        KMarkLineColor();
    })

}



function getPathPointVector(pathStr,distance,parentnode,isAppend){

    if(typeof(pathStr) == 'object'){
        pathStr = $(pathStr).attr("d");
    }

    var EquidistantPoint = [];
    var len = Raphael.getTotalLength(pathStr);
    paper.install(window);
    paper.setup();
    var myPath = new Path();
    var precision = 0;
    var counts = Math.floor(len /8);

    for(var i = 0,afterpoint,point,beforepoint;i <= counts; i++){
        if(i == 0){
            beforepoint = Raphael.getPointAtLength(pathStr,precision);
            afterpoint = Raphael.getPointAtLength(pathStr,precision + 2);
            point = Raphael.getPointAtLength(pathStr,precision)
        }
        else if(i  == counts ) {
            afterpoint = Raphael.getPointAtLength(pathStr,len);
            beforepoint = Raphael.getPointAtLength(pathStr,len - 2);
            point = Raphael.getPointAtLength(pathStr,len);
        }else{
            beforepoint = Raphael.getPointAtLength(pathStr,precision - 1);
            afterpoint = Raphael.getPointAtLength(pathStr,precision + 1);
            point = Raphael.getPointAtLength(pathStr,precision)
        }
        var pointx=getVector(beforepoint,afterpoint).direction.x * distance + point.x;
        var pointy = getVector(beforepoint,afterpoint).direction.y * distance + point.y;

        EquidistantPoint.push({ x:pointx, y: pointy});
        var dis = Math.floor(closestPoint(pathStr,{ x:pointx, y: pointy}).distance);
        if(Math.abs(dis - Math.abs(distance))<2){
            myPath.add(new Point(pointx, pointy));
        }
        precision+=8;
    }
    myPath.simplify()
    var cpath1 = paper.project.exportSVG(myPath);
    EquidistantPoint.pathd =$(cpath1).find("path").attr("d");
    if(isAppend){
        $(cpath1).find("path").attr({stroke:"#fff",fill:"none",id:svgCanvas.getNextId()});
        addPathMark($(cpath1).find("path")[0]);
        $(parentnode).append($(cpath1).find("path"));
    }
    return EquidistantPoint;
}


//根据传入的两个距离绘制渐变平行线AttrSet_confirm
function getParallelPath22(pathStr,dis1,dis2){
    if(typeof(pathStr) == 'object'){
        pathStr = $(pathStr).attr("d");
    }
    if(typeof(dis1) == "string" || typeof(dis2) == "string"){
        dis1=parseInt(dis1);
        dis2=parseInt(dis2);
    }

    if(!dis2){
        dis2 = dis1;
    }

    paper.setup();
    var myPath = new Path();

    var pathd,
        len = Raphael.getTotalLength(pathStr),
        EquidistantPoint = [],
        precision = 0,
        distance = dis1,
        counts = Math.floor(len /8),
        disparity = (dis2 - dis1) / (counts-1);

    if(isLine(pathStr)){
        var firstPoint  = Raphael.getPointAtLength(pathStr,0);
        var endPoint = Raphael.getPointAtLength(pathStr,len);
        var point = Raphael.getPointAtLength(pathStr,0);
        var v = getVector(firstPoint,endPoint);
        var pointx1 = v.direction.x * dis1 + firstPoint.x;
        var pointy1 = v.direction.y * dis1 + firstPoint.y;
        var pointx2 = v.direction.x * dis2 + endPoint.x;
        var pointy2 = v.direction.y * dis2 + endPoint.y;

        EquidistantPoint.push({ x:pointx1, y: pointy1});
        EquidistantPoint.push({ x:pointx2, y: pointy2});

        myPath.add(new Point(pointx1, pointy1));
        myPath.add(new Point(pointx2, pointy2));

        myPath.simplify()
        var cpath1 = paper.project.exportSVG(myPath);
        pathd =$(cpath1).find("path").attr("d");
    }else{
        for(var i = 0,afterpoint,point,beforepoint;i <= counts; i++){
            if(i == 0){
                beforepoint = Raphael.getPointAtLength(pathStr,0);
                afterpoint = Raphael.getPointAtLength(pathStr,2);
                point = Raphael.getPointAtLength(pathStr,0)
            }
            else if(i  == counts ) {
                afterpoint = Raphael.getPointAtLength(pathStr,len);
                beforepoint = Raphael.getPointAtLength(pathStr,len - 2);
                point = Raphael.getPointAtLength(pathStr,len);
            }else{
                beforepoint = Raphael.getPointAtLength(pathStr,precision - 1);
                afterpoint = Raphael.getPointAtLength(pathStr,precision + 1);
                point = Raphael.getPointAtLength(pathStr,precision)
            }
            var pointx=getVector(beforepoint,afterpoint).direction.x * distance + point.x;
            var pointy = getVector(beforepoint,afterpoint).direction.y * distance + point.y;
            EquidistantPoint.push({ x:pointx, y: pointy});
            distance = distance+disparity;
            precision+=8;
            myPath.add(new Point(pointx, pointy));
        }
        myPath.simplify()
        var cpath1 = paper.project.exportSVG(myPath);
        pathd =$(cpath1).find("path").attr("d");

    }
    return pathd;
}

//传入需要放码的路径和水平方向（dis1）h和垂直方向（dis2）的放码量
function getPutSizePath(elem,dis1,dis2){

    if(typeof(dis1) == "string" || typeof(dis2) == "string"){
        dis1=parseInt(dis1);
        dis2=parseInt(dis2);
    }

    var horizontal_dis = 0;
    var vertical_dis = 0;


    var attr1 = $(elem).attr("attr_putStart");
    var attr2 = $(elem).attr("attr_putEnd");



    if(attr1 == '0'){
        horizontal_dis = dis1;
        vertical_dis = dis2;
    }

    // console.log("还有放码量都是多少===放马线条===",attr1,attr2);

    paper.setup();
    var myPath = new Path();

    var pathd,
        len = elem.getTotalLength(),
        precision = 0,
        counts = Math.floor(len /8),
        disparity_x = dis1 / (counts),
        disparity_y = dis2 / (counts),
        pathStr = $(elem).attr("d");


    if(isLine(elem)){

        var firstPoint  = Raphael.getPointAtLength(pathStr,0);
        var endPoint = Raphael.getPointAtLength(pathStr,len);
        // console.log(elem.id,"===== 判断为直线")

        var pointStart = {},pointEnd = {};
        if(attr1 == '0'){
            pointStart = {
                x:firstPoint.x + dis1,
                y:firstPoint.y + dis2,
            }
            pointEnd = endPoint;
        }
        if(attr2 == '0'){
            pointStart = firstPoint;
            pointEnd = {
                x:endPoint.x + dis1,
                y:endPoint.y + dis2,
            }
        }

        myPath.add(new Point(pointStart.x, pointStart.y));
        myPath.add(new Point(pointEnd.x, pointEnd.y));

    }else{
        for(var i = 0,point;i <= counts; i++){
                if(i == 0){
                    point = Raphael.getPointAtLength(pathStr,0)
                }
                else if(i  == counts ) {
                    point = Raphael.getPointAtLength(pathStr,len);
                }else{
                    point = Raphael.getPointAtLength(pathStr,precision)
                }

                var pp = {
                    x:point.x + horizontal_dis,
                    y:point.y + vertical_dis
                }

                if(attr1 == '0'){

                    horizontal_dis = disparity_x*(counts - i);

                    vertical_dis = disparity_y*(counts - i);

                    // console.log("就想看看一样不=============",elem.id,horizontal_dis,vertical_dis)
                }
                if(attr2 == '0'){

                    horizontal_dis = horizontal_dis+disparity_x;

                    vertical_dis = vertical_dis+disparity_y;

                }


                precision+=8;
                myPath.add(new Point(pp.x, pp.y));
            }
    }

    myPath.simplify()
    var cpath1 = paper.project.exportSVG(myPath);
    pathd =$(cpath1).find("path").attr("d");

    var test = Raphael.path2curve(pathd).toString();

    // console.log("测试一下这样的到的什么值====原来的paths,以及计算过的",pathd,test)

    return test;
}


function getRatioPointRuler(ruler,pathArr){

    if(!pathArr || pathArr.length != 2){
        return;
    }

   /* var rx1 = parseFloat(pathArr[0].getAttribute("attr_putX")) || 0,
        ry1 = parseFloat(pathArr[0].getAttribute("attr_putY")) || 0,
        rx2 = parseFloat(pathArr[1].getAttribute("attr_putX")) || 0,
        ry2 = parseFloat(pathArr[1].getAttribute("attr_putY")) || 0;


    ruler = {
        ruler1:{
            path:pathArr[0],
            rulerX:rx1,
            rulerY:ry1
        },
        ruler2:{
            path:pathArr[1],
            rulerX:rx2,
            rulerY:ry2
        }
    }*/
    pathArr[0].removeAttribute("attr_putX");
    pathArr[0].removeAttribute("attr_putY");
    pathArr[1].removeAttribute("attr_putX");
    pathArr[1].removeAttribute("attr_putY");



    // console.log("对比一下数据是不是对的：==",pathArr,rx1,ry1,rx2,ry2);
    console.log("这个是ruler",ruler);

    if(ruler.ruler1.rulerX == ruler.ruler2.rulerX && ruler.ruler1.rulerY == ruler.ruler2.rulerY){

        var R = {
            rulerX:ruler.ruler1.rulerX,
            rulerY:ruler.ruler1.rulerY
        }

        return R;

    }

    var length1 = pathArr[0].getTotalLength(),
        length2 = pathArr[1].getTotalLength();

    var pathLength =  length1 + length2;

    var attrPath1 = $(pathArr[0]).attr("attr_putStart"),
        attrPath2 = $(pathArr[0]).attr("attr_putEnd");

    var counts = Math.floor(pathLength /8),
        count2 = Math.round(length1 /8),
        count3 = Math.round(length2 /8),
        disparity_x = ruler.ruler1.rulerX / (counts),
        disparity_y = ruler.ruler1.rulerY / (counts),
        horizontal_dis = 0,
        vertical_dis = 0;


    console.log(disparity_x,disparity_y,count2)
    console.log("这个是两条路径的总长度以及放码规则",pathLength,attrPath1,attrPath2);

    for(var i = 0;i <= count2; i++){

        if(attrPath1 == '0'){

            horizontal_dis = disparity_x*(count2 - i);

            vertical_dis = disparity_y*(count2 - i);

        }
        if(attrPath2 == '0'){

            horizontal_dis = horizontal_dis+disparity_x;

            vertical_dis = vertical_dis+disparity_y;

        }

    }

    console.log("水平和垂直的放码量",horizontal_dis,vertical_dis);


    var horizontal_dis2 = 0,
        vertical_dis2 = 0,
        disparity_x2 = ruler.ruler2.rulerX / (counts),
        disparity_y2 = ruler.ruler2.rulerY / (counts);

    var attr1 = $(pathArr[1]).attr("attr_putStart");
    var attr2 = $(pathArr[1]).attr("attr_putEnd");

    console.log(disparity_x2,disparity_y2,count3)
    console.log("这个是两条路径的总长度以及放码规则",attr1,attr2);

    for(var i = 0;i <= count3; i++){

        if(attr1 == '0'){

            horizontal_dis2 = disparity_x2*(count3 - i);

            vertical_dis2 = disparity_y2*(count3 - i);

        }
        if(attr2 == '0'){

            horizontal_dis2 = horizontal_dis2+disparity_x2;

            vertical_dis2 = vertical_dis2+disparity_y2;

        }

    }

    console.log("水平和垂直的放码量",horizontal_dis2,vertical_dis2);


    var RX = Math.floor(horizontal_dis + horizontal_dis2);
    var RY = Math.floor(vertical_dis + vertical_dis2);
    // vertical_dis = Math.floor(vertical_dis);
    // vertical_dis2 = Math.floor(vertical_dis2);

    var R = {
        rulerX:RX,
        rulerY:RY
    }
    return R;

}

// addHtmltoPopup({
//     title:"角度测量",
//     th:{key:"测量值",value:"角度（deg）"}
//     content:[
//         {key:"角度1",value:"假设是90°"},
//         {key:"角度2",value:"假设是60°"},
//         {key:"角度3",value:"假设是60°"}
//     ]
// })
//将需要展示的数据添加到弹出框里。
function addHtmltoPopup(JsonData){
    var len,Surplus,data = JsonData;
    var eleLeft = $("#Fun_main .popCont .Pop_left");
    var eleright = $("#Fun_main .popCont .Pop_right");
    $("#Fun_main > div > div").html("");

    $("#Funhead_detail").html(data.title);
    $("#Pop_th .Pop_left").html(data.th.key);
    $("#Pop_th .Pop_right").html(data.th.value);
    data.content.length < 4 ? len = data.content.length:len = 4;
    for(var i = 0;i<len;i++){
        $(eleLeft[i]).html(data.content[i].key);
        $(eleright[i]).html(data.content[i].value);
    }
    return;
}
//节流函数
function throttle ( func , wait ){
    var timer = null;
    return function() {
        var context = this,
            args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function() {
            func.apply(context, args);
        }, wait)
    };
}
// addhtmltoExplicate({
//     title:"量规",
//     step:"1.请选择起点"
// })
function addhtmltoExplicate(JsonData){
    $("#Fun_name").html(JsonData.title + "：");
    $("#steps").html(JsonData.step);
}

//获取方向向量以及垂直向量，要求传入的两个点是json
function getVector(point1,point2){
    var Vector = {};

    var VectorX = point2.x - point1.x;
    var VectorY = point2.y - point1.y;
    var denominator =Math.sqrt((VectorX*VectorX)+(VectorY*VectorY));
    Vector.vertor = {x:VectorX/denominator , y: VectorY/denominator};
    Vector.Unvertor = {x:- Vector.vertor.x , y: - Vector.vertor.y};
    Vector.direction = {x: Vector.vertor.y, y: -Vector.vertor.x};
    Vector.Undirection = {x: -Vector.direction.x, y: -Vector.direction.y};
    return Vector;
}

function drawWovenPath_old(pathd,markattr,parentNode){

    if($("#WovenDesigngroup").find("defs").length<1){
        var nodeM = document.createElementNS(svgNS,"defs");
        $("#WovenDesigngroup").append(nodeM);
    }

    var sptId = $("#"+parentNode).attr("id").split("_");
    var idn;
    if(sptId[2])
    {
        idn = sptId[1] + "_" + sptId[2];
    }else{
        idn = sptId[1];
    }

    var Woven_path = document.createElementNS(svgNS, "path");
    svgedit.utilities.assignAttributes(Woven_path, {
        id: "WovenDesign_"+idn,
        d: pathd,
        stroke:"#f01",
        fill:"none",
        "stroke-width":1 / svgCanvas.getCanvasScale(),
        style:"marker-end:url(#Arrow_"+idn+")"
    });
    $("#WovenDesigngroup").append(Woven_path);
    // WovenDesign
    var WovenMark = document.createElementNS(svgNS, "marker");
    svgedit.utilities.assignAttributes(WovenMark, {
        "id": "Arrow_"+idn,
        "markerWidth":markattr.markerWidth,
        "markerHeight":markattr.markerHeight,
        "refX":markattr.refX,
        "refY":markattr.refY,
    });
    $("#WovenDesigngroup").find("defs").append(WovenMark);

    var MarkPath = document.createElementNS(svgNS, "path");
    MarkPath.setAttribute("d",markattr.d);
    MarkPath.setAttribute("style","stroke:red;fill:none;");
    $("#Arrow_"+idn).append(MarkPath);
}

function drawWovenPath(pathArr,parentNode){

    var idn,sptId = $("#"+parentNode).attr("id").split("_");
    if(sptId[2])
    {
        idn = sptId[1] + "_" + sptId[2];
    }else{
        idn = sptId[1];
    }

    var cp = getCenterPoint(pathArr).cp;

    var verter = {
        lev:{x:1, y:0},
        ver:{x:0, y:-1}
    }

    var dis = 500;

    var vertical = {
        top:{
            x:verter.ver.x * dis + cp.x,
            y:verter.ver.y * dis + cp.y
        },
        bottom:{
            x:verter.ver.x * dis + cp.x,
            y:verter.ver.y * (-dis) + cp.y
        }
    };

    var level = {
        left:{
            x:verter.lev.x * (-dis) + cp.x,
            y:verter.lev.y * dis + cp.y
        },
        right:{
            x:verter.lev.x * dis + cp.x,
            y:verter.lev.y * dis + cp.y
        }
    }

    // console.log("竖直和水平方向生成的点======",vertical,level)

    var pathd_ver ="M "+vertical.bottom.x+" "+vertical.bottom.y+" L "+ vertical.top.x+" "+vertical.top.y;
    var pathd_lev ="M "+level.left.x+" "+level.left.y+" L "+level.right.x+" "+level.right.y;

    var int_ver = Raphael.pathIntersection(pathd_ver,$("#ClosedPath_" + idn).attr("d"));
    var int_lev = Raphael.pathIntersection(pathd_lev,$("#ClosedPath_" + idn).attr("d"));

    int_ver = delRepeatRts(int_ver);
    int_lev = delRepeatRts(int_lev);

    console.log("分别是水平和数值的交点===",int_lev,int_ver);

    if(int_ver.length <2 || int_lev.length < 2) {

        alert("绘制布纹线失败");
        console.log("绘制布纹线失败,没有交点!",int_ver,int_lev);

        return;

    }

   /* addPointCircle(int_ver[0],"#pointLineGroup","#f09");
    addPointCircle(int_ver[1],"#pointLineGroup","#f09");
    addPointCircle(int_lev[0],"#pointLineGroup","#f60");
    addPointCircle(int_lev[1],"#pointLineGroup","#f60");*/
    var maxx =Math.max(int_lev[0].x,int_lev[1].x);
    var minx =Math.min(int_lev[0].x,int_lev[1].x);


    var newCp_x = (maxx - minx)/2 + minx;

    console.log("这个是得到的大的和小的x还有计算结果",maxx,minx,newCp_x)


    var miny = Math.min(int_ver[0].y,int_ver[1].y);
    var maxy = Math.max(int_ver[0].y,int_ver[1].y);

    var dis = compareLength(int_ver[0],int_ver[1])*0.12;

    var topPoint = {
        x:newCp_x,
        y:miny + dis
    }
    var btmPoint = {
        x:newCp_x,
        y:maxy - dis
    }

    /*addPointCircle(btmPoint,"#pointLineGroup","#690");
    addPointCircle(topPoint,"#pointLineGroup","#30f");*/

    var WovenPathd = "M "+btmPoint.x+" "+btmPoint.y+" L "+topPoint.x+" "+topPoint.y;

    if($("#WovenDesigngroup").find("defs").length<1){
        var nodeM = document.createElementNS(svgNS,"defs");
        $("#WovenDesigngroup").append(nodeM);
    }

    var markattr = {
        d:"M 0 4 4 0 8 4",
        markerWidth:8,
        markerHeight:4,
        refX:4,
        refY:0
    }

    var Woven_path = document.createElementNS(svgNS, "path");
    svgedit.utilities.assignAttributes(Woven_path, {
        id: "WovenDesign_"+idn,
        d: WovenPathd,
        stroke:"#f01",
        fill:"none",
        "stroke-width":1 / svgCanvas.getCanvasScale(),
        style:"marker-end:url(#Arrow_"+idn+")"
    });
    $("#WovenDesigngroup").append(Woven_path);


    // WovenDesign
    var WovenMark = document.createElementNS(svgNS, "marker");
    svgedit.utilities.assignAttributes(WovenMark, {
        "id": "Arrow_"+idn,
        "markerWidth":markattr.markerWidth,
        "markerHeight":markattr.markerHeight,
        "refX":markattr.refX,
        "refY":markattr.refY,
    });
    $("#WovenDesigngroup").find("defs").append(WovenMark);


    var MarkPath = document.createElementNS(svgNS, "path");
    MarkPath.setAttribute("d",markattr.d);
    MarkPath.setAttribute("style","stroke:red;fill:none;");
    $("#Arrow_"+idn).append(MarkPath);

    return;
}

//判断是不是直线
function isLine(pathStr){
    if(typeof(pathStr)== 'object'){
        pathStr = $(pathStr).attr("d");
    }

    var pathdata = getPointData(pathStr);

    var pp = Raphael.getPointAtLength(pathStr,pathdata.len/4);

    var v1 = getVector(pathdata.start,pathdata.center).vertor;
    var v2 = getVector(pathdata.center,pathdata.end).vertor;
    var v3 = getVector(pathdata.start,pathdata.end).vertor;
    var v4 = getVector(pathdata.start,pp).vertor;

    var angle1 = v1.x * v2.x + v1.y*v2.y;
    var angle2 = v1.x * v2.x + v3.y*v3.y;
    var angle3 = v2.x * v3.x + v2.y*v3.y;
    var angle4 = v2.x * v4.x + v2.y*v4.y;

    // console.log("判断直线的向量角度：====",angle1,angle2,angle3)

    if(angle1 > 0.9999 && angle2 > 0.9999 && angle3 > 0.9999 && angle4 > 0.9999){
        // console.log("判断直线的向量角度：这是一条直线====",angle1,angle2,angle3,angle4)
        return true;
    }else{
        return false;
    }
}

//获取缝边
function getHem(pathArr,parentNode){

    var parendNum = $(parentNode).attr("id").split("_")[1];

    var num2 = $(parentNode).attr("id").split("_")[2];


    // console.log(num2);

    if(num2){
        // console.log("看来是放码的对象啊===================");
        parendNum = parendNum +"_"+num2;
        // console.log("这个材质是正确的父元素的尾号哈==",parendNum)
    }

    var WovenPathd = $("#WovenDesign_"+parendNum).attr("d");

    // console.log("有没有找到啊======================",$("#WovenDesign_"+parendNum))

    if($("#HemGroup_"+parendNum).length >0 && num2){
        return;
    }

    if($("#HemGroup_"+parendNum).length <1){
        var NodeHem = document.createElementNS(svgNS, "g");
        NodeHem.setAttribute("id","HemGroup_"+parendNum);
        NodeHem.setAttribute("class","HemGroup");
        if(num2){
            $("#putSize_HemGroup").append(NodeHem);
        }else{
            $("#HemGroupList").append(NodeHem);
        }
    }

    var points = [];
    var distance = $("#HemWidth").val();

    for(var i=0;i<pathArr.length;i++){
        var pathd = pathArr[i];

        if(typeof(pathArr[i]) == 'object'){
            pathd = $(pathArr[i]).attr("d");
        }


        var pathlen = Raphael.getTotalLength(pathd);

        var beforePoint = Raphael.getPointAtLength(pathd,pathlen/2);
        var afterPoint = Raphael.getPointAtLength(pathd,pathlen/2+4);

        var vertor = getVector(beforePoint,afterPoint)
        var centerPoint = Raphael.getPointAtLength(WovenPathd,Raphael.getTotalLength(WovenPathd)/2);

        var angle = getOuterNormal(vertor.direction,afterPoint,centerPoint);

        if(isLine(pathd)){
            var point1,point2;
            var firstPoint = Raphael.getPointAtLength(pathd,0);
            var lastPoint = Raphael.getPointAtLength(pathd,pathlen);
            var v = getVector(firstPoint,lastPoint);
            if(angle<90) {
                point1 = {x:v.Undirection.x * distance + firstPoint.x , y:v.Undirection.y * distance + firstPoint.y};
                point2 = {x:v.Undirection.x * distance + lastPoint.x , y:v.Undirection.y * distance + lastPoint.y};
            }else{
                point1 = {x:v.direction.x * distance + firstPoint.x , y:v.direction.y * distance + firstPoint.y};
                point2 = {x:v.direction.x * distance + lastPoint.x , y:v.direction.y * distance + lastPoint.y};
            }
            points.push([point1,point2]);
        }else{
            if(angle<90){
                points.push(getPathPointVector(pathArr[i],-distance,$(parentNode),false));
            }else{
                points.push(getPathPointVector(pathArr[i],distance,$(parentNode),false));
            }
        }

    }

    var pathStrs = [];
    for(var i = 0;i<points.length;i++){
        paper.setup();
        var myPath = new Path();

        for(var j = 0;j<points[i].length;j++){
            myPath.add(new Point(points[i][j].x, points[i][j].y));
        }
        myPath.simplify();
        var cpath1 = paper.project.exportSVG(myPath);
        pathStrs.push($(cpath1).find("path").attr("d"));
        $(cpath1).find("path").attr({stroke:"#f93",fill:"none",class:"Hem_"+parendNum});
    }

    var pathMsg = [];
    var yanchangLen = 100;
    for(var i=0;i<pathStrs.length;i++){
        var newStr1;
        var thisd = pathStrs[i];
        var thisLen = Raphael.getTotalLength(thisd);
        var pointStart = Raphael.getPointAtLength(thisd,0);
        var pointEnd = Raphael.getPointAtLength(thisd,thisLen);
        var startV = getVector(Raphael.getPointAtLength(thisd,4),pointStart);
        var endV = getVector(Raphael.getPointAtLength(thisd,thisLen-4),pointEnd);

        var prevPath,NextPath;

        if(i == 0){
            prevPath = pathStrs[pathStrs.length-1];
            NextPath = pathStrs[i+1];
        }else if(i == pathStrs.length-1){
            prevPath = pathStrs[i-1];
            NextPath = pathStrs[0];
        }else{
            prevPath =pathStrs[i-1];
            NextPath =pathStrs[i+1];
        }


        var nowPathLen1 = Raphael.getTotalLength(pathStrs[i]);
        var prevPathLen2 = Raphael.getTotalLength(prevPath);
        var NextPathLen3 = Raphael.getTotalLength(NextPath);

        var nowPath = {
            fp1:Raphael.getPointAtLength(pathStrs[i],0),
            fp2:Raphael.getPointAtLength(pathStrs[i],4),
            Ep1:Raphael.getPointAtLength(pathStrs[i],nowPathLen1),
            Ep2:Raphael.getPointAtLength(pathStrs[i],nowPathLen1-4),
        }
        var prevPath1 = {
            fp1:Raphael.getPointAtLength(prevPath,0),
            fp2:Raphael.getPointAtLength(prevPath,4),
            Ep1:Raphael.getPointAtLength(prevPath,prevPathLen2),
            Ep2:Raphael.getPointAtLength(prevPath,prevPathLen2-4),
        }
        var nextPath1 = {
            fp1:Raphael.getPointAtLength(NextPath,0),
            fp2:Raphael.getPointAtLength(NextPath,4),
            Ep1:Raphael.getPointAtLength(NextPath,NextPathLen3),
            Ep2:Raphael.getPointAtLength(NextPath,NextPathLen3-4),
        }

        var nowPathStartV = getVector(nowPath.fp2,nowPath.fp1);
        var nowPathEndV = getVector(nowPath.Ep2,nowPath.Ep1);
        var prevPathStartV = getVector(prevPath1.fp2,prevPath1.fp1);
        var prevPathEndV = getVector(prevPath1.Ep2,prevPath1.Ep1);
        var nextPathStartV = getVector(nextPath1.fp2,nextPath1.fp1);
        var nextPathEndV = getVector(nextPath1.Ep2,nextPath1.Ep1);


        var nowPathPointStart2={x:nowPathStartV.vertor.x*yanchangLen+nowPath.fp1.x,y:nowPathStartV.vertor.y*yanchangLen+nowPath.fp1.y};
        var nowPathPointEnd2 ={x:nowPathEndV.vertor.x*yanchangLen+nowPath.Ep1.x,y:nowPathEndV.vertor.y*yanchangLen+nowPath.Ep1.y};
        var  d1= pathStrs[i].replace(/M/, "L");

        var prevPathPointStart2={x:prevPathStartV.vertor.x*yanchangLen+prevPath1.fp1.x,y:prevPathStartV.vertor.y*yanchangLen+prevPath1.fp1.y};
        var prevPathPointEnd2 ={x:prevPathEndV.vertor.x*yanchangLen+prevPath1.Ep1.x,y:prevPathEndV.vertor.y*yanchangLen+prevPath1.Ep1.y};
        var  d2= prevPath.replace(/M/, "L");


        var nextPathPointStart2={x:nextPathStartV.vertor.x*yanchangLen+nextPath1.fp1.x,y:nextPathStartV.vertor.y*yanchangLen+nextPath1.fp1.y};
        var nextPathPointEnd2 ={x:nextPathEndV.vertor.x*yanchangLen+nextPath1.Ep1.x,y:nextPathEndV.vertor.y*yanchangLen+nextPath1.Ep1.y};
        var  d3= NextPath.replace(/M/, "L");

        var pathstr1 = "M "+nowPathPointStart2.x +" "+ nowPathPointStart2.y + d1 + " L "+nowPathPointEnd2.x +" "+ nowPathPointEnd2.y;
        var pathstr2 = "M "+prevPathPointStart2.x +" "+ prevPathPointStart2.y + d2 +" L "+prevPathPointEnd2.x +" "+ prevPathPointEnd2.y;
        var pathstr3 = "M "+nextPathPointStart2.x +" "+ nextPathPointStart2.y + d3  + " L "+nextPathPointEnd2.x +" "+ nextPathPointEnd2.y;

        //以下为测试代码
       /* var pathtest1 = document.createElementNS(svgNS,"path");
         pathtest1.setAttribute("id","this");
         pathtest1.setAttribute("d",pathstr1);
         pathtest1.setAttribute("stroke","green");
         pathtest1.setAttribute("fill","none");
         $(parentNode).find("#HemGroup_"+parendNum).append(pathtest1);

         var pathtest2 = document.createElementNS(svgNS,"path");
         pathtest2.setAttribute("id","prev");
         pathtest2.setAttribute("d",pathstr2);
         pathtest2.setAttribute("stroke","#939");
         pathtest2.setAttribute("fill","none");
         $(parentNode).find("#HemGroup_"+parendNum).append(pathtest2);

         var pathtest3 = document.createElementNS(svgNS,"path");
         pathtest3.setAttribute("id","Next");
         pathtest3.setAttribute("d",pathstr3);
         pathtest3.setAttribute("stroke","#03f");
         pathtest3.setAttribute("fill","none");
         $(parentNode).find("#HemGroup_"+parendNum).append(pathtest3);*/

        var InterPoint =[];

        InterPoint[0] = Raphael.pathIntersection(pathstr1,pathstr2)[0];
        InterPoint[1] = Raphael.pathIntersection(pathstr1,pathstr3)[0];
        // console.log(InterPoint);
        if(pathStrs.length == 2){
            console.log("这是两条路径时的前一条线和后一条线：");
            InterPoint[0] = Raphael.pathIntersection(pathstr1,pathstr2)[0];
            InterPoint[1] = Raphael.pathIntersection(pathstr1,pathstr2)[1];
            // console.log(InterPoint);
        }

       /* console.log("++++++++++++++++++++++ start +++++====================================");
        console.log(isEqual(nowPath.fp1,prevPath1.fp1));
        console.log(isEqual(nowPath.fp1,prevPath1.Ep1));
        console.log(isEqual(nowPath.Ep1,prevPath1.fp1));
        console.log(isEqual(nowPath.Ep1,prevPath1.Ep1));
        console.log(isEqual(nowPath.fp1,nextPath1.fp1));
        console.log(isEqual(nowPath.fp1,nextPath1.Ep1));
        console.log(isEqual(nowPath.Ep1,nextPath1.fp1));
        console.log(isEqual(nowPath.Ep1,nextPath1.Ep1));
        console.log("+++++++++++++++++++++++ end ++++====================================");
*/
        var epsilon = 0.99999;
        var Vprev = getVector(prevPath1.fp1,prevPath1.Ep1).vertor;
        var Vnext = getVector(nextPath1.fp1,nextPath1.Ep1).vertor;
        var Vnow = getVector(nowPath.fp1,nowPath.Ep1).vertor;
        var dotValue1 = Vprev.x * Vnow.x + Vprev.y *Vnow.y;
        var dotValue2 = Vnext.x * Vnow.x + Vnext.y * Vnow.y;


        if((isEqual(nowPath.fp1,prevPath1.fp1) || isEqual(nowPath.fp1,prevPath1.Ep1)) && (dotValue1 > epsilon || dotValue1< -epsilon)){
            console.log("当前线条的起点和前一条线条的起点或者终点相交！");
            var v1 = getVector(nowPath.fp1,nowPath.Ep1).vertor;
            var v2 = getVector(prevPath1.fp1,prevPath1.Ep1).vertor;

            console.log("=======当前线条的起点和前一条线连起来的");
            InterPoint[0] = nowPath.fp1;
        }
        else if(isEqual(nowPath.Ep1,prevPath1.fp1) || isEqual(nowPath.Ep1,prevPath1.Ep1)){
            console.log("当前线条的终点和前一条线条的起点或者终点相交！")
            var v1 = getVector(nowPath.fp1,nowPath.Ep1).vertor;
            var v2 = getVector(prevPath1.fp1,prevPath1.Ep1).vertor;

            var dotValue = v1.x * v2.x + v1.y * v2.y;

            if (dotValue > epsilon || dotValue < -epsilon)
            {
                console.log("=======当前线条的终点和前一条线连起来的");
                InterPoint[0] = nowPath.Ep1;
            }
        }
        else if(isEqual(nowPath.fp1,nextPath1.fp1) || isEqual(nowPath.fp1,nextPath1.Ep1)){
            var v1 = getVector(nowPath.fp1,nowPath.Ep1).vertor;
            var v2 = getVector(nextPath1.fp1,nextPath1.Ep1).vertor;
            var dotValue = v1.x * v2.x + v1.y * v2.y;
            if (dotValue > epsilon || dotValue < -epsilon)
            {
                console.log("=======当前路径的起点和她相邻的下一条路径的相连");
                InterPoint[1] = nowPath.fp1;
            }
        }
        else if(isEqual(nowPath.Ep1,nextPath1.fp1) || isEqual(nowPath.fp1,nextPath1.Ep1)){
            console.log("当前路径的终点和她相邻的下一条路径的相连");
            var v1 = getVector(nowPath.fp1,nowPath.Ep1).vertor;
            var v2 = getVector(nextPath1.fp1,nextPath1.Ep1).vertor;
            var dotValue = v1.x * v2.x + v1.y * v2.y;
            if (dotValue > epsilon || dotValue < -epsilon)
            {
                InterPoint[1] = nowPath.Ep1;
            }
        }


        if( ((isEqual(nowPath.fp1,prevPath1.fp1) || isEqual(nowPath.fp1,prevPath1.Ep1)) || (isEqual(nowPath.Ep1,prevPath1.fp1) || isEqual(nowPath.Ep1,prevPath1.Ep1))) &&
            ((isEqual(nowPath.fp1,nextPath1.fp1) || isEqual(nowPath.fp1,nextPath1.Ep1)) || (isEqual(nowPath.Ep1,nextPath1.fp1) || isEqual(nowPath.Ep1,nextPath1.Ep1))) &&
            ((dotValue1 > epsilon || dotValue1< -epsilon) && (dotValue2 > epsilon || dotValue2< -epsilon))){
            console.log(dotValue1);
            console.log(dotValue2);
            console.log(epsilon);
            console.log(dotValue2 > epsilon || dotValue2< -epsilon);
            console.log("哇塞 我在中间啊+++++++++++++++++++++++");
            newStr1 = pathStrs[i];
        }else{
            var nowLen1,nowLen2,nowL1,nowL2;
            if(InterPoint[0] && InterPoint[1]){
                nowL1 = distanceTwoPoint(nowPath.fp1,InterPoint[0]);
                nowL2 = distanceTwoPoint(nowPath.fp1,InterPoint[1]);

                nowLen1 = closestPoint(pathstr1,InterPoint[0]).length;
                nowLen2 = closestPoint(pathstr1,InterPoint[1]).length;

                if(nowL1<nowL2){
                    newStr1 = Raphael.getSubpath(pathstr1,nowLen1,nowLen2);
                }else{
                    newStr1 = Raphael.getSubpath(pathstr1,nowLen2,nowLen1);
                }
            }else{
                console.log("绘制缝边失败");
                alert("绘制缝边失败");
            }

        }



        // console.log(InterPoint);

        var HemPath = document.createElementNS(svgNS,"path");
        svgedit.utilities.assignAttributes(HemPath, {
            id: "Hem_"+parendNum+"_"+i,
            d: newStr1,
            stroke:"#f50",
            fill:"none",
            "attr_Hem1":distance,
            "attr_Hem2":distance,
            "stroke-width":1 / svgCanvas.getCanvasScale(),
            style:"pointer-events:none"
        });
        // HemPath.setAttribute("id","Hem_"+parendNum+"_"+i);
        // HemPath.setAttribute("d",newStr1);
        // HemPath.setAttribute("stroke","#f50");
        // HemPath.setAttribute("fill","none");
        // HemPath.setAttribute("attr_Hem1",distance);
        // HemPath.setAttribute("attr_Hem2",distance);
        // HemPath.setAttribute("style","pointer-events:none");

        $("#HemGroup_"+parendNum).append(HemPath);
        addPathMark(HemPath);
        $("#cutPath_"+parendNum+"_"+i).attr({"attr_Hem1":distance,"attr_Hem2":distance})
    }


}


/*
* 此方法为 绘制直线的平行线
* 通过dis的正负来控制平行线的方向，
*此方法不计算平行线的方向，全部按照正方向绘制
* */
function getStraightParallel(pathStr,dis){
    if(typeof(pathStr) == 'object'){
        pathStr = $(pathStr).attr("d");
    }
    
    var pathData = getPointData(pathStr)
    var v = getVector(pathData.start,pathData.end);
    
    var p1 = {x:v.direction.x * dis + pathData.start.x , y:v.direction.y * distance + pathData.start.y};
    var p2 = {x:v.direction.x * dis + pathData.end.x , y:v.direction.y * distance + pathData.end.y};
      
   return "M " + p1.x +","+p1.y + " C"+ p2.x + ","+ p2.y +" "+ p2.x + "," +p2.y +" "+ p2.x +","+p2.y;
}


//传入两个点，判断这两个点是否相等，容错为4；
function isEqual(p1,p2){
    var len  = distanceTwoPoint(p1,p2);
    if(len<4){
        // console.log(len);
        return true;
    }else{
        return false;
    }
}

function distanceTwoPoint(point1,point2){
    var calx,caly;
    calx = point2.x - point1.x;
    caly = point2.y - point1.y;
    return Math.sqrt(calx*calx + caly*caly);
}

function getRelativePath(pathArr)
{

    if(pathArr && !isArray(pathArr))
    {
        var path = pathArr;
        pathArr = new Array();
        pathArr.push(path);
    }

    var relPathd = new Array();

    for(var i=0; i<pathArr.length; i++)
    {
        var pathd = pathArr[i].getAttribute('d');
        var converD = Raphael.pathToRelative(pathd).toString();
        relPathd.push(converD);
        console.log("原来的===="+i,pathd)
        console.log("更新的===="+i,converD)
    }

    console.log(relPathd);

    return relPathd;
}

//判断是不是数组
function isArray(arr)
{
    if(arr.length)
    {
        return true;
    }else{
        return false;
    }
}
//修改缝边宽度
function changeHemWidth(pathArr)
{
    // var changepath
    if(!pathArr)
    {
        pathArr = $("#svgcontent path[attr_changeHem]");
    }
    // console.log("对比一下格式==isArray==",pathArr,isArray(pathArr));

    if(!isArray(pathArr))
    {
        var path = pathArr;
        pathArr = new Array();
        pathArr.push(path);
    }

    // console.log("对比一下格式=2222222=isArray==",pathArr,isArray(pathArr));
    if(pathArr.length < 1)
    {
        return;
    }


    var dis1 = $("#HemWidth1").val();
    var dis2 = $("#HemWidth2").val();
    RefreshHem(pathArr,dis1,dis2);

    return;
/*
    if (pathArr.length > 0)
    {
        var parentNode = $(pathArr[0]).parent();
        var parendNum = $(parentNode).attr("id").split("_")[1];
        var WovenPathd = $("#WovenDesign_" + parendNum).attr("d");

        var dis1 = $("#HemWidth1").val();
        var dis2 = $("#HemWidth2").val();

        if (dis2 == 0) {
            dis2 = dis1;
        }


        //第一步 拿到当前 需要修改缝边的路径的平行线
        var pathStrs = [];
        for (var i = 0; i < pathArr.length; i++) {
            var pt = {x: pathArr[i].getAttribute("attr_ptx"), y: pathArr[i].getAttribute("attr_pty")}

            pathArr[i].setAttribute("attr_Hem1", dis1);
            pathArr[i].setAttribute("attr_Hem2", dis2);
            var CPathData = getPointData(pathArr[i]);

            //判断鼠标点击的点与路径的哪一端比较近；
            var len1 = distanceTwoPoint(CPathData.start, pt),
                len2 = distanceTwoPoint(CPathData.end, pt);

            if (len1 > len2) {
                var dd = dis1;
                dis1 = dis2;
                dis2 = dd;
            }

            $(pathArr[i]).attr("stroke", "#ff6");
            pathArr[i].removeAttribute("attr_changeHem");

            var thisd = $(pathArr[i]).attr("d");
            var changePathID = $(pathArr[i]).attr("id").split("_");
            var HemId = "Hem_" + changePathID[1] + "_" + changePathID[2];


            var pathlen = Raphael.getTotalLength(thisd);

            var beforePoint = Raphael.getPointAtLength(thisd, pathlen / 2),
                afterPoint = Raphael.getPointAtLength(thisd, pathlen / 2 + 4),
                vertor = getVector(beforePoint, afterPoint),
                centerPoint = Raphael.getPointAtLength(WovenPathd, Raphael.getTotalLength(WovenPathd) / 2),
                angle = getOuterNormal(vertor.direction, afterPoint, centerPoint);

            console.log(angle);

            if (angle < 90) {
                pathStrs.push({
                    d: getParallelPath22(thisd, -dis1, -dis2, false, parentNode),
                    id: $(pathArr[i]).attr("id"),
                    HemId: HemId
                });
            } else {
                pathStrs.push({
                    d: getParallelPath22(thisd, dis1, dis2, false, parentNode),
                    id: $(pathArr[i]).attr("id"),
                    HemId: HemId
                });
            }

        }

        if ($("#HemGroupList").find("#HemSupplementgroup").length < 1) {
            var nodeG = document.createElementNS(svgNS, "g");
            nodeG.setAttribute("id", "HemSupplementgroup")
            $("#HemGroupList").append(nodeG)
        }

        console.log("难倒方法出问题了：===================",pathStrs)
        for (var i = 0; i < pathStrs.length; i++) {

            var HemPaths = getPrevAndNextPath(pathStrs[i].HemId);

            console.log(HemPaths)

            //清除之前可能存在的延长的路径
            $("#HemSupplementgroup").find("." + pathStrs[i].HemId + "_" + "end").remove();
            $("#HemSupplementgroup").find("." + pathStrs[i].HemId + "_" + "start").remove();
            $("#HemSupplementgroup").find("." + HemPaths.prev.id + "_" + "end").remove();
            $("#HemSupplementgroup").find("." + HemPaths.next.id + "_" + "start").remove();

            //延长三条缝边
            var extendNowHem = extendPath(pathStrs[i].d);
            var extendPrevHem = extendPath(HemPaths.prev.d);
            var extendNextHem = extendPath(HemPaths.next.d);

            if (dis1 < 21 || dis2 < 21) {

                /!*   var t1 = document.createElementNS(svgNS, "path");
                    svgedit.utilities.assignAttributes(t1, {
                        class:HemPaths.next.id+"_"+"start",
                        d: extendNowHem,
                        stroke:"#030",
                        fill:"none",
                        "stroke-width":1,
                    });
                    // $("#pointLineGroup").append(t1);

                    var t2 = document.createElementNS(svgNS, "path");
                    svgedit.utilities.assignAttributes(t2, {
                        class:HemPaths.next.id+"_"+"start",
                        d: extendPrevHem,
                        stroke:"#030",
                        fill:"none",
                        "stroke-width":1,
                    });

                    // $("#pointLineGroup").append(t2);
                    var t3 = document.createElementNS(svgNS, "path");
                    svgedit.utilities.assignAttributes(t3, {
                        class:HemPaths.next.id+"_"+"start",
                        d: extendNextHem,
                        stroke:"#030",
                        fill:"none",
                        "stroke-width":1,
                    });
                    // $("#pointLineGroup").append(t3);*!/

                var interNemtoPrevHem = Raphael.pathIntersection(extendNowHem, extendPrevHem)[0];
                var interNemtoNextHem = Raphael.pathIntersection(extendNowHem, extendNextHem)[0];

                $("#pointLineGroup").children().remove();

                var nowHemLen1 = closestPoint(extendNowHem, interNemtoPrevHem).length;
                var nowHemLen2 = closestPoint(extendNowHem, interNemtoNextHem).length;
                var newNowHemPath = Raphael.getSubpath(extendNowHem, nowHemLen1, nowHemLen2);

                $("#" + pathStrs[i].HemId).attr({"d": newNowHemPath, "attr_Hem1": dis1, "attr_Hem2": dis2});


                var prevHemData = getPointData(HemPaths.prev.d);
                var nextHemData = getPointData(HemPaths.next.d);


                var prevHemLen1 = closestPoint(extendPrevHem, prevHemData.start).length;
                var prevHemLen2 = closestPoint(extendPrevHem, interNemtoPrevHem).length;
                var newPrevHemPath = Raphael.getSubpath(extendPrevHem, prevHemLen1, prevHemLen2);

                var nextHemLen1 = closestPoint(extendNextHem, interNemtoNextHem).length;
                var nextHemLen2 = closestPoint(extendNextHem, nextHemData.end).length;
                var newNextHemPath = Raphael.getSubpath(extendNextHem, nextHemLen1, nextHemLen2);


                //以下为重新给缝边定义d属性
                $("#" + HemPaths.prev.id).attr("d", newPrevHemPath);
                $("#" + HemPaths.next.id).attr("d", newNextHemPath);
                return;
            }

            //获取当前路径与前后缝边的交点
            var extendNowCut = extendPath($("#" + pathStrs[i].id).attr("d"));
            var interPrev = Raphael.pathIntersection(extendNowCut, extendPrevHem)[0];
            var interNext = Raphael.pathIntersection(extendNowCut, extendNextHem)[0];

            if (!interPrev) {
                return false;
            }

            $("#pointLineGroup").children().remove();

            //用延长的当前裁片路径截断 前后两条缝边；（如果需要容错可以延长前后两条缝边路径在计算交点）
            var prevInterLength = closestPoint(HemPaths.prev.d, interPrev).length;
            var nextInterLength = closestPoint(HemPaths.next.d, interNext).length;
            var nextHemLength = Raphael.getTotalLength(HemPaths.next.d);

            var prevHemNewd = Raphael.getSubpath(HemPaths.prev.d, 0, prevInterLength);
            var nextHemNewd = Raphael.getSubpath(HemPaths.next.d, nextInterLength, nextHemLength);

            //获取两条对称轴
            var MirrAxis = extendPath($("#" + pathStrs[i].id).attr("d"), true)
            var MirrAxisP = extendPath(MirrAxis.startD);
            var MirrAxisN = extendPath(MirrAxis.endD);

            //获取镜像
            var MirrPathPrev = getMirrorImage(prevHemNewd, MirrAxisP);
            var MirrPathNext = getMirrorImage(nextHemNewd, MirrAxisN);


            /!*获取当前缝边路径 和 两条镜像的交点*!/
            var MirrInterPrev = Raphael.pathIntersection(extendNowHem, MirrPathPrev)[0];
            var MirrInterNext = Raphael.pathIntersection(extendNowHem, MirrPathNext)[0];
            console.log(MirrInterPrev)
            if (!MirrInterPrev || !MirrInterNext) {
                $("#steps").html("!!请检查一下缝边是否不合理！");
                alert("请检查您输入的缝边宽度是否不合理，超出了裁片本身的大小")
                return false;
            }

            //截取交点之间的当前缝边路径
            var interLengthPrev = closestPoint(extendNowHem, MirrInterPrev).length;
            var interLengthNext = closestPoint(extendNowHem, MirrInterNext).length;
            var mirrNowPath = Raphael.getSubpath(extendNowHem, interLengthPrev, interLengthNext);


            //获取补充的路径
            var supplementPathPrevLen1 = closestPoint(MirrPathPrev, interPrev).length;
            var supplementPathPrevLen2 = closestPoint(MirrPathPrev, MirrInterPrev).length;
            if (supplementPathPrevLen1 > supplementPathPrevLen2) {
                var L = supplementPathPrevLen1;
                supplementPathPrevLen1 = supplementPathPrevLen2;
                supplementPathPrevLen2 = L;
            }
            var supplementPathPrev = Raphael.getSubpath(MirrPathPrev, supplementPathPrevLen1, supplementPathPrevLen2);

            var supplementPathNextLen1 = closestPoint(MirrPathNext, interNext).length;
            var supplementPathNextLen2 = closestPoint(MirrPathNext, MirrInterNext).length;
            if (supplementPathNextLen1 > supplementPathNextLen2) {
                var L = supplementPathNextLen1;
                supplementPathNextLen1 = supplementPathNextLen2;
                supplementPathNextLen2 = L;
            }
            var supplementPathNext = Raphael.getSubpath(MirrPathNext, supplementPathNextLen1, supplementPathNextLen2);


            var supplementPathP = document.createElementNS(svgNS, "path");
            svgedit.utilities.assignAttributes(supplementPathP, {
                class: HemPaths.prev.id + "_" + "end" + " " + "HemGroup_" + parendNum,
                d: supplementPathPrev,
                stroke: "#f50",
                fill: "none",
                "stroke-width": 1,
                style: "pointer-events:none"
            });
            $("#HemSupplementgroup").append(supplementPathP);
            addPathMark(supplementPathP);

            var supplementPathN = document.createElementNS(svgNS, "path");
            svgedit.utilities.assignAttributes(supplementPathN, {
                class: HemPaths.next.id + "_" + "start" + " " + "HemGroup_" + parendNum,
                d: supplementPathNext,
                stroke: "#f50",
                fill: "none",
                "stroke-width": 1,
                style: "pointer-events:none"
            });
            $("#HemSupplementgroup").append(supplementPathN);
            addPathMark(supplementPathN);


            //以下为重新给缝边定义d属性
            console.log(dis1, dis2)
            $("#" + HemPaths.prev.id).attr("d", prevHemNewd);
            $("#" + pathStrs[i].HemId).attr({"d": mirrNowPath, "attr_Hem1": dis1, "attr_Hem2": dis2});
            $("#" + HemPaths.next.id).attr("d", nextHemNewd);
        }
    }*/
}

 function RefreshHem(pathArr,dis1,dis2)
{
    if(!isArray(pathArr))
    {
        var path = pathArr;
        pathArr = new Array();
        pathArr.push(path);
    }

    var parentNode = $(pathArr[0]).parent();
    var parendNum = $(parentNode).attr("id").split("_")[1];
    var WovenPathd = $("#WovenDesign_" + parendNum).attr("d");

    // var dis1 = $("#HemWidth1").val();
    // var dis2 = $("#HemWidth2").val();

    if (dis2 == 0) {
        dis2 = dis1;
    }

    //第一步 拿到当前 需要修改缝边的路径的平行线
    var pathStrs = [];
    for (var i = 0; i < pathArr.length; i++) {
        var pt = {x: pathArr[i].getAttribute("attr_ptx"), y: pathArr[i].getAttribute("attr_pty")}

        pathArr[i].setAttribute("attr_Hem1", dis1);
        pathArr[i].setAttribute("attr_Hem2", dis2);
        var CPathData = getPointData(pathArr[i]);

        //判断鼠标点击的点与路径的哪一端比较近；
        var len1 = distanceTwoPoint(CPathData.start, pt),
            len2 = distanceTwoPoint(CPathData.end, pt);

        if (len1 > len2) {
            var dd = dis1;
            dis1 = dis2;
            dis2 = dd;
        }

        $(pathArr[i]).attr("stroke", "#ff6");
        pathArr[i].removeAttribute("attr_changeHem");

        var thisd = $(pathArr[i]).attr("d");
        var changePathID = $(pathArr[i]).attr("id").split("_");
        var HemId = "Hem_" + changePathID[1] + "_" + changePathID[2];


        var pathlen = Raphael.getTotalLength(thisd);

        var beforePoint = Raphael.getPointAtLength(thisd, pathlen / 2),
            afterPoint = Raphael.getPointAtLength(thisd, pathlen / 2 + 4),
            vertor = getVector(beforePoint, afterPoint),
            centerPoint = Raphael.getPointAtLength(WovenPathd, Raphael.getTotalLength(WovenPathd) / 2),
            angle = getOuterNormal(vertor.direction, afterPoint, centerPoint);

        console.log(angle);

        if (angle < 90) {
            pathStrs.push({
                d: getParallelPath22(thisd, -dis1, -dis2, false, parentNode),
                id: $(pathArr[i]).attr("id"),
                HemId: HemId
            });
        } else {
            pathStrs.push({
                d: getParallelPath22(thisd, dis1, dis2, false, parentNode),
                id: $(pathArr[i]).attr("id"),
                HemId: HemId
            });
        }

    }

    if ($("#HemGroupList").find("#HemSupplementgroup").length < 1) {
        var nodeG = document.createElementNS(svgNS, "g");
        nodeG.setAttribute("id", "HemSupplementgroup")
        $("#HemGroupList").append(nodeG);
    }

    console.log("难倒方法出问题了：===================",pathStrs)
    for (var i = 0; i < pathStrs.length; i++) {

        var HemPaths = getPrevAndNextPath(pathStrs[i].HemId);

        console.log(HemPaths)

        //清除之前可能存在的延长的路径
        $("#HemSupplementgroup").find("." + pathStrs[i].HemId + "_" + "end").remove();
        $("#HemSupplementgroup").find("." + pathStrs[i].HemId + "_" + "start").remove();
        $("#HemSupplementgroup").find("." + HemPaths.prev.id + "_" + "end").remove();
        $("#HemSupplementgroup").find("." + HemPaths.next.id + "_" + "start").remove();

        //延长三条缝边
        var extendNowHem = extendPath(pathStrs[i].d);
        var extendPrevHem = extendPath(HemPaths.prev.d);
        var extendNextHem = extendPath(HemPaths.next.d);

        if (dis1 < 21 || dis2 < 21) {

            /*   var t1 = document.createElementNS(svgNS, "path");
                svgedit.utilities.assignAttributes(t1, {
                    class:HemPaths.next.id+"_"+"start",
                    d: extendNowHem,
                    stroke:"#030",
                    fill:"none",
                    "stroke-width":1,
                });
                // $("#pointLineGroup").append(t1);

                var t2 = document.createElementNS(svgNS, "path");
                svgedit.utilities.assignAttributes(t2, {
                    class:HemPaths.next.id+"_"+"start",
                    d: extendPrevHem,
                    stroke:"#030",
                    fill:"none",
                    "stroke-width":1,
                });

                // $("#pointLineGroup").append(t2);
                var t3 = document.createElementNS(svgNS, "path");
                svgedit.utilities.assignAttributes(t3, {
                    class:HemPaths.next.id+"_"+"start",
                    d: extendNextHem,
                    stroke:"#030",
                    fill:"none",
                    "stroke-width":1,
                });
                // $("#pointLineGroup").append(t3);*/

            var interNemtoPrevHem = Raphael.pathIntersection(extendNowHem, extendPrevHem)[0];
            var interNemtoNextHem = Raphael.pathIntersection(extendNowHem, extendNextHem)[0];

            if(!interNemtoPrevHem || !interNemtoNextHem)
            {
                return;
            }

            var nowHemLen1 = closestPoint(extendNowHem, interNemtoPrevHem).length;
            var nowHemLen2 = closestPoint(extendNowHem, interNemtoNextHem).length;
            var newNowHemPath = Raphael.getSubpath(extendNowHem, nowHemLen1, nowHemLen2);

            $("#" + pathStrs[i].HemId).attr({"d": newNowHemPath, "attr_Hem1": dis1, "attr_Hem2": dis2});


            var prevHemData = getPointData(HemPaths.prev.d);
            var nextHemData = getPointData(HemPaths.next.d);


            var prevHemLen1 = closestPoint(extendPrevHem, prevHemData.start).length;
            var prevHemLen2 = closestPoint(extendPrevHem, interNemtoPrevHem).length;
            var newPrevHemPath = Raphael.getSubpath(extendPrevHem, prevHemLen1, prevHemLen2);

            var nextHemLen1 = closestPoint(extendNextHem, interNemtoNextHem).length;
            var nextHemLen2 = closestPoint(extendNextHem, nextHemData.end).length;
            var newNextHemPath = Raphael.getSubpath(extendNextHem, nextHemLen1, nextHemLen2);


            //以下为重新给缝边定义d属性
            $("#" + HemPaths.prev.id).attr("d", newPrevHemPath);
            $("#" + HemPaths.next.id).attr("d", newNextHemPath);
            return;
        }

        //获取当前路径与前后缝边的交点
        var extendNowCut = extendPath($("#" + pathStrs[i].id).attr("d"));
        var interPrev = Raphael.pathIntersection(extendNowCut, extendPrevHem)[0];
        var interNext = Raphael.pathIntersection(extendNowCut, extendNextHem)[0];

        if (!interPrev) {
            return false;
        }

        $("#pointLineGroup").children().remove();

        //用延长的当前裁片路径截断 前后两条缝边；（如果需要容错可以延长前后两条缝边路径在计算交点）
        var prevInterLength = closestPoint(HemPaths.prev.d, interPrev).length;
        var nextInterLength = closestPoint(HemPaths.next.d, interNext).length;
        var nextHemLength = Raphael.getTotalLength(HemPaths.next.d);

        var prevHemNewd = Raphael.getSubpath(HemPaths.prev.d, 0, prevInterLength);
        var nextHemNewd = Raphael.getSubpath(HemPaths.next.d, nextInterLength, nextHemLength);

        //获取两条对称轴
        var MirrAxis = extendPath($("#" + pathStrs[i].id).attr("d"), true)
        var MirrAxisP = extendPath(MirrAxis.startD);
        var MirrAxisN = extendPath(MirrAxis.endD);

        //获取镜像
        var MirrPathPrev = getMirrorImage(prevHemNewd, MirrAxisP);
        var MirrPathNext = getMirrorImage(nextHemNewd, MirrAxisN);


        /*获取当前缝边路径 和 两条镜像的交点*/
        var MirrInterPrev = Raphael.pathIntersection(extendNowHem, MirrPathPrev)[0];
        var MirrInterNext = Raphael.pathIntersection(extendNowHem, MirrPathNext)[0];
        console.log(MirrInterPrev)
        if (!MirrInterPrev || !MirrInterNext) {
            $("#steps").html("!!请检查一下缝边是否不合理！");
            alert("请检查您输入的缝边宽度是否不合理，超出了裁片本身的大小")
            return false;
        }

        //截取交点之间的当前缝边路径
        var interLengthPrev = closestPoint(extendNowHem, MirrInterPrev).length;
        var interLengthNext = closestPoint(extendNowHem, MirrInterNext).length;
        var mirrNowPath = Raphael.getSubpath(extendNowHem, interLengthPrev, interLengthNext);


        //获取补充的路径
        var supplementPathPrevLen1 = closestPoint(MirrPathPrev, interPrev).length;
        var supplementPathPrevLen2 = closestPoint(MirrPathPrev, MirrInterPrev).length;
        if (supplementPathPrevLen1 > supplementPathPrevLen2) {
            var L = supplementPathPrevLen1;
            supplementPathPrevLen1 = supplementPathPrevLen2;
            supplementPathPrevLen2 = L;
        }
        var supplementPathPrev = Raphael.getSubpath(MirrPathPrev, supplementPathPrevLen1, supplementPathPrevLen2);

        var supplementPathNextLen1 = closestPoint(MirrPathNext, interNext).length;
        var supplementPathNextLen2 = closestPoint(MirrPathNext, MirrInterNext).length;
        if (supplementPathNextLen1 > supplementPathNextLen2) {
            var L = supplementPathNextLen1;
            supplementPathNextLen1 = supplementPathNextLen2;
            supplementPathNextLen2 = L;
        }
        var supplementPathNext = Raphael.getSubpath(MirrPathNext, supplementPathNextLen1, supplementPathNextLen2);


        var supplementPathP = document.createElementNS(svgNS, "path");
        svgedit.utilities.assignAttributes(supplementPathP, {
            class: HemPaths.prev.id + "_" + "end" + " " + "HemGroup_" + parendNum,
            d: supplementPathPrev,
            stroke: "#f50",
            fill: "none",
            "stroke-width": 1,
            style: "pointer-events:none"
        });
        $("#HemSupplementgroup").append(supplementPathP);
        addPathMark(supplementPathP);

        var supplementPathN = document.createElementNS(svgNS, "path");
        svgedit.utilities.assignAttributes(supplementPathN, {
            class: HemPaths.next.id + "_" + "start" + " " + "HemGroup_" + parendNum,
            d: supplementPathNext,
            stroke: "#f50",
            fill: "none",
            "stroke-width": 1,
            style: "pointer-events:none"
        });
        $("#HemSupplementgroup").append(supplementPathN);
        addPathMark(supplementPathN);


        //以下为重新给缝边定义d属性
        console.log(dis1, dis2)
        $("#" + HemPaths.prev.id).attr("d", prevHemNewd);
        $("#" + pathStrs[i].HemId).attr({"d": mirrNowPath, "attr_Hem1": dis1, "attr_Hem2": dis2});
        $("#" + HemPaths.next.id).attr("d", nextHemNewd);
    }
    return;
}

//按顺序查找，根据传入的路径ID 找到 他在路径中的前一条可后一条路径，并返回前后路径的id,d值 只查找path
function getPrevAndNextPath(id){

    if(typeof(id) == 'object'){
        id = $(id).attr("id");
    }

    var parentNode = $("#"+id).parent();

    // console.log(parentNode)

    var firstNode = $(parentNode).find("path:first-child").attr("id");
    var lastNode = $(parentNode).find("path:last-child").attr("id");

    // console.log(firstNode)
    // console.log(lastNode)

    var prevId,nextId;
    if(id == firstNode){
        prevId =  lastNode;
        nextId = $("#"+id).next("path").attr("id");
    }else if(id == lastNode){
        prevId =  $("#"+id).prev("path").attr("id");
        nextId = firstNode;
    }else{
        prevId =  $("#"+id).prev("path").attr("id");
        nextId = $("#"+id).next("path").attr("id");
    }
    var paths = {
        prev:{
            id:prevId,
            d:$("#"+prevId).attr("d")
        },
        next:{
            id:nextId,
            d:$("#"+nextId).attr("d")
        }
    }

    return paths;
}

/*
* 延长当前路径的两端,返回延长的另字符串
* pathStr:需要延长的路径字符串，也可以是path对象
* isBothd: 是否是仅仅需要返回路径两端的延长部分的 路径字符串d值
* entendL: 演唱的长度，默认1000，如果有传输值，咋长度以传进来的值为准
* */
function extendPath(pathStr,isBothd,extendL){
    if(typeof(pathStr) == 'object'){
        pathStr = $(pathStr).attr("d");
    }
    if(!extendL){
        extendL = 1000;
    }
    var pathdata = getPointData(pathStr);
    var start2 = Raphael.getPointAtLength(pathStr,4);
    var end2 = Raphael.getPointAtLength(pathStr,pathdata.len-4);

    var startV = getVector(start2,pathdata.start).vertor;
    var endV = getVector(end2,pathdata.end).vertor;

    var startPoint ={x: startV.x * extendL + pathdata.start.x,y: startV.y * extendL +pathdata.start.y};
    var endPoint ={x: endV.x * extendL + pathdata.end.x,y: endV.y * extendL +pathdata.end.y};

    if(isBothd){
        var startD1 = "M "+startPoint.x +","+ startPoint.y + "C "+pathdata.start.x +","+ pathdata.start.y +","+ pathdata.start.x +","+ pathdata.start.y + "," +pathdata.start.x +","+ pathdata.start.y;;
        var endD1 = "M "+ pathdata.end.x+","+pathdata.end.y +"C "+endPoint.x +","+ endPoint.y +","+ endPoint.x +","+ endPoint.y + "," +endPoint.x +","+ endPoint.y;
        return {startD:startD1,endD:endD1 }
    }else{
        var startD = "M "+startPoint.x +","+ startPoint.y;
        var endD = "C "+endPoint.x +","+ endPoint.y +","+ endPoint.x +","+ endPoint.y + "," +endPoint.x +","+ endPoint.y;
        var newpathd = startD+pathStr.replace(/M/, "L")+endD;

        return newpathd;
    }

    function drawPath(data) {
        var path = document.createElementNS(svgNS, "path");
        svgedit.utilities.assignAttributes(path, {
            id: data.id,
            d: data.d,
            stroke: data.stroke,
            fill: data.fill
        });
        $(data.addGroup).append(path);
        // addPathMark(path);
        return path;
    }

    console.log(newpathd);
}


var cutpart;
var cutInside;
var groupId;
$("#workarea").on("mousedown",function(evt){
    if(evt.button ==2) {
        // if($("#angle_measure").hasClass("tool_button_selected")){
            /*var angle;
            var paths = $("#svgcontent g path[stroke=green]");
            console.log("这是妖测量角度的路径=================");
            console.log(paths);
            if(paths.length>1){
                angle = getIntersectionAngle(paths[0], paths[1]).angle;
            }
            if(!angle){
                alert("您所选的两条路径没有交点，无法计算角度值！");
                for(var i=0;i<paths.length;i++){
                    var AttrColor = $(paths[i]).attr("_attrColor");
                    $(paths[i]).attr("stroke",AttrColor);
                }
            }else{
                var auxiliary_angle = Math.round((180 - angle)*100) / 100;
                var dataTo = {
                    title: "角度测量",
                    th:{ key:"测量值",value:"角度" },
                    content: [
                        {key: "夹角", value: angle},
                        {key: "补角", value: auxiliary_angle}
                    ]
                }
                addHtmltoPopup(dataTo);
                $("#PopupBox").show();
                $("#PopupBox_cont").siblings().hide();
                $("#PopupBox_cont").show();
                for(var i=0;i<paths.length;i++){
                    var AttrColor = $(paths[i]).attr("_attrColor");
                    $(paths[i]).attr("stroke",AttrColor);
                }
            }*/

    }

})

//判断封闭图形的外法线， angle>90则传进来的vertor是外法线，否则不是；
function getOuterNormal(vertor,point,insidePoint){
    var vertorToinside = getVector(point,insidePoint).vertor;
    var angle = VectorAngle(vertorToinside,vertor);
    return angle;
}

//提取裁片
function getCutPartFn(evt){
    if(publicCount%2 == 1)
    {
        var points = [];
        var pathdH,pathdS;
        var svgroot = document.getElementById("svgroot")
        var pt1 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
        cutInside = $("#svgcontent g:first-child path[_attribute=InsidePart]");

        for(var i=0;i<cutInside.length;i++) {
            var b = $("#"+groupId).find("path").length;
            var pathd = $(cutInside[i]).attr("d")
            var cutPath = document.createElementNS(svgNS, "path");
            svgedit.utilities.assignAttributes(cutPath, {
                id: "insidePath_"+groupId.split("_")[1]+"_"+i,
                d: pathd,
                class:"insidePath",
                stroke:"#fff",
                fill:"none",
                _attribute:"InsidePart",
                "stroke-width":1,
            });
            $("#"+groupId).append(cutPath);
            addPathMark(cutPath);
        }

        // var bbpath = $("#ClosedPathGroup").find("#ClosedPath_"+groupId.split("_")[1])[0];
        var cpPaths = $("#"+groupId).find("path[class=cutPath]");

        console.log(cpPaths)

        if(true){
            drawWovenPath(cpPaths,groupId);
            //绘制缝边 start
            getHem(cutpart,$("#"+groupId));

            //绘制缝边 end
            var newPlace;
            $("#steps").html("1移动裁片至指定位置！");
            svgroot.onmousemove = function(evt){
                $("#"+groupId).show();
                var pt2 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse());
                newPlace= {x:pt2.x - pt1.x,y:pt2.y-pt1.y};
                $("#"+groupId).attr({transform:"translate("+newPlace.x+","+newPlace.y+")"});

                $("#WovenDesign_"+groupId.split("_")[1]).attr({transform:"translate("+newPlace.x+","+newPlace.y+")"});
                $("#HemGroup_"+groupId.split("_")[1]).attr({transform:"translate("+newPlace.x+","+newPlace.y+")"});
            }
            $(svgroot).on("mousedown",function(){
                svgroot.onmousemove=null;
                cutpart.splice(0,cutpart.length);
                $("#subline").remove();


                $("#svgcontent g:first-child path[_attribute]").removeAttr("_attribute");

                recoverColor();

                var transPathgroup = [];
                transPathgroup.push($("#" + groupId).find("path[id]"));
                transPathgroup.push($("#HemGroup_"+groupId.split("_")[1]).find("path[id]"));
                for(var j=0;j<transPathgroup.length;j++){
                    var transPath = transPathgroup[j]
                    for (var i = 0; i < transPath.length; i++) {
                        var thisd = $(transPath[i]).attr("d")
                        var newd = Raphael.transformPath(thisd, "t" + newPlace.x + "," + newPlace.y)
                        $(transPath[i]).attr("d", newd);
                    }
                }

                $("#" + groupId).removeAttr("transform");
                $("#HemGroup_"+groupId.split("_")[1]).removeAttr("transform");

                var closePathd = $("#ClosedPath_"+groupId.split("_")[1]).attr("d");
                $("#ClosedPath_"+groupId.split("_")[1]).attr("d",Raphael.transformPath(closePathd, "t" + newPlace.x + "," + newPlace.y))

                var WovenDesignd = $("#WovenDesign_"+groupId.split("_")[1]).attr("d");
                $("#WovenDesign_"+groupId.split("_")[1]).attr("d",Raphael.transformPath(WovenDesignd, "t" + newPlace.x + "," + newPlace.y))
                $("#WovenDesign_"+groupId.split("_")[1]).removeAttr("transform");

                // var Hemd = $("#HemGroup_"+groupId.split("_")[1]).attr("d");

                publicCount=0;
                $(svgroot).unbind("mousedown");
            });
        }else{
            cutpart.splice(0,cutpart.length);
            recoverColor();
            publicCount=0;
            $("#steps").html("提取失败，请重新选择！");
            alert("提取失败，请重新选择，请检查交点");
            console.log("检查路径是否封闭，怎么拿不到焦点呢？")
            return;
        }

    }
    else if(publicCount%2 == 0)
    {
        cutpart = getSelectElemArr();

        if(cutpart.length>0){
            $("#steps").html("1.请选择裁片内部要素，并在空白区域右键结束！");
            publicCount++;
            var paths = [];
            var  cutgroupCount = $("#svgcontent #cutpartsgroupList > g").length;
            groupId = "cutpartsgroup_"+cutgroupCount;

            var group = document.createElementNS(svgNS, "g");
            svgedit.utilities.assignAttributes(group, {
                id: groupId,
                class:"cutpartgroup",
                style:"display:none;"
            });
            $("#cutpartsgroupList").append(group);

            for (var i = 0; i < cutpart.length; i++) {
                paths.push($(cutpart[i]).attr("d"));
            }

            var  newPaths = new Array();

            if(cutpart.length == 1 && $("#ImportGroup").find(cutpart[0]).length > 0){
                getImportCutPart(cutpart[0],cutgroupCount);
            }
            else {
                newPaths = svgedit.utilities.getIsolatedPaths(paths);

                if (!newPaths || newPaths.length < 2) {
                    cutpart.splice(0, cutpart.length);
                    recoverColor();
                    publicCount = 0;
                    alert("提取失败，请重新选择");
                    console.log("提取失败，请重新选择,原因是处理失败或者 裁片的路径少于2");
                    return;
                }

                var bboxPathArr = [];
                for (var i = 0; i < newPaths.length; i++) {
                    if (i == 0) {
                        var length1 = Raphael.getTotalLength(newPaths[i]);
                        var length2 = Raphael.getTotalLength(newPaths[i + 1]);
                        var p1 = Raphael.getPointAtLength(newPaths[i], length1);
                        var p2 = Raphael.getPointAtLength(newPaths[i + 1], 0);
                        var p3 = Raphael.getPointAtLength(newPaths[i + 1], length2);
                        // 判断当前路径的终点是不是和下一条路径的起点或者终点相等，如果不是的话，当前路径取反方向，形成顺时针或者逆时针的统一方向；
                        if (!isEqual(p1, p2) && !isEqual(p1, p3)) {
                            console.log(length1);
                            var np1 = ReversePath(newPaths[i]);
                            newPaths[i] = np1;
                        }
                        bboxPathArr.push(newPaths[i]);
                    }
                    if (i > 0 && (i < newPaths.length)) {
                        var length1 = Raphael.getTotalLength(newPaths[i - 1]);
                        var p1 = Raphael.getPointAtLength(newPaths[i - 1], length1);
                        var p2 = Raphael.getPointAtLength(newPaths[i], 0);
                        if (!isEqual(p1, p2)) {
                            newPaths[i] = ReversePath(newPaths[i]);
                        }
                        bboxPathArr.push(newPaths[i].replace(/M/, "L"));
                    }

                    var cutPath = document.createElementNS(svgNS, "path");
                    svgedit.utilities.assignAttributes(cutPath, {
                        id: "cutPath_" + cutgroupCount + "_" + i,
                        d: newPaths[i],
                        class: "cutPath",
                        stroke: "#ff6",
                        fill: "none",
                        _attribute: "CutPartsPath",
                        "stroke-width": 1,
                    });
                    $("#" + groupId).append(cutPath);
                    addPathMark(cutPath);
                }
                ;

                //以下为测试处理裁片路径

                var testPath = $("#" + groupId).find("path[class=cutPath]");

                disposeCutpath(testPath);

                disposeCutPaths(testPath);
            }
            cutpart = newPaths;

        }else{
            publicCount=0;
            $("#Fun_name").html("裁片提取");
            $("#steps").html("1.请依次选择裁片净边要素，请在空白区域右键结束！");
        }

    }
}

function getImportCutPart(elem,count){
    console.log(count)
    console.log(!count)
    if(count !=0 && !count){
        count = $("#svgcontent #cutpartsgroupList > g").length
    }
    var pathd = elem.getAttribute("d");

    var pathData = getPointData(pathd);

    if(!isEqual(pathData.start,pathData.end)){
        console.log("不是闭合路径");
        publicCount=0;
        $("#cutpartsgroup_"+count).remove();
        recoverColor();
        return;
    }

    var PathString = Raphael.parsePathString(pathd);

    var subPath = Raphael.getSubpath(pathd,0,pathData.len);

    // var subPathString = Raphael.parsePathString(subPath);

    // console.log(PathString,subPathString);

    var pointArr = new Array();

    var paralD = getParallelPath22(pathd,0,0)

  /*  for(var i=0; i<pathData.len; i++)
    {
        var pStr = PathString[i];
        pointArr.push({
            x: pStr[1],
            y: pStr[2]
        });
    }*/

    console.log(paralD)

    elem.setAttribute("d",subPath);


    /*var group = document.createElementNS(svgNS, "g");
    svgedit.utilities.assignAttributes(group, {
        id: "cutpartsgroup_"+count,
        class:"cutpartgroup",
        // style:"display:none;"
    });
    $("#cutpartsgroupList").append(group);*/

    var cutPath = document.createElementNS(svgNS, "path");
    svgedit.utilities.assignAttributes(cutPath, {
        id: "cutPath_" + count + "_" + 0,
        d: pathd + 'z',
        class:"cutPath",
        stroke: "#ff6",
        fill: "none",
        _attribute: "CutPartsPath",
        "stroke-width": 1,
    });
    $("#cutpartsgroup_"+count).append(cutPath);
    // addPathMark(cutPath);

    var cp = getCenterPoint(cutPath);

    console.log(cp)


    var bboxPath = document.createElementNS(svgNS, "path");
    svgedit.utilities.assignAttributes(bboxPath, {
        id: "ClosedPath_" + count,
        d: pathd+"z",
        stroke: "#000",
        fill: "none",
        _attribute: "CutPartsPath",
        "stroke-width": 1
    });

    $("#ClosedPathGroup").append(bboxPath);

    // var newWd = Raphael.transformPath(pathd + 'z', "t" + newPlace.x + "," + newPlace.y).toString();

    var result = new Array();
    result.push(pathd)
    return result;
}

//传入路径数组，返回中心点、控制点、左上角和右下角的两个点；
function getCenterPoint(pathArr)
{
    if(!isArray(pathArr))
    {
        var path = pathArr;
        pathArr = new Array();
        pathArr.push(path);
    }
    var controlPts = [];

    for(var j=0; j<pathArr.length; j++)
    {
        var rts = Raphael.parsePathString(pathArr[j].getAttribute("d"));

        for(var i = 0;i<rts.length;i++){
            var point = rts[i];
            if(point[0]=='L' || point.length < 2){
                continue;
            }
            var pt = {
                x:point[point.length-2],
                y:point[point.length-1]
            }
            controlPts.push(pt);

        }

    }

    console.log(pathArr,controlPts)

    var sortPts = function (rts)
    {

        if(rts.length < 1 || !rts[0].x)
        {
            return;
        }

        var rtx = [],
            rty = [];

        for(var i=0; i<rts.length; i++)
        {
            // addPointCircle(rts[i],"#pointLineGroup");
            rtx.push(rts[i].x);
            rty.push(rts[i].y);
        }

        var pts = {
            max: {
                x: Math.max.apply(null,rtx),
                y: Math.max.apply(null,rty)
            },
            min: {
                x: Math.min.apply(null,rtx),
                y: Math.min.apply(null,rty)
            }
        }

        return pts;

    }

    // console.log("去重前=======",controlPts)

    var Cpts = delRepeatRts(controlPts);

    Cpts = delRepeatRts(Cpts);

    var bbpts = sortPts(Cpts);

    console.log(bbpts);


    var cp = {
        x: (bbpts.max.x - bbpts.min.x) / 2 + bbpts.min.x,
        y: (bbpts.max.y - bbpts.min.y) / 2 + bbpts.min.y
    }


    // console.log(rts);

    var result = {
        cp:cp,
        ctp:Cpts,
        pts:bbpts
    }

    return result;

}

//重新处理闭合曲线 传入路径数组对象
function disposeCutpath(pathArr)
{

    // console.log("这个是传入的路径对象",pathArr)

    for(var i=0; i<pathArr.length; i++)
    {

        var PNpaths = getPrevAndNextPath(pathArr[i]);

        // console.log("前后路径=钱====",PNpaths,PNpaths.prev.d);

        PNpaths.prev.d = extendPath(PNpaths.prev.d,false,20);

        PNpaths.next.d = extendPath(PNpaths.next.d,false,20);

        PNpaths.now = {
            id: pathArr[i].id,
            d: extendPath(pathArr[i].getAttribute("d"),false,20)
        }

        // var nowLen = Raphael.getTotalLength(PNpaths.now.d);

        var RtP = Raphael.pathIntersection(PNpaths.now.d,PNpaths.prev.d);

        var RtN = Raphael.pathIntersection(PNpaths.now.d,PNpaths.next.d);

        // console.log("检查问题在哪===和前后两条路径的交点====",RtP,RtN);

        if(RtP.length<1 || RtN.length < 1){

            console.log("==============没有拿到交点==============",RtP,RtN);

            /*var path1 = document.createElementNS(svgNS,'path');
            var path2 = document.createElementNS(svgNS,'path');
            var path3 = document.createElementNS(svgNS,'path');

            svgedit.utilities.assignAttributes(path1, {
                id: "now_" + i + "_text" + i,
                d: PNpaths.now.d,
                style: "fill:#4c4cff;font-size:12px;"
            });
            svgedit.utilities.assignAttributes(path2, {
                id: "prev_" + i + "_text" + i,
                d: PNpaths.prev.d,
                style: "stroke:#4c4cff;font-size:12px;"
            });
            svgedit.utilities.assignAttributes(path3, {
                id: "next_" + i + "_text" + i,
                d: PNpaths.next.d,
                style: "stroke:#4c4cff;font-size:12px;"
            });

            $("#pointLineGroup").append(path1)
            $("#pointLineGroup").append(path2)
            $("#pointLineGroup").append(path3)*/

            continue;

        }

        var lengthP1 = closestPoint(PNpaths.now.d,RtP[0]).length;

        var lengthN1 = closestPoint(PNpaths.now.d,RtN[0]).length;

        var newPathd;

        if(lengthN1 < lengthP1){

            // alert("这是什么情况啊");
            newPathd = Raphael.getSubpath(PNpaths.now.d,lengthN1,lengthP1);

        }else{

            newPathd = Raphael.getSubpath(PNpaths.now.d,lengthP1,lengthN1);

        }

        $(pathArr[i]).attr("d",newPathd);

        // console.log(RtP,RtN);
        // console.log(lengthP1,lengthN1);

    }
    return;
}

//放码裁片线的封闭路径
function disposeCutPaths(pathArr,show)
{
    if(!pathArr || pathArr.length < 2){
        return;
    }

    var pathMsg = [];

    for(var i=0; i<pathArr.length; i++)
    {
        if(show)
        {
            pathArr[i].setAttribute("style","display:inline");
        }

        if(i>0)
        {
            pathMsg.push(pathArr[i].getAttribute("d").replace(/M/, "L"));
        }else{
            pathMsg.push(pathArr[i].getAttribute("d"));
        }
    }

    var parentNode = pathArr[0].parentNode.id.split("_");

    var idcont = parentNode[1]+"_"+parentNode[2];

    if(parentNode[2])
    {
        idcont = parentNode[1]+"_"+parentNode[2];
    }else{
        idcont = parentNode[1];
    }

    // console.log("看看父元素找的对不对",parentNode,idcont);

    var bboxPathd = pathMsg.join(" ");

    // console.log("看看这个是啥===",bboxPathd)

    var bboxPath = document.createElementNS(svgNS, "path");
    svgedit.utilities.assignAttributes(bboxPath, {
        id: "ClosedPath_" + idcont,
        d: bboxPathd+"z",
        stroke: "#000",
        fill: "none",
        _attribute: "CutPartsPath",
        "stroke-width": 1
    });

    $("#ClosedPathGroup").append(bboxPath);

    // getBBoxInter(pathArr,idcont);
    if(show)
    {
        // getBBoxInter_old(bboxPath,idcont);
        getBBoxInter(pathArr,idcont,true);
    }

    return;

}

//传入封闭路径对象
function getBBoxInter_old(bbpath,idc)
{
    var bb = bbpath.getBBox();

    // console.log(bb);
    var oldWd = $("#WovenDesign_"+idc).attr("d");

    var len = Raphael.getTotalLength(oldWd)/2;

    var midPoint = Raphael.getPointAtLength(oldWd,len);

    var newMidpoint = {
        x:bb.x+bb.width/2,
        y:bb.y+bb.height/2
    }

    var newPlace= {x:newMidpoint.x - midPoint.x,y:newMidpoint.y-midPoint.y};

    var newWd = Raphael.transformPath(oldWd, "t" + newPlace.x + "," + newPlace.y).toString();

    var extendpath = extendPath(newWd);

    var intp = Raphael.pathIntersection(extendpath,$(bbpath).attr("d"));

    var interPoint = delRepeatRts(intp);

    if(interPoint.length > 1){

        var len1 = closestPoint(extendpath,interPoint[0]).length;

        var len2 = closestPoint(extendpath,interPoint[1]).length;

        if(len1 > len2){

            var t = len1;

            len1 = len2;

            len2 = t;

        }

        var dis = (len2 - len1)*0.12;

        var NewWd = Raphael.getSubpath(extendpath,(len1+dis),(len2-dis));

        $("#WovenDesign_"+idc).attr({d:NewWd});

    }else{

        $("#WovenDesign_"+idc).attr({d:newWd});

    }
    cutpartShow(idc);


    return;
}

//传入封闭路径对象
function getBBoxInter(pathArr,idc,isput)
{

    var cp = getCenterPoint(pathArr).cp;

    if(isput)
    {
        var oldWd = $("#WovenDesign_"+idc).attr("d");

        var len = Raphael.getTotalLength(oldWd)/2;

        var midPoint = Raphael.getPointAtLength(oldWd,len);

        var newPlace= {x:cp.x - midPoint.x,y:cp.y-midPoint.y};

        var newWd = Raphael.transformPath(oldWd, "t" + newPlace.x + "," + newPlace.y).toString();

        var extendpath = extendPath(newWd);

        var intp = Raphael.pathIntersection(extendpath,$("#ClosedPath_" + idc).attr("d"));

        var interPoint = delRepeatRts(intp);

        if(interPoint.length > 1){

            var len1 = closestPoint(extendpath,interPoint[0]).length;

            var len2 = closestPoint(extendpath,interPoint[1]).length;

            if(len1 > len2){

                var t = len1;

                len1 = len2;

                len2 = t;

            }

            var dis = (len2 - len1)*0.12;

            var NewWd = Raphael.getSubpath(extendpath,(len1+dis),(len2-dis));

            $("#WovenDesign_"+idc).attr({d:NewWd});

        }else{

            $("#WovenDesign_"+idc).attr({d:newWd});

        }
        cutpartShow(idc);

        return;
    }

  /*  var verter = {
        lev:{x:1, y:0},
        ver:{x:0, y:-1}
    }

    var dis = 500;

    var vertical = {
        top:{
            x:verter.ver.x * dis + cp.x,
            y:verter.ver.y * dis + cp.y
        },
        bottom:{
            x:verter.ver.x * dis + cp.x,
            y:verter.ver.y * (-dis) + cp.y
        }
    };

    var level = {
        left:{
            x:verter.lev.x * dis + cp.x,
            y:verter.lev.y * dis + cp.y
        },
        right:{
            x:verter.lev.x * dis + cp.x,
            y:verter.lev.y * (-dis) + cp.y
        }
    }

    var interS = [],interH = [];


    var pathd_ver ="M "+vertical.bottom.x+" "+vertical.bottom.y+" L "+ vertical.top.x+" "+vertical.top.y;
    var pathd_lev ="M "+level.left.x+" "+level.left.y+" L "+level.right.x+" "+level.right.y;

    var int_ver = Raphael.pathIntersection(pathd_ver,$("#ClosedPath_" + idc).attr("d"));
    var int_lev = Raphael.pathIntersection(pathd_lev,$("#ClosedPath_" + idc).attr("d"));

    int_ver = delRepeatRts(int_ver);
    int_lev = delRepeatRts(int_lev);

    console.log("分别是水平和数值的交点===",int_ver,int_lev);

    if(int_ver.length <2 || int_lev.length < 2) {

        alert("绘制布纹线失败,没有交点!");
        console.log("绘制布纹线失败,没有交点!");

        return;

    }

    var minx =Math.min(int_lev[0].x,int_lev[1].x);
    var newCp_x = ((Math.max(int_lev[0].x,int_lev[1].x)) - minx) + minx;

    var miny = Math.min(int_ver[0].x,int_ver[1].x);
    var maxy = Math.max(int_ver[0].x,int_ver[1].x);
    // var newCp_y = ((Math.max(int_ver[0].x,int_ver[1].x)) - minx) + minx;

    var dis = compareLength(int_ver[0],int_ver[1])*0.12;

    var topPoint = {
        x:newCp_x,
        y:miny + dis
    }
    var btmPoint = {
        x:newCp_x,
        y:maxy - dis
    }


    var WovenPathd = "M "+btmPoint.x+" "+btmPoint.y+" L "+topPoint.x+" "+topPoint.y;
    drawWovenPath(WovenPathd,{d:"M 0 4 4 0 8 4",markerWidth:8,markerHeight:4,refX:4,refY:0},$("#cutpartsgroup_"+idc)[0]);

    console.log("重新的到的坐标点=x",newCp_x);*/

    return;
}

//传入布纹线对象
function cutpartShow(idc)
{
    var tempNum = $("#cutpartsgroup_"+idc).attr("attr_tempNum");

    var cutName = $("#cutpartsgroup_"+idc).attr("attr_cutName");
    var cutNum = $("#cutpartsgroup_"+idc).attr("attr_cutNum");
    var remark = $("#cutpartsgroup_"+idc).attr("attr_remark");
    var fabric = $("#cutpartsgroup_"+idc).attr("attr_fabric");


    if(cutName  && cutNum  && remark  && fabric){

        $("#WovenDesign_"+idc).attr("stroke","#093");

        $("#Arrow_"+idc).find("path").css("stroke","#093");

        var wovenD = $("#WovenDesign_"+idc).attr("d");
        for(var i = 1; i<4; i++){

            var tr1 = 12*i;

            if(i == 3){
                tr1 = -12;
            }

            var newPad = getParallelPath22(wovenD,tr1);

            var newPaddata = getPointData(newPad);
            var vertor = getVector(newPaddata.start,newPaddata.end).vertor;
            if(vertor.x < 0){
                newPad = ReversePath(newPad);
            }
            //d
            if($("#curPartAttr").find("#attrPath_"+idc+"_"+i).length > 0){

                $("#attrPath_"+idc+"_"+i).attr("d",newPad);

                switch (i){
                    case 1:
                        $("WovenDesign_"+idc+'_txtPath1').textContent = cutName + " * "+cutNum;
                        break;
                    case 2:
                        $("WovenDesign_"+idc+'_txtPath2').textContent = "备注："+remark;
                        break;
                    case 3:
                        $("WovenDesign_"+idc+'_txtPath3').textContent = fabric;
                        break;
                }



            }else{
                var paraPath = document.createElementNS(svgNS, 'path');
                svgedit.utilities.assignAttributes(paraPath, {
                    id:"attrPath_"+idc+"_"+i,
                    class:"WovenDesign_"+idc,
                    "d":newPad,
                    "stroke":"#fff",
                    display:"none"
                });
                $("#curPartAttr").append(paraPath);

                //添加文字
                var text = document.createElementNS(svgNS, 'text');
                svgedit.utilities.assignAttributes(text, {
                    id:"WovenDesign_"+idc + "_txt"+i,
                    class:"WovenDesign_"+idc,
                    'style' : 'text-anchor:middle;stroke-width:0.5;fill:#fff;font-size:8px;pointer-events:none'
                });
                $("#curPartAttr").append(text);

                var textPath = document.createElementNS(svgNS, 'textPath');
                svgedit.utilities.assignAttributes(textPath, {
                    id: "WovenDesign_"+idc+'_txtPath'+i,
                    'xlink:href' : "#attrPath_"+idc+"_"+i,
                    'startOffset' : '50%'
                });
                text.appendChild(textPath);

                switch (i){
                    case 1:
                        textPath.textContent = cutName + " * "+cutNum;
                        break;
                    case 2:
                        textPath.textContent = "备注："+remark;
                        break;
                    case 3:
                        textPath.textContent = fabric;
                        break;
                }

            }

        }

    }
}



//获取对称裁片
function getCutPartSymmetry(elem)
{
    var MirPath;

    var pathparentNode = elem.parentNode;

    var SymID = "SymmetryCutPath_"+pathparentNode.id.split("_")[1];
    // console.log("不知道这个是什么===",pathparentNode,SymID);

    if($(pathparentNode).find("#"+SymID).length < 1){

        var nodeG =  document.createElementNS(svgNS, "g");
        nodeG.setAttribute("id",SymID);
        pathparentNode.appendChild(nodeG);

    }


    if(isLine(elem)){

        MirPath = extendPath(elem);

    }else{

        var pathdata = getPointData(elem);

        var vertor = getVector(pathdata.start,pathdata.end);

        var mp1 = {
            x:vertor.Unvertor.x * 1000 +pathdata.start.x ,
            y:vertor.Unvertor.y * 1000 +pathdata.start.y ,
        }
        var mp2 = {
            x:vertor.vertor.x * 1000 +pathdata.end.x ,
            y:vertor.vertor.y * 1000 +pathdata.end.y ,
        }

        MirPath = "M " + mp1.x + ","+ mp1.y +" C "+ mp2.x +","+ mp2.y+" "+mp2.x +","+ mp2.y+" "+mp2.x +","+ mp2.y;

        console.log(MirPath)

    }

    var  symPath = $(elem).siblings("path");

    $("#HemGroup_"+pathparentNode.id.split("_")[1]).find("#"+elem.id.replace(/cutPath/, "Hem")).hide();

    var cutHem = getPrevAndNextPath($("#"+elem.id.replace(/cutPath/, "Hem")));

    var interPrev = Raphael.pathIntersection(cutHem.prev.d,MirPath)[0];
    var interNext = Raphael.pathIntersection(cutHem.next.d,MirPath)[0];

    var prevInterLength = closestPoint(cutHem.prev.d,interPrev).length;
    var nextInterLength = closestPoint(cutHem.next.d,interNext).length;

    var cutHemPrev = Raphael.getSubpath(cutHem.prev.d, 0, prevInterLength);
    var cutHemNext = Raphael.getSubpath(cutHem.next.d, nextInterLength, Raphael.getTotalLength(cutHem.next.d));

    $("#"+cutHem.prev.id).attr("d",cutHemPrev);
    $("#"+cutHem.next.id).attr("d",cutHemNext);

    var  symHemPath = [];
    var Mirpaths = [];

    for(var i=0;i<symPath.length;i++){

        console.log();
        var hemID = symPath[i].id.replace(/cutPath/, "Hem");
        console.log(hemID)
        symHemPath.push( $("#"+hemID)[0] );

        // $(elem).attr("d",MirPath)
        //拿到镜像出来的cutpath
        var Mirpathd = getMirrorImage(symPath[i],MirPath);
        var MirHempathd = getMirrorImage(symHemPath[i],MirPath);


        Mirpaths.push(extendPath(symPath[i],false,10));
        Mirpaths.push(extendPath(Mirpathd,false,10));

        if($("#"+symPath[i].id + "_Sym").length > 0){

            $("#"+symPath[i].id + "_Sym").attr("d",Mirpathd);

        }else{

            var Mirpath = document.createElementNS(svgNS, "path");

            svgedit.utilities.assignAttributes(Mirpath, {
                id: symPath[i].id + "_Sym",
                d: Mirpathd,
                stroke: "#ff6",
                fill: "none",
                'display' : 'inline',
                "stroke-width": 1 / svgCanvas.getCanvasScale(),
            });

            $("#"+ SymID).append(Mirpath);

        }


        if($("#"+symHemPath[i].id + "_Sym") > 0){

            $("#"+symPath[i].id + "_Sym").attr("d",MirHempathd);

        }else{

            var MirHempath = document.createElementNS(svgNS, "path");

            svgedit.utilities.assignAttributes(MirHempath, {
                id: symHemPath[i].id + "_Sym",
                d: MirHempathd,
                stroke: "#f50",
                fill: "none",
                'display' : 'inline',
                "stroke-width": 1 / svgCanvas.getCanvasScale(),
            });

            $("#"+ SymID).append(MirHempath);

        }

    }
    var  newPaths = svgedit.utilities.getIsolatedPaths(Mirpaths);
    console.log("对称出来的线",Mirpaths,newPaths)

    return;
}


//del Repeat array
var delRepeatRts = function(rts)
{
    var newArry = new Array();

    var len = rts.length;

    for(var i=0; i<len; i++)
    {
        for(var j=i+1; j<len; j++)
        {
            if(isEqual(rts[i],rts[j]))
            {
                ++i;
            }

        }
        newArry.push(rts[i]);

    }

    return newArry;

}

//显示裁片的缝边宽度
function showHemWidth(){
    var Hemgroup = $("#HemGroupList").find(".HemGroup");

    if(Hemgroup < 1){
        return;
    }

    console.log(Hemgroup);

    if($("#HemGroupList").find("#HemTextGroup").length <1){

        var nodeG = document.createElementNS(svgNS, 'g');
        nodeG.setAttribute("id","HemTextGroup");
        $("#HemGroupList").append(nodeG)

    }

    if($("#HemTextGroup").children().length > 1){
        $("#HemTextGroup").children().remove();
        return;
    }

    for(var i=0;i<Hemgroup.length;i++){

        var HemPath = Hemgroup[i].childNodes;

        for(var j = 0; j<HemPath.length; j++){
            var HemWidth1 = HemPath[j].getAttribute("attr_Hem1");
            var HemWidth2 = HemPath[j].getAttribute("attr_Hem2");
            var pathId = HemPath[j].id;

            console.log(HemWidth1,HemWidth2,pathId);

            var text = document.createElementNS(svgNS, 'text');
            svgedit.utilities.assignAttributes(text, {
                id:pathId + "_text",
                'style' : 'text-anchor:middle;fill:#fff;font-size:10px;pointer-events:none'
            });
            $("#HemTextGroup").append(text);


            var textPath = document.createElementNS(svgNS, 'textPath');
            svgedit.utilities.assignAttributes(textPath, {
                id: pathId+'_textPath',
                'xlink:href' : '#'+pathId,
                'startOffset' : '50%'
            });

            text.appendChild(textPath);


            var vertorJu = {x:1,y:0},
                len = HemPath[j].getTotalLength()/2,
                p1 = HemPath[j].getPointAtLength(len - 1),
                p2 = HemPath[j].getPointAtLength(len + 1),
                vertor = getVector(p1,p2).vertor,
                angle = VectorAngle(vertorJu,vertor);

            if(angle>120){

                $(text).attr({transform:"rotate(180,"+p1.x+","+p1.y+")"});

            }

            textPath.textContent = HemWidth1+" , "+HemWidth2+" px";
        }

    }



}

function moveCutPart(pt){

    var newPlace,
        moveGroup = $("#cutpartsgroup g[_attr=selectgroup],#putSizegroup g[_attr=selectgroup]"),
        moveHemGroup = $("#cutpartsgroup g[_attr=selectHemgroup],#putSizegroup g[_attr=selectHemgroup]");

    if(moveGroup < 1){
        return;
    }

    // console.log("找到了没有啊",moveGroup)

    $("#svgroot").on("mousemove",function(evt){
        var pt2 = svgedit.math.transformPoint(evt.pageX, evt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse())
        newPlace= {x:pt2.x - pt.x,y:pt2.y-pt.y};

        for(var i = 0;i<moveGroup.length;i++){

            var woId,
                IdSpt= moveGroup[i].id.split("_");
            if(IdSpt.length == 3){

                woId = IdSpt[1]+"_"+IdSpt[2];

                // return;
            }else{

                woId = IdSpt[1];

            }

            $(moveGroup[i]).attr({transform:"translate("+newPlace.x+","+newPlace.y+")"});

            $(moveHemGroup[i]).attr({transform:"translate("+newPlace.x+","+newPlace.y+")"});


            $("#WovenDesign_"+woId).attr({transform:"translate("+newPlace.x+","+newPlace.y+")"});

            $("#ClosedPath_"+woId).attr({transform:"translate("+newPlace.x+","+newPlace.y+")"});

            // console.log("为什么拿不到id======",moveHemGroup[i])

            $("#HemSupplementgroup").find("."+$(moveHemGroup[i]).attr("id")).attr({transform:"translate("+newPlace.x+","+newPlace.y+")"});

            $("#curPartAttr").find(".WovenDesign_"+woId).attr({transform:"translate("+newPlace.x+","+newPlace.y+")"});

        }
    });

    $("#svgroot").on("mousedown",function(evt) {

        for(var j=0;j<moveGroup.length;j++)
        {
            var transPath = $(moveGroup[j]).find("path");
            var transHemPath = $(moveHemGroup[j]).find("path");

            var woId,
                IdSpt= moveGroup[j].id.split("_");

            if(IdSpt.length == 3){

                woId = IdSpt[1]+"_"+IdSpt[2];

                // return;
            }else{

                woId = IdSpt[1];

            }

            var wovD = $("#WovenDesign_"+woId).attr("d");
            var newD = Raphael.transformPath(wovD, "t" + newPlace.x + "," + newPlace.y);


            if($("#curPartAttr").find(".WovenDesign_"+woId).length > 0){
                $("#WovenDesign_"+woId).attr({d:newD,stroke:"#093"});
            }else{
                $("#WovenDesign_"+woId).attr({d:newD,stroke:"#f01"});
            }

            $("#WovenDesign_"+woId)[0].removeAttribute("transform");

            var closed = $("#ClosedPath_"+woId).attr("d");
            var closeNewd = Raphael.transformPath(closed, "t" + newPlace.x + "," + newPlace.y);
            $("#ClosedPath_"+woId).attr("d",closeNewd);

            $("#ClosedPath_"+woId)[0].removeAttribute("transform");

            moveGroup[j].removeAttribute("transform");
            moveHemGroup[j].removeAttribute("transform");
            moveGroup[j].removeAttribute("_attr");
            moveHemGroup[j].removeAttribute("_attr");

            for (var i = 0; i < transPath.length; i++)
            {
                var thisd1 = $(transPath[i]).attr("d");
                var newd1 = Raphael.transformPath(thisd1, "t" + newPlace.x + "," + newPlace.y)
                $(transPath[i]).attr({"d": newd1});
                PathColor(transPath[i]);

                var thisd2 = $(transHemPath[i]).attr("d");
                var newd2 = Raphael.transformPath(thisd2, "t" + newPlace.x + "," + newPlace.y);
                $(transHemPath[i]).attr({"d": newd2});
                PathColor(transHemPath[i]);
            }

            var supPath = $("#HemSupplementgroup").find("."+moveHemGroup[j].id);

            for(var s = 0;s<supPath.length;s++)
            {
                var sd = supPath[s].getAttribute("d");

                var newsd = Raphael.transformPath(sd, "t" + newPlace.x + "," + newPlace.y);
                $(supPath[s]).attr({d:newsd});

                PathColor(supPath[s]);
                supPath[s].removeAttribute("transform");
            }

            var curPartArr =$("#curPartAttr").find("path.WovenDesign_"+woId);
            var curParttext =$("#curPartAttr").find("text.WovenDesign_"+woId);

            for(var k = 0;k<curPartArr.length;k++){
                var pathd  = curPartArr[k].getAttribute("d");
                var newsd = Raphael.transformPath(pathd, "t" + newPlace.x + "," + newPlace.y);
                $(curPartArr[k]).attr({d:newsd});
                curPartArr[k].removeAttribute("transform");
                curParttext[k].removeAttribute("transform");
            }

        }

        $("#steps").html("请在<span style='color: #2e5dea;font-size: 14px;'>裁片内部</span>点击选择要移动的裁片，右键结束");

        $("#svgroot").unbind("mousemove mousedown");

    })

    return;
}

//获取当前曲路径的 逆路径
function  ReversePath(pathStr)
{
    if(typeof(pathStr) == 'object'){
        pathStr = $(pathStr).attr("d")
    }
    var points = [],
        pathLength = Raphael.getTotalLength(pathStr),
        precision = pathLength,
        counts = Math.floor(pathLength /8);

    paper.setup();
    var myPath = new Path();
    for(var i = 0,point,pLength;i <= counts; i++){
        if(i  == counts ) {
            point = Raphael.getPointAtLength(pathStr,0);
            pLength = 0;
        }else{
            point = Raphael.getPointAtLength(pathStr,precision)
            pLength = precision;
        }
        myPath.add(new Point(point.x, point.y));
        points.push({x:point.x,y:point.y,length:pLength})
        precision-=8;
    }
    myPath.simplify();
    var cpath1 = paper.project.exportSVG(myPath);
    var pathd =$(cpath1).find("path").attr("d");
    // console.log(points)
    return pathd;
}

function showPOPbox(){
    $("#PopupBox").show();
    $("#PopupBox_cont").siblings().hide();
    $("#PopupBox_cont").show();
    console.log("弹出框弹出一次");
    return;
}


function RestoreInp(){
    $("#AL_Length").val("0");
    $("#AL_angle").val("90");
    $("#CompassRadius1").val("0");
    $("#radius").val("0");
    $("#equidistance").val("0");
    $("#lineCount").val("1");
    $("#kMark_length").val("0");
    $("#kMark_ratio").val("0");
    return;
}

//捕捉偏移点
function getOffsetPoint(evt){
    var mousePoint = svgedit.math.transformPoint( mouseEvt.pageX, mouseEvt.pageY, $('#svgcontent g')[0].getScreenCTM().inverse() );

    if($("#svgcontent").find("#mousepointGroup").length<1){

        var pointGroup = document.createElementNS(svgNS, "g");
        svgedit.utilities.assignAttributes(pointGroup, {
            id:"mousepointGroup"
        })
        $("#svgcontent").append(pointGroup);
    }

    var PointCircle = document.createElementNS(svgNS, "circle");
    svgedit.utilities.assignAttributes(PointCircle, {
        id:"mousepoint",
        cx: mousePoint.x,
        cy: mousePoint.y,
        r:3,
        "stroke-width": 0.5,
        stroke:"#fff",
        fill:"#33c",
    });
    $("#mousepointGroup").append(PointCircle);

    var pageP = {
        x:mouseEvt.pageY+10,
        y:mouseEvt.pageX - 84
    }

    $("#offsetInp").css({top:pageP.x +"px",left:pageP.y +"px"});
    $("#offX").val('');
    $("#offY").val('');
    $("#offsetInp").show();

    $('#offX').bind('input propertychange', function() {

        var offx = parseInt($('#offX').val());
        if(isNaN(offx)){
            $("#mousepoint").attr({"cx":mousePoint.x});
            return;
        }

        var Cx = mousePoint.x + (offx*conversion);
        $("#mousepoint").attr({"cx":Cx});

    });

    $('#offY').bind('input propertychange', function(evt) {

        var offy = parseInt($('#offY').val());
        if(isNaN(offy)){
            $("#mousepoint").attr({"cy":mousePoint.y});
            return;
        }

        var Cy = mousePoint.y  -  (offy*conversion);
        $("#mousepoint").attr({"cy":Cy});
    });
    return;
}

function clickCutpart(pt)
{
    var IdCount = IsIncutpart(pt);

    if(IdCount){

        // console.log($("#"+IdCount).attr("_attr"));
        var IdSpt = IdCount.split("_");

        var IdStr;

        if(IdSpt.length == 3){

            IdStr = IdSpt[1]+"_"+IdSpt[2];

        }else{

            IdStr = IdSpt[1];

        }

        if($("#"+IdCount).attr("_attr") == 'selectgroup'){

            $("#"+IdCount)[0].removeAttribute("_attr");

            $("#HemGroup_"+IdStr)[0].removeAttribute("_attr");

            var supPaths = $("#HemSupplementgroup").find(".HemGroup_"+IdCount.split("_")[1]);

            for(var i=0;i<supPaths.length;i++){
                $(supPaths[i]).attr("stroke","#f50");
            }

            var paths1 = $("#"+IdCount).find("path");
            var paths2 = $("#HemGroup_"+IdStr).find("path");

            for(var j=0;j<paths1.length;j++){
                $(paths1[j]).attr("stroke","#ff6");
                $(paths2[j]).attr("stroke","#f50");
            }

            return;
        }


        $("#"+IdCount).attr("_attr","selectgroup");

        $("#HemGroup_"+IdStr).attr("_attr","selectHemgroup");

        var supPaths = $("#HemSupplementgroup").find(".HemGroup_"+IdStr);

        for(var i=0;i<supPaths.length;i++){
            // $(supPaths[i]).attr("stroke","red");
            PathColor(supPaths[i]);
        }

        var cutpathsgroup = [];

        cutpathsgroup.push($("#"+IdCount).find("path"));

        cutpathsgroup.push($("#HemGroup_"+IdStr).find("path"));

        console.log("这个是选中的裁片线===",cutpathsgroup);
        for(var j=0;j<cutpathsgroup.length;j++){
            var cutpaths = cutpathsgroup[j];
            for(var i=0;i<cutpaths.length;i++){
                // $(cutpaths[i]).attr("stroke","red");
                PathColor(cutpaths[i]);
            }
        }
    }
    return;
}

//片规则拷贝选中
function clickRulerCopy(pt){
    var IdCount = IsIncutpart(pt);
    if(IdCount){

        if($("#"+IdCount).attr("_attr") == 'selectgroup'){
            $("#"+IdCount)[0].removeAttribute("_attr");
            $("#HemGroup_"+IdCount.split("_")[1])[0].removeAttribute("_attr");
            var supPaths = $("#HemSupplementgroup").find(".HemGroup_"+IdCount.split("_")[1]);
            for(var i=0;i<supPaths.length;i++){
                $(supPaths[i]).attr("stroke","#f50");
            }

            var paths1 = $("#"+IdCount).find("path");
            var paths2 = $("#HemGroup_"+IdCount.split("_")[1]).find("path");
            for(var j=0;j<paths1.length;j++){
                $(paths1[j]).attr("stroke","#ff6");
                $(paths2[j]).attr("stroke","#f50");
            }

            return;
        }

        $("#"+IdCount).attr("_attr","selectgroup");
        $("#HemGroup_"+IdCount.split("_")[1]).attr("_attr","selectHemgroup");
        var supPaths = $("#HemSupplementgroup").find(".HemGroup_"+IdCount.split("_")[1]);


        for(var i=0;i<supPaths.length;i++){
            $(supPaths[i]).attr("stroke","red");
        }

        var cutpathsgroup = [];
        cutpathsgroup.push($("#"+IdCount).find("path"));
        cutpathsgroup.push($("#HemGroup_"+IdCount.split("_")[1]).find("path"));

        for(var j=0;j<cutpathsgroup.length;j++){
            var cutpaths = cutpathsgroup[j];
            for(var i=0;i<cutpaths.length;i++){
                PathColor(cutpaths[i],false,'#ff2a21');

            }
        }
        return cutpathsgroup[0];
    }
    return ;
}

function setSliceRulerCopy(elemsBefore,elemsAfter) {
    if(elemsBefore.length == 0){return;}
    var LR = $('#LeftRightSymmetric').attr('checked');
    var UD = $('#UpDownSymmetric').attr('checked');
    var beforeId = elemsBefore[0].parentNode.id.slice(-1);
    var afterId = elemsAfter[0].parentNode.id.slice(-1);
    var color;
    var bboxB = $('#ClosedPath_'+beforeId).get(0).getBBox();
    var bboxA = $('#ClosedPath_'+afterId).get(0).getBBox();
    var xDir = 'M'+(bboxB.x+bboxB.width/2)+','+(bboxB.y+bboxB.height/2)+' L '+(bboxB.x+bboxB.width)+','+(bboxB.y+bboxB.height/2);
    var yDir = 'M'+(bboxB.x+bboxB.width/2)+','+(bboxB.y+bboxB.height/2)+' L '+(bboxB.x+bboxB.width/2)+','+(bboxB.y+bboxB.height);
    var trans = 't'+(bboxA.x-bboxB.x)+','+(bboxA.y-bboxB.y);
    for(var i = 0;i<elemsAfter.length;i++){
        var arr = new Array();
        for(var j = 0;j<elemsBefore.length;j++){

            PathColor(elemsBefore[j],false,'#ff2a21');

            var elemD = elemsBefore[j].getAttribute('d');
            var tranStrB;
            if(!LR&& !UD){
                tranStrB = elemD;
            }else if(LR&&!UD){
                tranStrB = getMirrorImage(elemD,yDir);
            }else if(!LR&&UD){
                tranStrB = getMirrorImage(elemD,xDir);
            }else if(LR&&UD){
                tranStrB = getMirrorImage(elemD,yDir);
                tranStrB = getMirrorImage(tranStrB,xDir);
            }
            var pathStrB = Raphael.mapPath(tranStrB,Raphael.toMatrix(tranStrB,trans)).toString();
            var elemA = getPointData(elemsAfter[i]);
            var elemB = getPointData(pathStrB);
            var disx = elemA.center.x - elemB.center.x;
            var disy = elemA.center.y - elemB.center.y;
            var dis = disx*disx+disy*disy;
            arr.push(dis);
            if(elemsBefore[j].getAttribute('_attrColor')){
                color = elemsBefore[j].getAttribute('_attrColor');
            }
        }
        var minDis = Math.min.apply(null,arr);
        var indx = arr.indexOf(minDis);
        var attrStartX = elemsBefore[indx].getAttribute('attr_startRulerX');
        var attrStartY = elemsBefore[indx].getAttribute('attr_startRulerY');
        var attrEndX = elemsBefore[indx].getAttribute('attr_endRulerX');
        var attrEndY = elemsBefore[indx].getAttribute('attr_endRulerY');
        if(attrStartX != null){
            $("#setRule_x").val(attrStartX);
            $("#setRule_y").val(attrStartY);
            if((LR&&UD)){
                elemsAfter[i].setAttribute("attr_putStart","0");
            }else if((!LR&&!UD)){
                elemsAfter[i].setAttribute("attr_putStart","0");
            }else {
                elemsAfter[i].setAttribute("attr_putEnd","0");
            }
            getPutSize(false,$(elemsAfter[i]));
        }
        if(attrEndX != null){

            $("#setRule_x").val(attrEndX);
            $("#setRule_y").val(attrEndY);
            if((LR&&UD)){
                elemsAfter[i].setAttribute("attr_putEnd","0");
            }else if((!LR&&!UD)){
                elemsAfter[i].setAttribute("attr_putEnd","0");
            }else{
                elemsAfter[i].setAttribute("attr_putStart","0");
            }
            getPutSize(false,$(elemsAfter[i]));

        }

        PathColor(elemsAfter[i],false,'#ff2a21');

    }

}
function getCopyPoint(pathStr,isget){

    var allPts = new Array();

    for (var i = 0 ; i < pathStr.length ; ++i)
    {

        for (var j = 0 ; j < pathStr.length ; ++j)
        {
            if (i != j)
            {

                var path1 = extendPath(pathStr[i],false,15);

                var path2 = extendPath(pathStr[j],false,15);

                var rt = Raphael.pathIntersection(path1 , path2)[0];

                if(rt){

                    addPointCircle(rt,"#rulerMarkgroup");

                    allPts.push({
                        point:rt,
                        prev:pathStr[i],
                        next:pathStr[j]
                    });

                }

            }
        }

    }


    return allPts;
}
/*function setSliceRulerCopy(elemsBefore,elemsAfter) {
    if(elemsBefore.length == 0){return;}
    var LR = $('#LeftRightSymmetric').attr('checked');
    var UD = $('#UpDownSymmetric').attr('checked');
    var beforeId = elemsBefore[0].parentNode.id.slice(-1);
    var afterId = elemsAfter[0].parentNode.id.slice(-1);
    var bboxB = $('#ClosedPath_'+beforeId).get(0).getBBox();
    var bboxA = $('#ClosedPath_'+afterId).get(0).getBBox();
    var xDir = 'M'+(bboxB.x+bboxB.width/2)+','+(bboxB.y+bboxB.height/2)+' L '+(bboxB.x+bboxB.width)+','+(bboxB.y+bboxB.height/2);
    var yDir = 'M'+(bboxB.x+bboxB.width/2)+','+(bboxB.y+bboxB.height/2)+' L '+(bboxB.x+bboxB.width/2)+','+(bboxB.y+bboxB.height);
    var trans = 't'+(bboxA.x-bboxB.x)+','+(bboxA.y-bboxB.y);
    var pointArr = getCopyPoint(elemsAfter);
    for(var i = 0;i<pointArr.length;i++){
        var pathAfter = pointArr[i].pathStart;
        var arr = new Array();
        var pathArr = new Array();
        for(var j = 0;j<elemsBefore.length;j++){
            var elemD = elemsBefore[j].getAttribute('d');
            var tranStrB;
            if(!LR&& !UD){
                tranStrB = elemD;
            }else if(LR&&!UD){
                tranStrB = getMirrorImage(elemD,yDir);
            }else if(!LR&&UD){
                tranStrB = getMirrorImage(elemD,xDir);
            }else if(LR&&UD){
                tranStrB = getMirrorImage(elemD,yDir);
                tranStrB = getMirrorImage(tranStrB,xDir);
            }
            var pathStrB = Raphael.mapPath(tranStrB,Raphael.toMatrix(tranStrB,trans)).toString();
            // var elemA = getPointData(pathAfter);
            // var elemB = getPointData(pathStrB);
            elemsBefore[j].setAttribute('d',pathStrB);
            pathArr.push({
                path:elemsBefore[j],
                old:elemD
            });
        }
        var pointAfter = getCopyPoint(pathArr,true);
        for(var k = 0;k<pathArr.length;k++){
            pathArr[k].path.setAttribute('d',pathArr[k].old);
        }
        for(var k = 0;k<pointAfter.length;k++){
            var disx = pointArr[i].rt.x - pointAfter[k].rt.x;
            var disy = pointArr[i].rt.y - pointAfter[k].rt.y;
            var dis = disx*disx+disy*disy;
            arr.push(dis);
        }
        var minDis = Math.min.apply(null,arr);
        var indx = arr.indexOf(minDis);
        var nowBefore = pointAfter[indx].pathStart;
        var attrStartX = nowBefore.getAttribute('attr_startRulerX');
        var attrStartY = nowBefore.getAttribute('attr_startRulerY');
        var attrEndX = nowBefore.getAttribute('attr_endRulerX');
        var attrEndY = nowBefore.getAttribute('attr_endRulerY');
        if(attrStartX != null){
            $("#setRule_x").val(attrStartX);
            $("#setRule_y").val(attrStartY);
            if((LR&&UD)||(!LR&&!UD)){
                pathAfter.setAttribute("attr_putStart","0");
                pointArr[i].pathEnd.setAttribute("attr_putEnd","0");

            }else{
                pathAfter.setAttribute("attr_putEnd","0");
                pointArr[i].pathEnd.setAttribute("attr_putStart","0");
            }
            getPutSize(false,$(pathAfter));
        }else if(attrEndX != null){

            $("#setRule_x").val(attrEndX);
            $("#setRule_y").val(attrEndY);
            if((LR&&UD)||(!LR&&!UD)){
                pathAfter.setAttribute("attr_putEnd","0");
                pointArr[i].pathEnd.setAttribute("attr_putStart","0");
            }else{
                pathAfter.setAttribute("attr_putStart","0");
                pointArr[i].pathEnd.setAttribute("attr_putEnd","0");
            }
            getPutSize(false,$(pathAfter));

        }
    }
}
function getCopyPoint(pathArr,isPath){

    var allPts = new Array();

    for (var i = 0 ; i < pathArr.length ; ++i)
    {

        for (var j = 0 ; j < pathArr.length ; ++j)
        {
            if (i != j)
            {
                var pathA = pathArr[i],pathB = pathArr[j];
                if(isPath){
                    pathA = pathArr[i].path;
                    pathB = pathArr[j].path;
                }

                var path1 = extendPath(pathA,false,8);

                var path2 = extendPath(pathB,false,8);

                var rt = Raphael.pathIntersection(path1 , path2)[0];

                if(rt){

                    var cp = closestPoint(pathA,rt).length;

                    var pathLength = pathA.getTotalLength() / 2;

                    if(cp < pathLength){

                        allPts.push({
                            rt:rt,
                            pathStart:pathA,
                            pathEnd:pathB
                        });


                    }else {

                        allPts.push({
                            rt:rt,
                            pathStart:pathB,
                            pathEnd:pathA
                        });

                    }


                }

            }
        }

    }


    return allPts;
}*/
//对齐
function setAlignPoint(path) {
    var pts = getPutSizePoint(path,false,true);
    if(pts.length>0){
        var id = path[0].id.split('_')[1];
        var idFirst = path[0].id.split('_')[2];
        var idNext = path[1].id.split('_')[2];
        var paths = $('#putSizegroupList').find('g');
        for(var i = 0;i<paths.length;i++){
            var parendId= paths[i].id.split('_');
            if(parendId.length>1){
                if(parendId[1] == id){
                    var childPath = $(paths[i]).find('path');
                    var arr = new Array();
                    for(var j = 0;j<childPath.length;j++){
                        var childPathId = childPath[j].id.split('_')[2];
                        if(childPathId == idFirst||childPathId == idNext){
                            arr.push(childPath[j]);
                        }
                    }
                    var pt = getPutSizePoint(arr,false,true);
                    var x = pts[0].rt.x - pt[0].rt.x;
                    var y = pts[0].rt.y - pt[0].rt.y;
                    var trans = 'translate('+x+','+y+')';
                    for(var j = 0;j<childPath.length;j++){
                        childPath[j].setAttribute('transform',trans);
                        if($(childPath[j]).attr('show')){
                            $(childPath[j]).hide();
                            $(childPath[j]).removeAttr('show');
                        }else{
                            if($(childPath[j]).css('display')=='none'){
                                $(childPath[j]).show();
                                $(childPath[j]).attr('show','true');
                            }
                        }

                    }
                }
            }
        }
    }else{
        return;
    }
}
//
//给路径的两端添加锚点
//elem:path 对象
function addPathMark(elem) {

    var parendNode = $("#svgcontent > g:first-child");
    if(parendNode.length >0 && $(parendNode).children("#stroke_marker").length <1){
        var defsElem = document.createElementNS(svgNS, "defs");
        defsElem.innerHTML = '<marker id="stroke_marker" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><circle cx="5" cy="5" r="5" style="fill:#0f0;"/></marker>';
        $(parendNode)[0].appendChild(defsElem);
    }
    elem.setAttribute("marker-start","url(#stroke_marker)");
    elem.setAttribute("marker-end","url(#stroke_marker)");
}

//获取放码点
function getPutSizePoint(pathArr,isget,isPt){

    var allPts = new Array();

    // && pathArr[0].id.split("_")[0] != 'cutPath'
    if(pathArr.length  == 1 && pathArr[0].id.split("_")[0] != 'cutPath'){

        var pt = {

            x:pathArr[0].getAttribute("attr_ptx"),

            y:pathArr[0].getAttribute("attr_pty")

        }

        var pathdata = getPointData(pathArr[0]);

        var dis1 = distanceTwoPoint(pathdata.start,pt);

        var dis2 = distanceTwoPoint(pathdata.end,pt);

        var rt = pathdata.start;

        if(dis1 < dis2){

            allPts.push({
                rt:rt,
                pathStart:pathArr[0],
                pathEnd:false
            });

            if(isget){

                pathArr[0].setAttribute("attr_putStart","0");


            }

        }else if(dis1 > dis2){

            rt = pathdata.end;

            allPts.push({
                rt:rt,
                pathStart:false,
                pathEnd:pathArr[0],
            });

            if(isget){

                pathArr[0].setAttribute("attr_putEnd","0");

            }
        }

        if(!isPt){
            addPointCircle(rt,"#rulerMarkgroup");

        }
    }
    else{
        for (var i = 0 ; i < pathArr.length ; ++i)
        {

            for (var j = 0 ; j < pathArr.length ; ++j)
            {
                if (i != j)
                {

                    var path1 = extendPath(pathArr[i],false,8);

                    var path2 = extendPath(pathArr[j],false,8);

                    var rt = Raphael.pathIntersection(path1 , path2)[0];

                    if(!rt){

                        // console.log("就没有进入判断端点的模式")

                        var pathdata1 = getPointData(pathArr[i]);

                        var pathdata2 = getPointData(pathArr[j]);

                        if(isEqual(pathdata1.start,pathdata2.start) || isEqual(pathdata1.start,pathdata2.end)){

                            // console.log("拿到数据没有啊啊start",rt)
                            rt = pathdata1.start;

                        }else if(isEqual(pathdata1.end,pathdata2.start) || isEqual(pathdata1.end,pathdata2.end)){

                            rt = pathdata1.end;

                            // console.log("拿到数据没有啊啊end",rt);


                        }

                    }

                    if(rt){

                            addPointCircle(rt,"#rulerMarkgroup");

                            var cp = closestPoint(pathArr[i],rt).length;

                            var pathLength = pathArr[i].getTotalLength() / 2;

                            if(cp < pathLength){

                                allPts.push({
                                    rt:rt,
                                    pathStart:pathArr[i],
                                    pathEnd:pathArr[j]
                                });

                                if(isget) {

                                    pathArr[i].setAttribute("attr_putStart", "0");
                                }

                            }else {

                                allPts.push({
                                    rt:rt,
                                    pathStart:pathArr[j],
                                    pathEnd:pathArr[i]
                                });

                                if(isget) {

                                    pathArr[i].setAttribute("attr_putEnd","0");

                                }
                            }


                    }

                }
            }

        }
    }

    return allPts;
}
//水平和数值方向的放码量计算
function setRulershow_x() {

    var Inp_x = $(".val_RulerX");

    var referInp_x = parseInt($("#setRule_x").val());


    if(referInp_x == "" || isNaN(referInp_x)){
        return;
    }

    // console.log(referInp_x);

    var referIndex = $(".pattern2").find(".refer_inp").parent("tr").index() - 1;

    var flag  = true;

    if($('#showPutSize2').is(':checked')) {
        flag = false;
    }

    for(var i = referIndex,p=0; i >= 0; i--){

        if(flag){

            $(Inp_x[i]).find("input").val(-p*referInp_x);

        }else{

            $(Inp_x[i]).find("input").val(-referInp_x);

        }

        p++;

    }
    for(var i = referIndex+1 ,p=1; i < Inp_x.length; i++){

        if(i<thisRule.length){

            if(flag){

                $(Inp_x[i]).find("input").val(p*referInp_x);

            }else{

                $(Inp_x[i]).find("input").val(referInp_x);

            }

        }else{

            $(Inp_x[i]).find("input").val(" ");

        }


        p++;

    }

    return;
}

function setRulershow_y(){

    var Inp_y = $(".val_RulerY");

    var referInp_y = parseInt($("#setRule_y").val());

    if(referInp_y == "" || isNaN(referInp_y)){
        return;
    }

    var referIndex = $(".pattern2").find(".refer_inp").parent("tr").index() - 1;

    var flag  = true;

    if($('#showPutSize2').is(':checked')) {
        flag = false;
    }



    for(var i = referIndex,p=0; i >= 0; i--){

        if(flag){

            $(Inp_y[i]).find("input").val(-p*referInp_y);

        }else{

            $(Inp_y[i]).find("input").val(-referInp_y);

        }

        p++;

    }
    for(var i = referIndex+1 ,p=1; i < Inp_y.length; i++){

        if(i<thisRule.length){

            if(flag){

                $(Inp_y[i]).find("input").val(p*referInp_y);

            }else{

                $(Inp_y[i]).find("input").val(referInp_y);

            }

        }else{

            $(Inp_y[i]).find("input").val(" ");

        }


        p++;

    }
}

function showDiffvalue() {
    setRulershow_x();
    setRulershow_y();
    return;
}

function getReferIndex(){
    for(var i=0;i<thisRule.length;i++){
        if(thisRule[i].refer){
            return i;
        }
    }
}

function getRulerSize(hor_val,ver_val) {
    var rulers = [];

    var referIndex = getReferIndex();

    hor_val = parseFloat(hor_val);

    ver_val = parseFloat(ver_val);

    // console.log(hor_val,ver_val);

    isNaN(hor_val) ? hor_val = 0 : hor_val = hor_val;
    isNaN(ver_val) ? ver_val = 0 : ver_val = ver_val;

    for(var i = 0,p=referIndex; i < referIndex; i++){

        rulers.push({
            size: thisRule[i].size,
            rulerX: -p * hor_val,
            rulerY: p * ver_val
        });
        p--;
    }

    for(var i = referIndex,p=0; i < thisRule.length; i++){
        rulers.push({
            size:thisRule[i].size,
            rulerX:p*hor_val,
            rulerY:-p*ver_val
        });
        p++;
    }
    return rulers;
}

//传入水平和垂直的放码值==
function getPutSize33(isdelete,pathArr)
{

    if(!pathArr){
        var paths = $("#svgcontent > g:first-child").find("path[stroke=red]");
        pathArr = paths;
    }

    if(!pathArr || pathArr.length < 1){

        // console.log("难倒在这里返回了？")

        return;

    }

    // && thisTool != 'ratioPoint'

    if(thisTool != 'sliceRulerCopy' && thisTool != 'ratioPoint'){

        var pts = getPutSizePoint(pathArr,true);

    }

    // console.log(pts);


    var rulers

    var hor = $("#setRule_x").val();
    var ver = $("#setRule_y").val();
    rulers = getRulerSize(hor,ver);

    for(var i=0;i<pathArr.length;i++){
        var pathd;

        var pathId = $(pathArr[i]).attr("id");
        var attr1 = $(pathArr[i]).attr("attr_putStart");
        var attr2 = $(pathArr[i]).attr("attr_putEnd");

        // console.log("放码数据的存储和清除===",pathArr[i].id)
        if(isdelete) {
            if(attr1 == '0'){
                pathArr[i].removeAttribute("attr_startRulerX");
                pathArr[i].removeAttribute("attr_startRulerY");
            }
            if(attr2 == '0'){
                pathArr[i].removeAttribute("attr_endRulerX");
                pathArr[i].removeAttribute("attr_endRulerY");
            }
        }else{
            if(attr1 == '0'){
                $(pathArr[i]).attr({attr_startRulerX:hor,attr_startRulerY:ver});
            }
            if(attr2 == '0'){
                $(pathArr[i]).attr({attr_endRulerX: hor, attr_endRulerY: ver});
            }
        }

        if(attr1 == '0' && attr2 == '0'){


                for(var r=0;r<rulers.length;r++){
                    if(thisRule[r].refer){
                        continue;
                    }else{
                        var old_id = pathId+"_" + rulers[r].size;
                        var old_path = $("#"+old_id)[0];
                        $(old_path).attr("attr_putStart","0");


                        var old_startX = $(old_path).attr("attr_startRulerX");
                        var old_startY = $(old_path).attr("attr_startRulerY");
                        var new_startX = rulers[r].rulerX;
                        var new_startY = rulers[r].rulerY;

                        if(old_startX){

                            if(isdelete){
                                new_startX = - parseFloat(old_startX);
                                new_startY = -parseFloat(old_startY);

                                console.log("删除放码规则==",new_startX,new_startY);

                                $("#"+old_id)[0].removeAttribute("attr_startRulerX");
                                $("#"+old_id)[0].removeAttribute("attr_startRulerY");
                            }else{
                                new_startX = rulers[r].rulerX  - parseFloat(old_startX);
                                new_startY = rulers[r].rulerY  - parseFloat(old_startY);
                            }

                        }

                        pathd = getPutSizePath(old_path,new_startX,new_startY);

                        $("#"+old_id).attr({
                            d:pathd,
                            style:"display:inline",
                            "attr_startRulerX": rulers[r].rulerX,
                            "attr_startRulerY": rulers[r].rulerX,
                        });

                        old_path.removeAttribute("attr_putStart");
                    }


                }

                pathArr[i].removeAttribute("attr_putStart");


        }


        attr1 = $(pathArr[i]).attr("attr_putStart");
        attr2 = $(pathArr[i]).attr("attr_putEnd");

        for(var r=0;r<rulers.length;r++){

            if(thisRule[r].refer){
                continue;
            }else{
                // console.log(thisRule[r].refer)
                var RulerX, RulerY,
                    old_id = pathId+"_" + rulers[r].size,
                    old_path = $("#"+old_id)[0];

                RulerX   = rulers[r].rulerX;
                RulerY   = rulers[r].rulerY;

                if(attr1 == '0'){
                    var old_startX = parseFloat($(old_path).attr("attr_startRulerX"));
                    var old_startY = parseFloat($(old_path).attr("attr_startRulerY"));
                    $(old_path).attr({attr_putStart:'0',attr_startRulerX:rulers[r].rulerX,attr_startRulerY:rulers[r].rulerY});

                    if(old_startX){

                        if(isdelete){
                            RulerX = - parseFloat(old_startX);
                            RulerY = parseFloat(old_startY);

                            console.log("删除放码规则1==",RulerX,RulerY);

                            $("#"+old_id)[0].removeAttribute("attr_startRulerX");
                            $("#"+old_id)[0].removeAttribute("attr_startRulerY");
                        }else{
                            RulerX  = rulers[r].rulerX - old_startX;
                            RulerY  = rulers[r].rulerY - old_startY;
                        }

                    }
                }

                if(attr2 == '0'){
                    var old_endX = parseFloat($(old_path).attr("attr_endRulerX"));
                    var old_endY = parseFloat($(old_path).attr("attr_endRulerY"));
                    $(old_path).attr({attr_putEnd:"0",attr_endRulerX:rulers[r].rulerX,attr_endRulerY:rulers[r].rulerY});

                    if(old_endX){
                        if(isdelete){
                            RulerX = - parseFloat(old_endX);
                            RulerY = - parseFloat(old_endY);

                            console.log("删除放码规则2==",RulerX,RulerY);

                            $("#"+old_id)[0].removeAttribute("attr_endRulerX");
                            $("#"+old_id)[0].removeAttribute("attr_endRulerY");
                        }else{
                            RulerX  = rulers[r].rulerX - old_endX;
                            RulerY  = rulers[r].rulerY - old_endY;
                        }
                    }

                }

                pathd = getPutSizePath(old_path,RulerX,RulerY);

                $("#"+old_id).attr({
                    d:pathd,
                    // stroke:thisRule[r].color,
                    style:"display:inline"
                });

                if(isdelete && !$(pathArr[i]).attr("attr_startRulerX") && !$(pathArr[i]).attr("attr_endRulerX")){
                    $("#"+old_id).attr({"style":"display:none"});
                }

                old_path.removeAttribute("attr_putStart");
                old_path.removeAttribute("attr_putEnd");


            }

        }



        $(pathArr[i]).attr("stroke","#ffff33");
        pathArr[i].removeAttribute("attr_putStart");
        pathArr[i].removeAttribute("attr_putEnd");;
    }

}


function getPutSize(isdelete,pathArr){

    if(!pathArr){
        // var paths = $("#svgcontent > g:first-child").find("path[stroke=red]");
        var paths = getSelectElemArr();
        pathArr = paths;
    }

    if(!pathArr || pathArr.length < 1){

        return;

    }

    if(thisTool != 'sliceRulerCopy' && thisTool != 'ratioPoint'){

        var pts = getPutSizePoint(pathArr,true);

    }

    var rulers

    var Ruler = {
        x: parseFloat($("#setRule_x").val()),
        y: parseFloat($("#setRule_y").val())
    }

    var  judgePutRuler= function(elem,ruler,isdelete)
    {

        var attr1 = elem.getAttribute("attr_putStart");

        var attr2 = elem.getAttribute("attr_putEnd");

        var putRulerStart = {
            x: parseFloat(elem.getAttribute("attr_startRulerX")),
            y: parseFloat(elem.getAttribute("attr_startRulerY"))
        }

        var putRulerEnd = {
            x: parseFloat(elem.getAttribute("attr_endRulerX")),
            y: parseFloat(elem.getAttribute("attr_endRulerY"))
        }

        // console.log("这个是开始点历史放码量",putRulerStart);

        // console.log("这个是结束点历史放码量",putRulerEnd);

        if(attr1 == '0'){

            if(putRulerEnd.x){

                // console.log("=======放码开始点，但是结束点之前放过码，此时需要重新放码结束点========");

                elem.setAttribute("attr_putEnd",0);

            }

            if(isdelete){

                // console.log("进入删除模式，开始点不放码=======")

                elem.setAttribute("attr_startRulerX", 0);

                elem.setAttribute("attr_startRulerY", 0);

            }else {

                //判断 开始点已经放过码，线再度放码，所以以新的放码量为准，不累加
                elem.setAttribute("attr_startRulerX", (ruler.x));

                elem.setAttribute("attr_startRulerY", (ruler.y));
            }

        }

        if(attr2 == '0'){

            if(putRulerStart.x){

                elem.setAttribute("attr_putStart",0);

            }

            if(isdelete){

                elem.setAttribute("attr_endRulerX",0);

                elem.setAttribute("attr_endRulerY",0);

            }else {

                //开始点已经放过码，但是现在需要放的是结束点，所以把开始点放码标记上，并且将放码量存入

                elem.setAttribute("attr_endRulerX",(ruler.x));

                elem.setAttribute("attr_endRulerY",(ruler.y));

            }


        }



        return;

    }

    var putEverySize = function(elem,ruler,isold,isdelete)
    {
        var pathId  = elem.id;

        for(var r=0; r<ruler.length; r++)
        {
            if(thisRule[r].refer){

                continue;

            }

            var old_id = pathId+"_" + rulers[r].size;

            if(isold){

                if(elem.getAttribute("attr_putEnd") == '0'){

                    // console.log("接收到一个需要在放过码的基础上放码的路径====")

                    $("#"+old_id).attr("attr_putEnd","0");

                    pathd = getPutSizePath($("#"+old_id)[0],ruler[r].rulerX,ruler[r].rulerY);

                    document.getElementById(old_id).removeAttribute("attr_putEnd");

                }


            }else{

                pathd = getPutSizePath(elem,ruler[r].rulerX,ruler[r].rulerY);

            }


            $("#"+old_id).attr({
                d:pathd,
                style:"display:inline",
            });


            if(isdelete){

                var putRulerStart = {
                    x: parseFloat(pathArr[i].getAttribute("attr_startRulerX")),
                }

                var putRulerEnd = {
                    x: parseFloat(pathArr[i].getAttribute("attr_endRulerX")),
                }

                if((!putRulerStart.x || putRulerStart.x == '0') && (!putRulerEnd.x || putRulerEnd.x == '0')){

                    // console.log("======================两边都没有放码=1111111111111100000000000===");

                    $("#"+old_id).attr("style","display:none");

                }

            }

        }
        return;
    }

    for(var i=0;i<pathArr.length;i++){

        var pathd,putSize_x,putSize_y;

        judgePutRuler(pathArr[i],Ruler,isdelete);

        var attr1 = pathArr[i].getAttribute("attr_putStart");
        var attr2 = pathArr[i].getAttribute("attr_putEnd");

        // console.log("测试应该放码哪里=====",attr1,attr2);

        if(attr1 == '0' && attr2 == '0')
        {

            putSize_x = pathArr[i].getAttribute("attr_startRulerX");

            putSize_y = pathArr[i].getAttribute("attr_startRulerY");

            rulers = getRulerSize(putSize_x,putSize_y);

            pathArr[i].removeAttribute("attr_putEnd");

            // console.log("这里是两个点都要放码，先干掉开始点=====放码量：",rulers);

            putEverySize(pathArr[i],rulers,false,isdelete);

            pathArr[i].removeAttribute("attr_putStart");

            pathArr[i].setAttribute("attr_putEnd",'0');

            attr1=1;
        }

        if(attr1 == '0')
        {

            putSize_x = pathArr[i].getAttribute("attr_startRulerX");

            putSize_y = pathArr[i].getAttribute("attr_startRulerY");

            rulers = getRulerSize(putSize_x,putSize_y);

            // console.log("这里是放码开始点=====放码量：",rulers);

            putEverySize(pathArr[i],rulers,false,isdelete);

            pathArr[i].removeAttribute("attr_putStart");

        }

        if(attr2 == '0')
        {

            putSize_x = pathArr[i].getAttribute("attr_endRulerX");

            putSize_y = pathArr[i].getAttribute("attr_endRulerY");

            rulers = getRulerSize(putSize_x,putSize_y);

            // console.log("这里是放码结束点=====放码量：",rulers);

            if(attr1==1){

                putEverySize(pathArr[i],rulers,true,isdelete);

            }else{

                putEverySize(pathArr[i],rulers,false,isdelete);

            }

            pathArr[i].removeAttribute("attr_putEnd");

        }


    }

}

//或许选中路径的放码规则
function getPathPutRuler(pathArr){

    if(pathArr.length<2){

        return;

    }

    var rulers = [];
    if(pathArr.length == 1){

        rulers.push({
            rulerX:$(pathArr[0]).attr("attr_startRulerX"),
            rulerY:$(pathArr[0]).attr("attr_startRulerY"),
        });

    }else{
        for(var i=0; i<pathArr.length; i++)
        {

            for (var j = i+1 ; j < pathArr.length ; ++j)
            {
                if (i != j)
                {

                    var path1 = extendPath(pathArr[i],false,8);

                    var path2 = extendPath(pathArr[j],false,8);

                    var rt = Raphael.pathIntersection(path1 , path2)[0];

                    console.log(rt)

                    if(!rt){

                        // console.log("就没有进入判断端点的模式")

                        var pathdata1 = getPointData(pathArr[i]);

                        var pathdata2 = getPointData(pathArr[j]);

                        if(isEqual(pathdata1.start,pathdata2.start) || isEqual(pathdata1.start,pathdata2.end)){

                            // console.log("拿到数据没有啊啊start",rt)
                            rt = pathdata1.start;

                        }else if(isEqual(pathdata1.end,pathdata2.start) || isEqual(pathdata1.end,pathdata2.end)){

                            rt = pathdata1.end;

                            // console.log("拿到数据没有啊啊end",rt);


                        }

                    }


                    if(rt){

                        addPointCircle(rt,"#rulerMarkgroup");

                        var cp = closestPoint(pathArr[i],rt).length;

                        var pathLength = pathArr[i].getTotalLength() / 2;

                        // console.log("是不是这里没出来啊==",cp,pathLength);

                        if(cp < pathLength){

                            if($(pathArr[i]).attr("attr_startRulerX")){
                                rulers.push({
                                    rulerX:$(pathArr[i]).attr("attr_startRulerX"),
                                    rulerY:$(pathArr[i]).attr("attr_startRulerY"),
                                });
                            }

                        }else{

                            // console.log("是不是不能来到这里啊：这里是终点放码====");

                            if($(pathArr[i]).attr("attr_endRulerX")){
                                rulers.push({
                                    rulerX:$(pathArr[i]).attr("attr_endRulerX"),
                                    rulerY:$(pathArr[i]).attr("attr_endRulerY"),
                                });
                            }

                        }

                    }

                }
            }


        }
            if(thisTool == 'copyPointRuler'){
                PathColor(pathArr[i],false,'#0f0');
            }
    }


    // console.log("这个是获取到的放码规则======================",rulers)
    return rulers;

}

function normalizeVector(rawVec)
{
    var distance = Math.sqrt(rawVec.x * rawVec.x + rawVec.y * rawVec.y);
    return {x : rawVec.x / distance , y : rawVec.y / distance};
}

function dotVector(vec0 , vec1)
{
    return vec0.x * vec1.x + vec0.y * vec1.y;
}

function distancePoint(vec0 , vec1)
{
    return Math.sqrt((vec0.x - vec1.x) * (vec0.x - vec1.x) + (vec0.y - vec1.y) * (vec0.y - vec1.y));
}

function getIncircleCenter(pointA , pointB , pointC , dstPoint)
{
    var ba = normalizeVector({x : pointB.x - pointA.x , y : pointB.y - pointA.y});
    var ca = normalizeVector({x : pointC.x - pointA.x , y : pointC.y - pointA.y});

    var cd = normalizeVector({x : (ba.x + ca.x) * 0.5 , y : (ba.y + ca.y) * 0.5});

    var t = (1 - dotVector(ba , ca)) * 0.5;

    var A = (cd.x * cd.x + cd.y * cd.y) * (1 - t);
    var B = 2.0 * (cd.x * pointA.x + cd.y * pointA.y - cd.x * dstPoint.x - cd.y * dstPoint.y);
    var C = (pointA.x - dstPoint.x) * (pointA.x - dstPoint.x) + (pointA.y - dstPoint.y) * (pointA.y - dstPoint.y);

    var x = (-B + Math.sqrt(B * B - 4.0 * A * C)) / (2.0 * A);

    if (x < 0.0)
    {
        x = (-B - Math.sqrt(B * B - 4.0 * A * C)) / (2.0 * A);
    }

    return {x : pointA.x + cd.x * x , y : pointA.y + cd.y * x};
}

function testFunc()
{
    var dstPoint = {x : 1 , y: 1};
    var cen = getIncircleCenter({x: 0.0 , y: 0.0} , {x : 1.0 , y : 0.0} , {x : 0.0 , y : 1.0} , dstPoint);

    var radius = distancePoint(cen , dstPoint);
    // console.log(cen);

    console.log('radius: ' + radius);
}