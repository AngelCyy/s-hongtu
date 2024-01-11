var serverUrl = 'https://api.ditoe.net/';

var phoneNumber = '13701751652';

nethelper = function()
{
    var orderNo = undefined;
    var pictureId;
    var imageUrl = 1231321;
    var Expires;
    var OSSAccessKeyId;
    var Signature;
    var userToken = undefined;

    this.getExpires = function()
    {
        return Expires;
    }

    this.getOSSAccessKey = function()
    {
        return OSSAccessKeyId;
    }

    this.getSignature = function()
    {
        return Signature;
    }

    this.getDesignId = function()
    {
        return orderNo;
    }

    this.getRawImageUrl = function()
    {
        return imageUrl;
    }

    this.getImageRequestUrl = function()
    {
        return imageUrl + ((Expires != undefined) ? '?Expires=' + Expires : '') + ((OSSAccessKeyId != undefined) ? '&OSSAccessKeyId=' + OSSAccessKeyId : '') + ((Signature != undefined) ? '&Signature=' + Signature : '');
    }

    function getAllUrlParams()
    {
        var urlParams = window.location.href.replace('.svg?' , '.svg&').replace('.png?' , '.png&').replace('.jpg?' , '.jpg&');

        var vars = {};
        var parts = urlParams.replace(/[?&]+([^=&]+)=([^&]*)/gi,
            function(m,key,value) {
                vars[key] = value;
            });
        return vars;
    }

    this.parseAllUrlParams = function()
    {
        var urlParams = getAllUrlParams();
        orderNo = urlParams['orderNo'];
        pictureId = urlParams['pictureId'];
        imageUrl = urlParams['imageUrl'];
        Expires = urlParams['Expires'];
        OSSAccessKeyId = urlParams['OSSAccessKeyId'];
        Signature = urlParams['Signature'];

        console.log(urlParams);

        console.log("============================ MD5: " + md5("ewrjlwjrewljrewlkjrwe"));

        requestToken();
    }

    function requestToken()
    {
        if (orderNo != undefined)
        {
            http.post({
                    url : 'https://api.ditoe.net/clothingDesign/getUserToken',
                    data : JSON.stringify({orderNo: '201709291534366531'}),
                    contentType: 'application/json',
                    onload : function()
                    {
                        var tokenData = JSON.parse(this.responseText);
                        userToken = tokenData.data;
                        requestPlateInfo();
                    }
                }
            );
        }
    }

    function requestPlateInfo()
    {
        http.post({
                url : 'https://api.ditoe.net/design/designPlateInfo',
                data : JSON.stringify({orderNo: orderNo }),
                headers : {'fabric-token': userToken} ,
                contentType: 'application/json',
                onload : function()
                {
                    var orderInfo = JSON.parse(this.responseText);
                    if(orderInfo.data.orderPlayVersion){
                        svgCanvas.addDesignPart(orderInfo.data.orderPlayVersion);
                    }else{
                        svgCanvas.addDesignPart(null);
                    }
                    svgCanvas.requestPartsAndShow();

                    //console.log(JSON.stringify({designId: designId , timestamp : _timestamp, signature : _signature}));
                }
            }
        );
    }

    this.uploadDesignPart = function(partContentString)
    {
        if (orderNo != undefined && userToken != undefined)
        {
            var formData = new FormData();

            var content = partContentString;//'<a id="a"><b id="b">hey!</b></a>';
            var blob = new Blob([content], { type: "text/xml"});

            formData.append("orderNo", orderNo);
            formData.append("file", blob);

            // Upload
            http.post({
                    url : serverUrl + 'design/upload',
                    headers : {'fabric-token': userToken} ,
                    data :formData,
                    onload : function()
                    {
                        console.log('================= upload part: ' + this.responseText);

                        console.log(JSON.parse(this.responseText));

                    }
                }
            );
        }
    }

    this.uploadProjectTemp = function(projectContentString)
    {
        //this.uploadProject(projectContentString);
    }

    this.uploadProject = function(projectContentString)
    {
        if (orderNo != undefined && userToken != undefined)
        {
            var formData = new FormData();

            var content = projectContentString;//'<a id="a"><b id="b">hey!</b></a>';
            var blob = new Blob([content], { type: "text/xml"});

            formData.append("orderNo", orderNo);
            formData.append("file", blob);

            // Vector
            http.post({
                // url : 'https://api.ditoe.net/design/designPlateInfo',
                url:serverUrl + 'design/plateUpload',
                headers : {'fabric-token': userToken} ,
                data :formData,
                onload : function()
                {
                    console.log(JSON.parse(this.responseText));
                    var xhr = JSON.parse(this.responseText);
                    if(xhr.status==200){
                        $('#saveOver').show().html('上传成功！');
                        setTimeout(function () {
                            $('#saveOver').hide();
                        },2000);
                    }else{
                        $('#saveOver').show().html(xhr.msg);
                        setTimeout(function () {
                            $('#saveOver').hide();
                        },2000);
                    }
                }
            });
        }
    }

    this.downloadProjectTemp = function(callback)
    {
        if (orderNo != undefined && userToken != undefined)
        {
            var userOrderId = orderNo;
            var userTokenId = userToken;

            http.post({
                    url : 'https://api.ditoe.net/design/downloadVectorTemp',
                    headers : {'fabric-token':userTokenId} ,
                    data : JSON.stringify({orderId : orderNo}),
                    contentType: 'application/json',
                    onload : function()
                    {
                        if (callback)
                        {
                            if (this.responseText)
                            {
                                callback(this.responseText);
                            }
                            else
                            {
                                callback(null);
                            }
                        }
                    }
                }
            );
        }
        else
        {
            if (callback)
            {
                callback(null);
            }
        }
    }

    this.downloadProject = function(callback)
    {
        if (orderNo != undefined && userToken != undefined)
        {
            var userOrderId = orderNo;
            var userTokenId = userToken;

            http.post({
                    url : 'https://api.ditoe.net/design/downloadVector',
                    headers : {'fabric-token':userTokenId} ,
                    data : JSON.stringify({orderId : orderNo}),
                    contentType: 'application/json',
                    onload : function()
                    {
                        if (callback)
                        {
                            if (this.responseText)
                            {
                                callback(this.responseText);
                            }
                            else
                            {
                                callback(null);
                            }
                        }
                    }
                }
            );
        }
        else
        {
            if (callback)
            {
                callback(null);
            }
        }
    }

    this.requestDesignParts = function(callback)
    {
        if (orderNo != undefined && userToken != undefined)
        {
            var userOrderId = orderNo;
            var userTokenId = userToken;

            // Fetch picture list
            http.post({
                    url : 'https://api.ditoe.net/design/designPlateInfo',
                    data : JSON.stringify({orderNo: orderNo }),
                    headers : {'fabric-token': userToken} ,
                    contentType: 'application/json',
                    onload : function()
                    {
                        var orderInfo = JSON.parse(this.responseText);

                        console.log(orderInfo);

                        if (callback)
                        {
                            if (orderInfo && orderInfo.data && orderInfo.data.picList)
                            {
                                var picList = orderInfo.data.picList.split('|');
                                var pieceList = (orderInfo.data.pieceList == null) ? null : orderInfo.data.pieceList.split('|');

                                $('#part_preview').show();
                                callback(picList ,pieceList );
                            }
                            else
                            {
                                callback(null);
                            }
                        }
                    }
                }
            );

            http.post({
                    url : 'https://api.ditoe.net/design/pictureList',
                    headers : {'fabric-token':userTokenId} ,
                    data : JSON.stringify({pageNum: '0' , pageSize:'64' , orderNo: userOrderId}),
                    contentType: 'application/json',
                    onload : function()
                    {
                        var designParts = JSON.parse(this.responseText);

                        if (callback)
                        {
                            if (designParts && designParts.data)
                            {
                                callback(designParts.data.dataList);
                            }
                            else
                            {
                                callback(null);
                            }
                        }
                    }
                }
            );
        }
        else
        {
            if (callback)
            {
                callback(null);
            }
        }
    }

    this.requestDesignPartsSelected = function(callback)
    {
        if (orderNo != undefined && userToken != undefined)
        {
            var userOrderId = orderNo;
            var userTokenId = userToken;

            console.log('Token: ' + userTokenId + ', ' + userOrderId);

            // Fetch picture list
            http.post({
                    url : 'https://api.ditoe.net/design/designPictureUpdateList',
                    headers : {'fabric-token':userTokenId} ,
                    data : JSON.stringify({pageNum: '0' , pageSize:'0' , orderNo: userOrderId}),
                    contentType: 'application/json',
                    onload : function()
                    {
                        var designParts = JSON.parse(this.responseText);

                        if (callback)
                        {
                            if (designParts && designParts.data)
                            {
                                callback(designParts.data.dataList);
                            }
                            else
                            {
                                callback(null);
                            }
                        }
                    }
                }
            );
        }
        else
        {
            if (callback)
            {
                callback(null);
            }
        }
    }

    this.openPartSelectPage = function()
    {
        //window.open('https://www.ditoe.net/clothingDesign/index.html#/' + designId);

        if (orderNo != undefined && userToken != undefined)
        {
            var iframeDom = document.getElementById("partselectpanel_iframe");
            if (iframeDom)
            {
                iframeDom.setAttribute('src' ,'https://www.ditoe.net/clothingDesign/index.html#/' + orderNo);

                $('#partselectpanel').show();
            }
        }
    }
}