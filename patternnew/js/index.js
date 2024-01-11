$(function(){
    addlisterIE();
})

window.onresize = colsureJ(function(){
    console.log("窗口大小改变")
    addlisterIE();
},200);
// 300~500
function colsureJ(fn,time){		//闭包    节流
    var timer;
    return function(){
        clearTimeout(timer);
        timer = setTimeout(fn,time);
    }
}
var isIE = function() {
    var userAgent = navigator.userAgent;
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return 'IE';
    else if (userAgent.indexOf("Edge") > -1) {
        return "Edge";
    }
    else {
        return false;
    }

}

var isScroll = function (el) {
    // test targets
    var elems = el ? [el] : [document.documentElement, document.body];
    var scrollX = false, scrollY = false;
    for (var i = 0; i < elems.length; i++) {
        var o = elems[i];
        var st = o.scrollTop;
        o.scrollTop += (st > 0) ? -1 : 1;
        o.scrollTop !== st && (scrollY = scrollY || true);
        o.scrollTop = st;
    }
    // ret
    return scrollY;
};

function addlisterIE()
{
    var isIe = isIE();

    if(isIe)
    {
        var obj = document.getElementById('sidepanels');

        if(isScroll(obj)) {

            switch (isIe)
            {
                case 'Edge':
                    $(obj).css({width: '162px'});
                    break;

                case 'IE':
                    $(obj).css({width: '167px'});
                    break;
            }

        }else{

            $(obj).css({width: '152px'});

        }
    }
    return;
}

function mouseEvent(){
        $(this).css({backgroundColor:"#535353"})
    }

$(".toolbar").find(".toolbar_tool").mouseover(mouseEvent());

 $("#ext-panning").addClass("toolLeft_list");

 $("#editor_panel .toolLeft_list").click(function(){
     $(".toolbar .toolbar_tool,#editor_panel .toolLeft_list").removeClass("tool_button_selected");
     $(this).addClass("tool_button_selected");
 });

    //设置一个全局的变量，存储当前使用的工具
    var thisTool = "tool_path";

    $(".toolbar .toolbar_tool,.toolLeft_list,.submit_button").on("click",function(){
        toolClick(this.id)
    });

    var toolClick = function(thisId)
    {
        $("#pointLineGroup").children().remove();

        $(".toolbar .toolbar_tool,#editor_panel .toolLeft_list,.submit_button").removeClass("tool_button_selected");
        $("#"+thisId).addClass("tool_button_selected");

        if($("#svgcontent #pointLineGroup").length < 1){
            var nodeG = document.createElementNS(svgNS,"g");
            nodeG.setAttribute("id","pointLineGroup");
            $("#svgcontent").append(nodeG);
        }

        publicCount = 0;
        idnum = 0;
        count = false;
        //点击新的功能时，先还原之前的数据以及操作；
        toolRestoreTool(thisTool);

        //恢复颜色
        recoverColor();

        // var thisId = $(this).attr("id");
        if(thisId){
            thisTool = thisId;
            console.log(thisTool);
            toolInitialization(thisTool);
        }
        return;
    }



    $("#ext-panning").click(function(){
        $(".toolbar .toolbar_tool,#editor_panel .toolLeft_list").removeClass("tool_button_selected");
        $(this).addClass("tool_button_selected");
    });


    $(".toolbarWrap").mouseenter(function(){
        $(this).find(".toolCover").slideUp(200);
    })
    $(".toolbarWrap").mouseleave(function(){
        $(this).find(".toolCover").slideDown(200);
    })



    $(".closePop").click(function(){
        $("#Fun_main > div > div").html("");
        $("#PopupBox").hide();
        if($("#PointMarkerGroup")){
            $("#PointMarkerGroup").remove();
        }
        $("#svgroot").unbind("mousemove");
    })
    $(".exportRuleClose").click(function(){
        $("#exportRuleTable").hide();
    })

$("#elementAttr  .eleAttrBtn input[type=button]").click(function(){
    $(this).siblings().removeClass("selected");
    $(this).addClass("selected");
})


