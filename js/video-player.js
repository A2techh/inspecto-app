//if( 'undefined' === typeof window){


var root = this;

var HxPlayer =(function(){
	  function constructor()
	  {
	  }
	  return constructor;
	})();

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        /** @expose */
        exports = module.exports = HxPlayer;
    }
    /** @expose */
    exports.HxPlayer = HxPlayer;
} else {
    /** @expose */
    root.HxPlayer = HxPlayer;
}

 
self.recycle_mem=function(buff){};
    	
 HxPlayer.prototype.init = function(option){
 	 this.m_closeFlag = 0;
 	 this.m_width = option.width||640;
 	 this.m_height = option.height || 352;
 	 this.objcanvas = option.canvas;
 	 
 };
 


HxPlayer.prototype.setShowFlag=function(vflag){

	 if(this.worker)
	   this.worker.postMessage({cmd:'show',showFlag:vflag});
};

 HxPlayer.prototype.playvideo = function(hostip,nport,streamtype,struser,strpwd){
     		
 
       var canvas = this.objcanvas;
       var that = this;

       var decworker = new Worker('js/hi_h264dec.js');
       that.decworker = decworker;
       that.decworker.addEventListener('message',function(e){
       	 var data = e.data;
       	 
       	  
        var ww = data.picw;
        var hh = data.pich;
        var ylen = ww * hh;
        var uvlen = (ww / 2) * (hh / 2);

        renderFrame(that.renderContext, new Uint8Array(data.buf), ww, hh, ylen, uvlen);
        
      },false);
     
     this.pcmPlayer = new PCMPlayer({
        encoding: '16bitInt',
        channels: 1,
        sampleRate: 8000,
        flushingTime: 500
     });  
     this.hiAudioWorker = new Worker('js/decworker.js');
     this.hiAudioWorker.addEventListener('message', function(e) {
  		 
  		 //console.log('thread recv wav message:');
  		 
  		var audiu_data = e.data;
  		 var dv1 = new Uint8Array(audiu_data.buffer);
  		 var audiu_buf = new ArrayBuffer(audiu_data.byteLength);
  		 var wav_data = new Uint8Array(audiu_buf);
  		 wav_data.set(dv1);
  		 //console.log('thread recv wav message,len-' + wav_data.length);
  		 //that.auPlayQueue.enqueue(wav_data);
  		 that.pcmPlayer.feed(wav_data);
  		   		                         
    }, false);
    
       var networker = new Worker('js/NetThread.js');                
       //var worker = new Worker('js/DecThread.js');
       that.networker = networker;
       
      
      that.renderContext = setupCanvas(canvas, {
                    preserveDrawingBuffer: false
                });
                
      that.networker.addEventListener('message', function(e) {
        var data = e.data;
        var infos;
        switch(data.vtype)
         {
         	 case DATA_SYSTEMHEADER:
         	 {
         	 	 var ww=data.picw;
         	 	 var hh = data.pich;
         	 	 var codetype = data.codetype;
         	 	 
         	 	 that.decworker.postMessage(data);
         	 }
         	 break;
         	 
         	 case DATA_AV_DATA:
         	 {
         	 	var av_data = data.buf;
         	 	var frame = new HI_AVFrame(av_data);
         	 	if(frame.u32AVFrameFlag == 0x46565848)
         	 	{
         	 		//���������߳�
         	 	
         	 	     that.decworker.postMessage({vtype:DATA_VIDEO_DATA,buf:av_data},[av_data]);
         	 	 }
         	 	 else
         	 	 	{
         	 	 		//������Ƶ�̴߳���
         	 	 		//console.log('recv audio data ,len=' + frame.u32AVFrameLen);
         	 	 	
         	 	 		var dv = new DataView(frame.payload.buffer);
  	  
  	  				   that.hiAudioWorker.postMessage(dv,[dv.buffer]);
         	 	 	}
         	 }
         	 break;
         }
      }, false);
       
        this.connect = function(url,nport,streamtype,struser,strpwd){
      	that.m_closeFlag = 0;
      	that.m_firefoxflag = 0;
      	if('MozWebSocket' in window)
      	   that.m_firefoxflag = 1;
      	
      	
    	  this.networker.postMessage({cmd:'start',phostip:hostip,pport:nport,pstreamtype:streamtype,puser:struser,ppwd:strpwd,firefoxflag:that.m_firefoxflag }); // Send data to our worker.
      };
    
        this.connect(hostip,nport,streamtype,struser,strpwd);
     	};
     	
 HxPlayer.prototype.stopvideo = function(){ 
     		   if(this.m_closeFlag === 0)
     		   {
     		   	this.m_closeFlag = 1;
     		   	this.networker.postMessage({cmd:'stop'});
     		   }
     		   
     		   this.hiAudioWorker.terminate();
    			 this.pcmPlayer.destroy();
     		};
     		
     	//}
     		
    
     		
  