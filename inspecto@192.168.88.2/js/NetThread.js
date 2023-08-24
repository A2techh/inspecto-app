if ('undefined' === typeof window) {
    importScripts('commonff.js');

    function Decodeuint8arr(uint8array) {
        return new TextDecoder("utf-8").decode(uint8array);
    }

    function Base64() {
        // private property  
        _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        // public method for encoding  
        this.encode = function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = _utf8_encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output +
                    _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                    _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
            }
            return output;
        }

        // private method for UTF-8 encoding  
        _utf8_encode = function (string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }
            return utftext;
        }
    }

    self.myprintf = function () {
        var num = arguments.length;
        var oStr = arguments[0];
        for (var i = 1; i < num; i++) {
            var pattern = "\\{" + (i - 1) + "\\}";
            var re = new RegExp(pattern, "g");
            oStr = oStr.replace(re, arguments[i]);
        }
        return oStr;
    };

    self.getReqStreamCmdStrTest = function () {

        var that = this;
        var hostip = '192.168.1.118';
        var hostport = 80;
        var streamtype = 11;
        var mediastr = 'video_audio_data';
        that.hostuser = 'admin';
        that.hostpwd = 'admin';

        var str = self.myprintf("GET http://{0}:{1}/livestream/{2}?action=play&media={3} HTTP/1.1\r\n", hostip, hostport, streamtype, mediastr);

        str += "Connection: Keep-Alive\r\n";
        str += "Cache-Control: no-cache\r\n";

        var str1 = self.myprintf("Authorization: {0} {1}\r\n", that.hostuser, that.hostpwd);

        str += str1;

        var content_str = "Cseq: 1\r\n";
        content_str += "Transport: RTP/AVP/TCP;unicast;interleaved=0-1\r\n";
        str += self.myprintf("Content-Length: {0}\r\n", content_str.length);
        str += "\r\n";
        str += content_str;
        return str;
    };

    self.getWebServerIp = function (phost, pport) {
        var hostport = phost;
        var serveraddr = hostport;
        var strport = ':' + pport;

        var pos1 = serveraddr.indexOf("localhost");
        if (pos1 >= 0) {
            serveraddr = serveraddr.substr(pos1);
            var ret = serveraddr.replace('localhost', '127.0.0.1');
            serveraddr = 'ws://' + ret;
            serveraddr += strport;
            //serveraddr += ':80';
            //serveraddr += ':8899';
        }
        else {
            pos1 = serveraddr.indexOf('http://');
            if (pos1 >= 0)
                serveraddr.replace('http://', 'ws://');
            else
                serveraddr = 'ws://' + serveraddr;
            serveraddr += strport;
            //serveraddr += ':80';
            //serveraddr += ':8899';
        }
        //var pos = serveraddr.lastIndexOf(":");

        //serveraddr=serveraddr.substr(0,pos);
        //serveraddr += ':80';
        //serveraddr += ':8899';

        return serveraddr;
    }

    self.getReqStreamCmdStr = function (phostip, pport, pstreamtype, puser, ppwd) {

        var hostip = phostip;
        var hostport = pport;
        var streamtype = pstreamtype;
        var mediastr = 'video_audio_data';
        var hostuser = puser;
        var hostpwd = ppwd;
        var base64 = new Base64();
        var enc_user = base64.encode(puser + ':' + ppwd);
        var str = myprintf("GET http://{0}:{1}/livestream.cgi?stream={2}&action=play&media={3} HTTP/1.1\r\n", hostip, hostport, streamtype, mediastr);

        str += "Connection: Keep-Alive\r\n";
        str += "Cache-Control: no-cache\r\n";

        var str1 = myprintf("Authorization: Basic {0}\r\n", enc_user);

        str += str1;

        var content_str = "Cseq: 1\r\n";
        content_str += "Transport: RTP/AVP/TCP;unicast;interleaved=0-1\r\n";
        str += myprintf("Content-Length: {0}\r\n", content_str.length);
        str += "\r\n";
        str += content_str;
        return str;
    };

    var HiNet = (function MYNET() {
        function constructor() {
            this.netcallback = null;
            this.that = this;
            this.ws = null;

        }
        return constructor;
    })();

    HiNet.prototype.setcallback = function (cbfun) {
        this.netcallback = cbfun;
    };


    HiNet.prototype._reset = function () { };

    var handler_data = function (obj, data) {
        obj.handler_dataEx(obj, data);
    };

    var handler_header = function (obj, data) {
        obj.handler_header(obj, data);
    };

    HiNet.prototype.handler_header = function (obj, data) {

        var strRes = Decodeuint8arr(data);
        var ret = strRes.indexOf('H265');
        if (ret !== -1) {
            // 265 ����
            console.log('recv video header');
            //var sysheader = new HISYSHEADER(data);
            //print_header(sysheader);
            //m=video 49 H265/90000/640/352
            var iend = strRes.indexOf("\n", ret);
            var sstr = strRes.substr(ret, iend - ret);
            var aar = sstr.split('/');
            self.mWidth = parseInt(aar[2]);
            self.mHeight = parseInt(aar[3]);

            self.postMessage({ vtype: DATA_SYSTEMHEADER, picw: self.mWidth, pich: self.mHeight, codetype: DECCODE_265 });
        }
        else {
            // 264 ����
            console.log('recv video header');
            ret = strRes.indexOf('H264')
            var iend = strRes.indexOf("\n", ret);
            var sstr = strRes.substr(ret, iend - ret);
            var aar = sstr.split('/');
            self.mWidth = parseInt(aar[2]);
            self.mHeight = parseInt(aar[3]);

            //var sysheader = new HISYSHEADER(data);
            //print_header(sysheader);
            //self.mWidth = sysheader.u32Width;
            //self.mHeight = sysheader.u32Height;

            self.postMessage({ vtype: DATA_SYSTEMHEADER, picw: self.mWidth, pich: self.mHeight, codetype: DECCODE_264 });
        }
    };

    HiNet.prototype.handler_dataEx = function (obj, data) {

        var dv = new DataView(data);
        var u32flag = dv.getUint32(0, true);
        var u32tt = dv.getUint32(0, false);
        if (u32flag === 0x54565848) {// 265 ����
            console.log('recv video header');
            var sysheader = new HISYSHEADER(data);
            print_header(sysheader);
            self.mWidth = sysheader.u32Width;
            self.mHeight = sysheader.u32Height;

            self.postMessage({ vtype: DATA_SYSTEMHEADER, picw: self.mWidth, pich: self.mHeight, codetype: DECCODE_265 });

        }
        else if (u32flag === 0x53565848) {// 264 ����
            console.log('recv video header');
            var sysheader = new HISYSHEADER(data);
            print_header(sysheader);
            self.mWidth = sysheader.u32Width;
            self.mHeight = sysheader.u32Height;

            self.postMessage({ vtype: DATA_SYSTEMHEADER, picw: self.mWidth, pich: self.mHeight, codetype: DECCODE_264 });

        }
        else {
            //console.log('recv video data');
            self.postMessage({ vtype: DATA_AV_DATA, buf: data }, [data]);
        }
    };

    HiNet.prototype.connect = function (hostip, pport, puser, ppwd, pstreamtype) {

        this._reset();
        var that = this.that;

        that.m_url = hostip;
        that.m_nport = pport;
        that.m_streamtype = pstreamtype;
        that.m_user = puser;
        that.m_pwd = ppwd;
        that.responsestream = 0;
        var url = self.getWebServerIp(hostip, pport);
        console.log('playvideo this=' + this);
        try {
            if (self.g_firefoxflag === 1) {
                console.log('MozWebsocket');
                that.ws = new MozWebSocket(url + '/websocket');
            }
            else {
                console.log('Websocket');
                that.ws = new WebSocket('ws://192.168.88.77/websocket');
            }
        } catch (e) {
            console.log('error');
            return;
        }

        console.log('hostip=' + hostip + ' port=' + pport + ' user=' + puser + ' pwd=' + ppwd + ' streamtype=' + pstreamtype);
        this.ws.onopen = function (evt) {
            console.log('websocket state:connected');
            hostip = "192.168.88.78"
            var str = self.getReqStreamCmdStr(hostip, pport, pstreamtype, puser, ppwd);
            // str = "GET http://192.168.88.77:80/livestream.cgi?stream=12&action=play&media=video_audio_data HTTP/1.1\n\Connection: Keep-Alive\nCache-Control: no-cache\nAuthorization: Basic YWRtaW46YWRtaW4=\nContent-Length: 57\n\nCseq: 1\nTransport: RTP/AVP/TCP;unicast;interleaved=0-1"
            console.log('send reqstream=' + str);

            that.ws.send(str);
        };
        //this.ws.onopen = function (evt) { console.log('websocket state:connected');  that.ws.send("Video");}; 
        this.ws.onclose = function (evt) { console.log('ws.onclose'); that.ws.close(); if (that.actcloseflag == 0) that.reconnectipc(); };
        this.ws.onerror = function (evt) { console.log('websocket state:exception error'); };
        this.ws.onmessage = function (evt) {
            //console.log('Retrieved data from server: ' + evt.data);
            if (typeof (evt.data) == "string") {

                var txt = evt.data;
                console.log(txt);
            }
            else {
                var reader = new FileReader();
                reader.onload = function (evt) {
                    if (evt.target.readyState == FileReader.DONE) {
                        // var data = new Uint8Array(evt.target.result);
                        //console.log('recv data :' + data.length);

                        //handler_data(that,data); 
                        var data = new Uint8Array(evt.target.result);
                        var buf_data = new ArrayBuffer(data.length);
                        var dv1 = new Uint8Array(buf_data);
                        dv1.set(data);
                        // console.log('recv data :' + data.length);
                        if (that.responsestream === 0) {
                            var strRes = Decodeuint8arr(data);
                            /**/
                            var ret = strRes.search('HTTP/1.1 200 OK');
                            if (ret === 0) {
                                handler_header(that, buf_data);
                            }
                            else {
                                ret = strRes.search('Unauthorized');
                                if (ret === 0) {

                                }
                            }
                            console.log('result=' + ret);
                            console.log('strRes=' + strRes);
                            that.responsestream = 1;
                            //handler_data(that,buf_data); //���ԣ���ʽҪע�͵�
                        }
                        else {
                            handler_data(that, buf_data);
                        }
                    }
                }
                reader.readAsArrayBuffer(evt.data);
            }
        };

        this.reconnectipc = function () {
            try {
                var url_string = 'ws://' + m_url + ':' + m_nport + '/websocket';
                console.log('reconnect url:' + url_string);

                if (self.g_firefoxflag === 1) {
                    console.log('MozWebSocket');
                    that.ws = new MozWebSocket(url_string);
                } else {
                    console.log('Websocket');
                    that.ws = new WebSocket(url_string);
                }
            }
            catch (e) {
                console.log('error');
                return;
            }
        };


    };// end connect

    HiNet.prototype.disconnect = function () { this.ws.close('1000', ''); console.log('websock closeed'); this.actcloseflag = 1; this.ws.close(); };


    self.netModule = null;
    self.g_stopflag = 0;
    self.Iflag = 0;
    self.Iframe = null;
    self.mWidth = 720;
    self.mHeight = 352;
    self.g_firefoxflag = 0;
    self.g_showflag = 1;

    self.addEventListener('message', function (e) {

        var data = e.data;
        switch (data.cmd) {
            case 'start':
                {

                    var option = data;
                    //self.initglobal();
                    self.initnetmodule(option);

                }
                break;
            case 'stop':
                {
                    self.g_stopflag = 1;

                    self.netModule.disconnect();
                    self.netModule = null;


                    self.close();
                }
                break;

            case 'show':
                {

                    self.g_showflag = data.showFlag;
                    console.log('showpage=' + self.g_showflag);
                    if (self.g_showflag === 1)
                        self.g_needIframe = true;
                }
                break;
        }



    }, false);



    self._netcallback = function (data) {

        var dv = new DataView(data.buffer);
        var u32flag = dv.getUint32(0, true);
        var u32tt = dv.getUint32(0, false);
        if (u32flag === 0x54565848) {
            console.log('recv video header');
            var sysheader = new HISYSHEADER(data);
            print_header(sysheader);
            self.mWidth = sysheader.u32Width;
            self.mHeight = sysheader.u32Height;

            self.decworker.postMessage({ vtype: DATA_SYSTEMHEADER, picw: self.mWidth, pich: self.mHeight });

        }
        else {
            console.log('recv video data');
            self.decworker.postMessage({ vtype: DATA_VIDEO_DATA, buf: data.buffer }, [data.buffer]);
            return;

        }

    };

    self.initnetmodule = function (option) {

        self.netModule = new HiNet();
        self.netModule.setcallback(self._netcallback);
        self.g_firefoxflag = option.firefoxflag;
        self.netModule.connect(option.phostip, option.pport, option.puser, option.ppwd, option.pstreamtype);
    };

}