function ratioChange()
{
    if($("#kMark_ratio").val()> 1){
        alert("输入不合法，请输入0-1的比例值！");
        $("#kMark_ratio").val("0");
    }
}
function cutNumChange()
{
    var cutNum = $("#cutPartNum").val();
    if(cutNum%2 != 0){
        if($("#symmetryCut").is(':checked')) {
            $("#symmetryCut").attr("checked",false);
        }
    }
}
function ISsymmetry()
{
    var cutNum = parseInt($("#cutPartNum").val());
    if($("#symmetryCut").is(':checked')) {
        if(cutNum%2 != 0) {
            $("#cutPartNum").val(2);
        }
    }
}
function confirmAddTxt()
{
    $("#PopupBox").hide();

    var txt = $("#textInp").val();
    var fontSize = $("#fontHeight").val();
    var textPathId = $("#textGroup path:last-child").attr("id");

    var text = document.createElementNS(svgNS, 'text');
    svgedit.utilities.assignAttributes(text, {
        id:"text_"+textPathId.split("_")[1],
        'style' : 'text-anchor:start;fill:red;font-size:12px;pointer-events:none'
    });
    $("#textGroup").append(text);

    $(text).attr({style:"fill:red;font-size:"+fontSize+"px;"})

    var textPath = document.createElementNS(svgNS, 'textPath');
    svgedit.utilities.assignAttributes(textPath, {
        id: 'path_temp_curve_text',
        'xlink:href' : '#'+textPathId,
        'startOffset' : '50%'
    });

    textPath.textContent = txt;
    text.appendChild(textPath);

    $("#"+textPathId).attr("style","display:none")
    return;
}
function giveUpTxt()
{
    $("#textGroup").find("path:last-child").remove();
    return;
}
    
//初始化侧边栏功能
function toolInitialization(tool)
{
    switch (tool){
        //顶部工具栏
        case "ImportSvg":

            if($("#ImportGroup").length < 1)
            {
                var ImportG = document.createElementNS(svgNS,'g')
                ImportG.setAttribute("id","ImportGroup");
                $("#svgcontent g:first-child").append(ImportG);
            }

            break;

        case "delete_entity":

            $("#Fun_name").html("删除");
            $("#steps").html("请选择（点选或者框选）需要删除的对象,右键确认");

            break;

        case "FullScreen":

            console.log(svgCanvas.getCanvasScale());

            // svgCanvas.updateCanvas(640,480);
            // svgCanvas.transformCanvas(null,0,0,0,false,false,true);
            var old_x = parseFloat($("#svgcontent").attr("x"));
            var old_y = parseFloat($("#svgcontent").attr("y"));
            console.log("什么鬼啊===",(old_x - 640),(old_y - 480))
            // svgCanvas.transformCanvas(null , (old_x + 640) , (old_y - 480) , 0 , false);

            break;

        case "tool_upload":
        {
            svgCanvas.submitToServer();
        }
            break;

        //侧边栏
        case "onmovePoint":
            $("#Fun_name").html("端移动");
            $("#steps").html("1.请点击选择需要移动的端点！");
            break;
        case "parallel":

            $("#parallelInp").siblings().hide();
            $("#parallelInp").show();
            var nodeG;
            if($("#svgcontent #pointLineGroup").length < 1){
                nodeG = document.createElementNS(svgNS,"g");
                nodeG.setAttribute("id","pointLineGroup");
                $("#svgcontent").append(nodeG);
            }
            addhtmltoExplicate({ title:"平行线", step:"1.请首先填写距离以及选择方向，然后点击选择参考线，默认正方向！"})
            // addListenerOnPathClick();
            // SvgrootMousedown();
            break;

        case "AngleLine":
            $("#angleLineInp").siblings().hide();
            $("#angleLineInp").show();
            $("#Fun_name").html("角度线");
            $("#steps").html("1.请选择参考要素！");
            // addListenerOnPathClick();
            // SvgrootMousedown();
            break;

        case "DoubleCompass":
            $("#DoubleCompassInp").siblings().hide();
            $("#DoubleCompassInp").show();
            $("#Fun_name").html("双圆规");
            $("#steps").html("1.1.请在画布上点击选择两个起点！");
            // SvgrootMousedown();
            break;

        case "incircle":
            $("#Fun_name").html("内切圆");
            $("#steps").html("请选择参与内切圆绘制的两条要素...");
            break;

        case "setEleAttr":
            $("#Fun_name").html("设置要素属性");
            $("#steps").html("请选择目标要素，并在属性框中选好属性，右键结束操作");
            $("#elementAttr").show();
            break;

        case "getCutParts":

            $("#Fun_name").html("裁片提取");
            $("#steps").html("1.请依次选择裁片净边要素，右键结束！");

            $("#HemWidthInp").siblings().hide();
            $("#HemWidthInp").show();

            if($("#svgcontent #cutpartsgroup").length<1) {
                var nodeG =  document.createElementNS(svgNS,"g");
                nodeG.setAttribute("id","cutpartsgroup");
                $("#svgcontent > g:first-child").append(nodeG);
            }

            if($("#cutpartsgroup #cutpartsgroupList").length<1) {
                var nodeG =  document.createElementNS(svgNS,"g");
                nodeG.setAttribute("id","cutpartsgroupList");
                $("#cutpartsgroup").append(nodeG);
            }

            if($("#svgcontent #ClosedPathGroup").length<1){
                var nodeG =  document.createElementNS(svgNS,"g");
                nodeG.setAttribute("id","ClosedPathGroup");
                nodeG.setAttribute("style","display:none");
                $("#cutpartsgroup").append(nodeG);
            }

            if($("#svgcontent #WovenDesigngroup").length<1){
                var nodeG =  document.createElementNS(svgNS,"g");
                var nodeG2 =  document.createElementNS(svgNS,"g");
                var nodeM = document.createElementNS(svgNS,"defs");
                nodeG.setAttribute("id","WovenDesigngroup");
                nodeG2.setAttribute("id","curPartAttr");
                $("#cutpartsgroup").append(nodeG);
                $("#WovenDesigngroup").append(nodeM);
                $("#WovenDesigngroup").append(nodeG2);
            }

            if($("#svgcontent #HemGroupList").length<1){
                var nodeG =  document.createElementNS(svgNS,"g");
                nodeG.setAttribute("id","HemGroupList");
                $("#cutpartsgroup").append(nodeG);
            }
            break;

        case "AttrDefinition":

            $("#Fun_name").html("裁片属性定义");

            $("#steps").html("请在裁片内部点击绘制布纹线");

            if($("#svgcontent #WovenDesigngroup").length < 1){
                nodeG = document.createElementNS(svgNS,"g");
                nodeG2 = document.createElementNS(svgNS,"g");
                nodeM = document.createElementNS(svgNS,"defs");
                nodeG.setAttribute("id","WovenDesigngroup");
                nodeG2.setAttribute("id","curPartAttr");
                $("#svgcontent").append(nodeG);
                $("#WovenDesigngroup").append(nodeG2);
                $("#cutpartsgroup").append(nodeM);
            }
            // setCutPartAttr();

            break;

        case "RefreshHem":

            $("#Fun_name").html("缝边刷新");
            $("#steps").html("正在刷新缝边....");

            break;

        case "changeHemWidth":
            $("#Fun_name").html("修改缝边宽度：");
            $("#steps").html("请先输入需要修改的缝边宽，再点选要修改的净边");
            $("#changeHemWidthInp").siblings().hide();
            $("#changeHemWidthInp").show();
            break;

        case "showHemWidth":
            $("#Fun_name").html("显示缝边宽");
            $("#steps").html("1.显示缝边宽度，单位是像素");
            showHemWidth();
            break;

        case "deleteHem":
            $("#Fun_name").html("删除缝边");
            $("#steps").html("1.请点击需要删除缝边的裁片内部，选择需要删除的缝边");
            // SvgrootMousedown();
            break;

        case "CheckTogether":
            $("#Fun_name").html("拼合检查");
            $("#steps").html("1.请选择拼合检查的第一组路径，在空白处右键结束选择！")

        case "knifeMark":
            count == true;
            $("#knifeMarkInp").siblings().hide();
            $("#knifeMarkInp").show();
            $("#Fun_name").html("刀口标记");
            $("#steps").html("\"普通刀口：请在顶部输入长度或者比例，点击选择需要标记的要素的<span style='color: #2e5dea;font-size: 14px;'>起点端</span>； 要素刀口：请<span style='color: #2e5dea;font-size: 14px;'>先选择刀口要素</span>、再选择方向参考要素！不要多选！\"})");
            $(this).removeClass("disabled");
            if($("#svgcontent #knifeMarksgroup").length < 1){
                var nodeG = document.createElementNS(svgNS,"g");
                nodeG.setAttribute("id","knifeMarksgroup");
                $("#svgcontent").append(nodeG);
            }
            // addListenerOnPathClick();
            break;

        case "alterKMark":
            KMarkLineColor();
            break;

        case "textClick":
            var nodeG,nodedefs;
            if($("#svgcontent #pointLineGroup").length < 1){
                var nodeG2;
                nodeG2 = document.createElementNS(svgNS,"g");
                nodeG2.setAttribute("id","pointLineGroup");
                $("#svgcontent").append(nodeG2);
            }
            if($("#svgcontent #textGroup").length<1){
                nodeG = document.createElementNS(svgNS,"g");
                nodedefs = document.createElementNS(svgNS,"defs");
                nodeG.setAttribute("id","textGroup");
                $("#svgcontent").append(nodeG);
                $("#textGroup").append(nodedefs);
            }
            addText();
            break;
        case "everyText":
            var nodeG,nodedefs;
            if($("#svgcontent #pointLineGroup").length < 1){
                var nodeG2;
                nodeG2 = document.createElementNS(svgNS,"g");
                nodeG2.setAttribute("id","pointLineGroup");
                $("#svgcontent").append(nodeG2);
            }
            if($("#svgcontent #textGroup").length<1){
                nodeG = document.createElementNS(svgNS,"g");
                nodedefs = document.createElementNS(svgNS,"defs");
                nodeG.setAttribute("id","textGroup");
                $("#svgcontent").append(nodeG);
                $("#textGroup").append(nodedefs);
            }

            addText();
            break;

        case "ele_Length":
            $("#Fun_name").html("要素长度测量：");
            $("#steps").html("请选择需要测量的要素");
            break;

        case "twoPoints_length":
            $("#Fun_name").html("两点测量：");
            $("#steps").html("1.请左键点击选择起点,移动鼠标到需要测量的终点");
            getTwoPointsLength();
            break;

        case "eleTwo_length":
            $("#Fun_name").html("要素上的两点测量：");
            $("#steps").html("请选择需要测量的要素");
            break;

        case "moveCutpart":
            $("#Fun_name").html("移动裁片");
            $("#steps").html("请在<span style='color: #2e5dea;font-size: 14px;'>裁片内部</span>点击选择要移动的裁片，右键结束");
            break;

    //        以下为推板
        case "setSize":
            $("#PopupBox").show();
            $("#setSizetable").siblings().hide();
            $("#setSizetable").show();
            break;

        case "RuleModification":
            $("#Fun_name").html("修改规则");

            if($("#svgcontent").find("#rulerMarkgroup").length < 1){

                var NodeG = document.createElementNS(svgNS,"g");

                NodeG.setAttribute("id","rulerMarkgroup");

                $("#svgcontent").append(NodeG);

            }

            var putGroup = $("#putSizegroupList").find("g");
            for(var i=0; i<putGroup.length; i++){

                var paths = $(putGroup[i]).find("path");
                for(var j = 0;j<paths.length;j++){
                    if($(paths[j]).attr('transform')){
                        $(paths[j]).removeAttr('transform');
                    }
                }

            }
            $("#steps").html("请在框选需要放码的点");
            break;

        case "deletePutSize":
            $("#rulerMarkgroup").children().remove();
            $("#Fun_name").html("删除放码规则");
            $("#steps").html("请点击选择<span style='color: #2e5dea;font-size: 14px;'>需要删除</span>放码规则地点，右键结束");
            break;

        case "copyPointRuler":

            $("#rulerMarkgroup").children().remove();
            $("#copyRulerCheck").show();
            $("#Fun_name").html("点规则拷贝");
            $("#steps").html("请点击选择<span style='color: #2e5dea;font-size: 14px;'>已经放过码的点（一个点）</span>,右键结束");

            break;

        case "ratioPoint":
            $("#rulerMarkgroup").children().remove();
            $("#Fun_name").html("两点比例放缩");
            $("#steps").html("请框选<span style='color: #2e5dea;font-size: 14px;'>目标放码点</span>");
            break;

    }
    return;
}


//在使用新功能前，清除之前的数据
function toolRestoreTool()
{
    switch (thisTool){

        case "getCutParts":
            // recoverColor();
            break;

        case "setEleAttr":
            $("#elementAttr").hide();
            break;
        case "alterKMark":
            var KMarks = $("#knifeMarksgroup").find("line");
            KMarks.unbind("mouseenter")
            KMarks.unbind("mouseleave")
            break;
        case "ratioPoint":
            var putPath = $("#svgcontent").find("path[attr_putsize='0']");

            for(var i=0;i<putPath.length;i++){

                putPath[i].removeAttribute("attr_putsize");

            }

            break;

        case "copyPointRuler":
            $("#copyRulerCheck").hide();
            break;
        case "sliceRulerCopy":
            $("#symmetricTransform").hide();
            break;
        case "AngleLine":

            var paths = $("#svgcontent g:first-child path[stroke=red]");

            if(paths.length>0){

                for(var i=0;i<paths.length;i++){

                    PathColor(paths[i]);

                }

            }

            break;

        case "RuleModification":
            $("#rulerMarkgroup").remove();
            break;
    }
}

function PathColor(mouse_target,pt,color)
{

        if(!mouse_target || mouse_target.id.split("_")[0] == 'WovenDesign' || mouse_target.id.split("_")[0] == 'Hem'){
            // console.log("为什么不可以呢？======",mouse_target)
            return;
        }

        var defalutAttr = $(mouse_target).attr("_attrColor");
        var defalutC = mouse_target.getAttribute("stroke");

        // console.log(defalutC)

        var pathColor = 'red';

        if(color){
            pathColor = color;
        }

        if(defalutC == '#ff2a21'){
            console.log("收到一条框选的线");
        }

        if(defalutC != pathColor){
            if(defalutAttr){
                $(mouse_target).attr({stroke:pathColor});
            }else{
                $(mouse_target).attr({stroke:pathColor,"_attrColor":defalutC});
            }

            if(pt){
                $(mouse_target).attr({"attr_ptx":pt.x,"attr_pty":pt.y});
            }
        }else{
            if(defalutAttr){
                $(mouse_target).attr({stroke:defalutAttr});
            }else{
                $(mouse_target).attr({stroke:"#fff"});
            }
            mouse_target.removeAttribute("_attrColor");
            mouse_target.removeAttribute("attr_ptx");
            mouse_target.removeAttribute("attr_pty");
        }




    }

function recoverColor()
{
    console.log("恢复颜色====");

    var redpath = $("#svgcontent g:first-child path[stroke=red]");

    for(var i=0;i<redpath.length;i++)
    {
        PathColor(redpath[i]);
        redpath[i].removeAttribute("_attribute");
    }

    var selectenElems = $("#svgcontent g:first-child path[stroke='#ff2a21']");

    var selectenElemArr = new Array();

    for(var i=0;i<selectenElems.length;i++)
    {
        selectenElemArr.push(selectenElems[i])
    }

    svgCanvas.removeFromSelection(selectenElemArr);

    return;
}

//    获取点击得到的路径
function getSelectElemArr()
{
    var paths;

    paths = $("#svgcontent g:first-child path[stroke='#ff2a21'],#svgcontent g:first-child path[stroke=red]");

    return paths;
}

function KMarkLineColor(evt)
    {
    if(thisTool != "alterKMark"){
        return;
    }

    var KMarks = $("#knifeMarksgroup").find("line");

    KMarks.on("mouseenter click",function(evt){
        $(this).css({"stroke":"#f00","fill":"#f00"});
    });

    KMarks.on("mouseleave",function(evt){
        $(this).css({"stroke":"#f90","fill":"#f90"});
    });

    var mark = 0,de;
    KMarks.on("mousedown",function(evt) {
        $(this).css({"stroke":"#093","fill":"#093"});
        KMarks.unbind("mouseenter mouseleave  click");
        mark = evt.target;
        de = mark.id;

        $(document).on("keydown",function(evt){

            evt = evt||event;

            var currKey=evt.keyCode||evt.which||evt.charCode;

            switch (currKey){
                case 17:
                    deleteKnifeMark(mark);
                    $(document).unbind("keydown");
                    break;
                case 46:
                    console.log("你是在怎么执行啊啊啊");
                    $("#"+de).remove();
                    $(document).unbind("keydown");
                    KMarkLineColor();
                    break;
            }
        });

    });
    return;
}

//传入弹窗的ID
function closeThisbox(id)
{

    $("#"+id).hide();

    switch (id){
        case "offsetInp":
            $("#mousepoint").remove();
            break;
        case 'setSizeRuleTable':
            recoverColor();
            break;
    }

}

function confirmgetPoint()
{
        $("#offsetInp").hide();
}

    //放码部分
$("#tool_userMode").find(".UserMode").click(function(){

    var num = $(this).index();

    var thisPart = $("#sidepanelsList").find(".sidepanelsItem").eq(num);

    $(thisPart).siblings().hide();

    $(thisPart).show();

    $(this).siblings().removeClass("ModeSelected");

    $(this).addClass("ModeSelected");

        // console.log(this.id)

    switch (thisPart[0].id){

        case "ClothesHit":
            addlisterIE();
            toolClick('tool_path');
            svgCanvas.setMode('path')

            $("#rulerShow_bottom").hide();
            $("#HemGroupList").show();

            $("#putSize_HemGroup").show();
            $("#putSize_WovenDesign").show();


            if($("#putSizegroupList").find("g").length > 0){

                    var putGroup = $("#putSizegroupList").find("g");

                    for(var i=0; i<putGroup.length; i++){

                        var paths = $(putGroup[i]).find("path[class='cutPath']");

                        disposeCutPaths(paths,true);

                        disposeCutpath(paths);

                        getHem(paths,putGroup[i]);

                        for(var j = 0;j<paths.length;j++)
                        {
                            if($(paths[j]).attr('transform')){
                                $(paths[j]).removeAttr('transform');
                            }
                        }
                    }
                }

                break;

        case "ClothesPush":
            addlisterIE();

            toolClick('RuleModification');

            $("#HemGroupList").hide();

            $("#putSize_HemGroup").hide();

            getRulerColor("RuleA");

            if($("#svgcontent").find("#putSizeLayer").length < 1){

                var NodeG = document.createElementNS(svgNS, "g")
                NodeG.setAttribute("id", "putSizeLayer");
                $("#svgcontent > g:first-child").append(NodeG);

            }


            if($("#svgcontent").find("#putSizegroup").length < 1) {

                //全部放码的要素
                var NodeG = document.createElementNS(svgNS, "g")
                NodeG.setAttribute("id", "putSizegroup");
                $("#svgcontent > g:first-child").append(NodeG);

                //放码得到的裁片
                var NodeG2 = document.createElementNS(svgNS, "g")
                NodeG2.setAttribute("id", "putSizegroupList");
                $("#putSizegroup").append(NodeG2);

                //放码得到的裁片的布纹线
                // var NodeG3 = document.createElementNS(svgNS, "g")

                if($("#putSizegroup").find("#putSize_WovenDesign").length <1){

                    var NodeG3 = document.createElementNS(svgNS, "g");
                    NodeG3.setAttribute("id", "putSize_WovenDesign");
                    NodeG3.setAttribute("style", "display:none");
                    $("#putSizegroup").append(NodeG3);

                    var NodeG4 = document.createElementNS(svgNS, "g")
                    NodeG4.setAttribute("id", "curPartAttr_putsize");
                    $(NodeG3).append(NodeG4);

                    var nodeDefs = document.createElementNS(svgNS, "defs");
                    $(NodeG3).append(nodeDefs);

                }


                //放码得到的裁片的缝边
                var NodeG5 = document.createElementNS(svgNS, "g")
                NodeG5.setAttribute("id", "putSize_HemGroup");
                $("#putSizegroup").append(NodeG5);

                var NodeG6 = document.createElementNS(svgNS, "g")
                NodeG6.setAttribute("id", "putSize_HemSupplementgroup");
                $(NodeG5).append(NodeG6);

            }

            var CutColor;

            var groups = $("#cutpartsgroupList g");

            var Wpaths = $("#WovenDesigngroup > path");

            // console.log("this is WPaths====",Wpaths)

            var LayerPaths = $("#svgcontent > g:first-child > path");

            for(var i=0;i<thisRule.length;i++){

                if(thisRule[i].refer){
                    CutColor = thisRule[i].color;
                    continue;
                }
                else {

                    //裁片线
                    for (var j = 0; j < groups.length; j++) {

                        var gg = groups[j].id;

                        if ($("#putSizegroupList").find("#" + gg + "_" + thisRule[i].size).length < 1) {

                            // var NodeG1 = document.createElementNS(svgNS, "g");
                            var NodeG1 = $(groups[j]).clone();

                            NodeG1.attr("id", gg + "_" + thisRule[i].size);

                            NodeG1.attr("class", "cutPart_" + thisRule[i].size);

                            $("#putSizegroupList").append(NodeG1);

                            var paths = $(NodeG1).find("path");

                            // console.log("find cutpaths======",paths);

                            for (var k = 0; k < paths.length; k++) {

                                var newId = $(paths[k]).attr("id") + "_" + thisRule[i].size;

                                $(paths[k]).attr({
                                    id: newId,
                                    stroke: thisRule[i].color,
                                    style: "display:none"
                                });

                                if(paths[k].getAttribute("class") == 'insidePath')
                                {
                                    paths[k].setAttribute("stroke","#ffffff");
                                }

                            }

                        }

                    }

                    //布纹线
                    for (var j = 0; j < Wpaths.length; j++) {

                        var newWid = $(Wpaths[j]).attr("id") + "_" + thisRule[i].size;

                        if($(NodeG3).find("#"+newWid).length < 1){

                            var newWpath = $(Wpaths[j]).clone();

                            $(newWpath).attr({id: newWid,style:"marker-end:url(#Arrow_0_"+thisRule[i].size+")"});

                            $(NodeG3).append(newWpath);

                            var markNode = $("#WovenDesigngroup defs marker").clone()

                            markNode[0].setAttribute("id",markNode[0].id+"_"+thisRule[i].size);

                            $(nodeDefs).append(markNode);

                        }

                    }

                    if ($("#putSizeLayer").find("#Layer_" + thisRule[i].size).length < 1) {

                        var NodeLayerG = document.createElementNS(svgNS, "g");

                        NodeLayerG.setAttribute("id", "Layer_" + thisRule[i].size);

                        $("#putSizeLayer").append(NodeLayerG);

                        for (var j = 0; j < LayerPaths.length; j++) {

                            var newWpath = $(LayerPaths[j]).clone();

                            var newLid = $(LayerPaths[j]).attr("id") + "_" + thisRule[i].size;

                            $(newWpath).attr({id: newLid, style: "display:none"});

                            $(NodeLayerG).append(newWpath);

                        }

                    }


                }
                /*if(thisRule[i].refer){
                    CutColor = thisRule[i].color;
                }*/
            }

            var cutPaths = $("#cutpartsgroupList .cutpartgroup").find("path[class=cutPath]");

            for(var i = 0; i<cutPaths.length; i++){
                $(cutPaths[i]).attr("stroke",CutColor);
            }

            drawBottomShow();
            $("#rulerShow_bottom").show();

            setTableSize();

            break;
    }

});

//初始化放码规则弹出框
function setTableSize(clear){

    var sizebox = $(".putSize_size");
    if(clear){
        $("#setRule_x").val("");

        $("#setRule_y").val("");

        for (var i = 0; i < sizebox.length; i++) {

            if (i < thisRule.length) {

                var tdInps = $(sizebox[i]).parent("tr").find("td input");

                if (thisRule[i].refer) {

                    for (var k = 0; k < tdInps.length; k++) {

                        tdInps[k].value = "0";

                    }

                } else {

                    for (var k = 0; k < tdInps.length; k++) {

                        tdInps[k].value = " ";

                    }

                }


            }


        }

    }
    else{
        for (var i = 0; i < sizebox.length; i++) {

            if (i < thisRule.length) {

                var tdInps = $(sizebox[i]).parent("tr").find("td input");

                if (thisRule[i].refer) {

                    sizebox[i].innerHTML = thisRule[i].size + "(标)";

                    $(tdInps).css({"background-color": "#ffc8c8"});


                    for (var k = 0; k < tdInps.length; k++) {

                        tdInps[k].value = "0";

                        $(tdInps[k]).parent("td").addClass("refer_inp")

                    }

                } else {

                    sizebox[i].innerHTML = thisRule[i].size;

                    $(tdInps).css({"background-color": "#ffffe0"});

                    for (var k = 0; k < tdInps.length; k++) {

                        tdInps[k].value = " ";

                        $(tdInps[k]).parent("td").removeClass("refer_inp");

                    }

                }


            } else {

                sizebox[i].innerHTML = " ";

                var tdInps = $(sizebox[i]).parent("tr").find("td input");

                $(tdInps).css({"background-color": "#ffffe0"});

                for (var k = 0; k < tdInps.length; k++) {

                    tdInps[k].value = " ";

                    $(tdInps[k]).parent("td").removeClass("refer_inp");

                }

            }


        }
    }

}

$("#rulerList .setRule_criterion").click(function(){

        $(".setRule_criterion").removeClass("selectedRule");

        $(this).addClass("selectedRule");
    })

    //设置放码规则
var thisRule = [];//存储放码时的尺寸颜色

$("#setSizeCir").click(function(evt){

    $("#setSizetable").hide();
    var ind = $("#rulerList").find(".selectedRule").index();

    var num;
    switch (ind){
            case 1:
                num="A";
                break;
            case 2:
                num="B";
                break;
            case 3:
                num="C";
                break;
            case 4:
                num="D";
                break;
            case 5:
                num="E";
                break;
        }

    getRulerColor("Rule"+num)
    drawBottomShow();
});

function getRulerColor(rulerClass){
        thisRule.splice(0,thisRule.length);
        var rulerArr = $("."+rulerClass);
        // console.log(rulerArr);
        for(var i=0;i<rulerArr.length;i++){

            var Size = $(rulerArr[i]).find("input").val();

            if(i==6){
                // console.log(rulerArr[i])

                var Color = $(rulerArr[i]).parent("tr").find("td:first-child").find("input").val();

                thisRule.push({size:Size,color:Color,refer:1});

            }else{
                if(Size != ""){

                    var Color = $(rulerArr[i]).parent("tr").find("td:first-child").find("input").val();

                    thisRule.push({size:Size,color:Color});

                }
            }

        }
        return;
    }

$(".boxMove").mousedown(function(evt){

    var parentNode = $(this).parent();

    var old_left = evt.pageX;
    var old_top = evt.pageY;

    var old_position_left = $(parentNode).position().left;
    var old_position_top = $(parentNode).position().top;

    $(document).mousemove(function(evt){

        var new_left = evt.pageX;
        var new_top = evt.pageY;

        var change_x = new_left - old_left;
        var change_y = new_top - old_top;

        var new_position_left = old_position_left + change_x;
        var new_position_top = old_position_top + change_y;

        if(new_position_top<0){
            new_position_top=0;
        }
        if(new_position_top>$(document).height()-$(parentNode).height()){
            new_position_top=$(document).height()-$(parentNode).height();
        }
        if(new_position_left>$(document).width()-$(parentNode).width()){
            new_position_left=$(document).width()-$(parentNode).width();
        }
        if(new_position_left<0){
            new_position_left=0;
        }
        $(parentNode).css({
            left: new_position_left + 'px',
            top: new_position_top + 'px'
        })
    })
});

$(".boxMove").mouseup(function(evt){
    $(document).unbind("mousemove");
})


    //修改底部显示栏的点击功能模式
$("#changeMode").click(function(){

        var old_value = this.value;

        switch (old_value){
            case "显示层":
                this.value = "推板设置";
                break;
            case "推板设置":
                this.value = "显示层";
                break;
        }

    })

$("#rulerShow_color input").click(function(){

    var thisMode = $("#changeMode").val();

    switch (thisMode){
        case "显示层":
            if($(this).css("background-color") != 'rgb(221, 221, 221)'){
                var vl = $(this).val();
                $("#putSizegroupList").find(".cutPart_"+vl).siblings().hide();
                $("#putSizegroupList").find(".cutPart_"+vl).show();
                $(this).siblings().removeClass("showPutyard");
                $(this).addClass("showPutyard");
                if($(this).hasClass("Putyard_refer")){
                    console.log("是不是判断到了")
                    $(this).css("border","")
                }
            }
            break;
        case "推板设置":
            if($(this).hasClass("Putyard")){
                $(this).removeClass("Putyard showPutyard");
                $(this).css({background:"rgb(221, 221, 221)"});
            }else{
                var ind = $(this).index();
                if(ind < thisRule.length){
                    var new_backColor = thisRule[ind].color;
                    $(this).css({background:new_backColor});
                    $(this).addClass("Putyard showPutyard");
                }
            }
            break;
    }

})

$("#showAllruler").click(function(){
    drawBottomShow();
    $("#putSizegroupList").find("g").show();
})

//给推板底部规则展示区添加属性
function drawBottomShow(){

        var colorBtns = $("#rulerShow_color").find("input");

        for(var i=0;i<colorBtns.length;i++){
            $(colorBtns[i]).removeClass("showPutyard");
            $(colorBtns[i]).removeClass("Putyard");
            $(colorBtns[i]).removeClass("Putyard_refer");

            if(i<thisRule.length){
                if(thisRule[i].refer){
                    $(colorBtns[i]).val(thisRule[i].size+"*");
                    $(colorBtns[i]).addClass("Putyard_refer");
                    $(colorBtns[i]).css("border","1px solid #0f1");
                }else{
                    $(colorBtns[i]).val(thisRule[i].size);
                    $(colorBtns[i]).removeAttr("style");
                }
                $(colorBtns[i]).css({"background-color":thisRule[i].color});
                $(colorBtns[i]).addClass("showPutyard");
                $(colorBtns[i]).addClass("Putyard");
            }else{
                $(colorBtns[i]).val(" ");
                $(colorBtns[i]).css({"background-color":"rgb(221, 221, 221)"});
            }
        }

        return;
    }

$("#setRule_cir").click(function(){

    $("#setSizeRuleTable").hide();

    showDiffvalue();
    getPutSize();
    recoverColor();

    closeThisbox('setSizeRuleTable');
    $("#steps").html("请在框选需要放码的点");

});

$('#symmetricTransform .closeAttr').click(function () {
    $(this).parent().parent().hide();
});

$('#sliceRulerCopy').click(function () {
    $('#symmetricTransform').show();
});
    
