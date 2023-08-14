if( 'undefined' === typeof window){
	
	this.that = this;
	
	self.Module = {
    onRuntimeInitialized: function () {
    	
    	that.module265 = Module;
    	
    	self._Hi264DecCreate = that.module265.cwrap('Hi264DecCreate','number',['number','number','number']);
			self._Hi264DecDestroy = that.module265.cwrap('Hi264DecDestroy','undefined',['number']);
			self._Hi264DecFrame = that.module265.cwrap('Hi264DecFrame','number',['number','number','number','number','number','number']);
			self._Hi265DecCreate = that.module265.cwrap('Hi265DecCreate','number',['number','number','number']);
			self._Hi265DecDestroy = that.module265.cwrap('Hi265DecDestroy','undefined',['number']);
			self._Hi265DecFrame = that.module265.cwrap('Hi265DecFrame','number',['number','number','number','number','number','number']);
			self._malloc =  that.module265._malloc;
			self._free = that.module265._free;
			self._memset = that.module265.cwrap('HiMemset','undefined',['number','number','number']);
			//self._memcpy = that.module265.cwrap('HiMemcpy','undefined',['number','number','number']);
			//self._strcpy = that.module265.cwrap('HiStrcpy','undefined',['number','number']);

			//self._malloc =  that.module265.cwrap('HiMalloc','number',['number']);
			//self._free = that.module265.cwrap('HiFree','undefined',['number']);
			//self._memset = that.module265.cwrap('HiMemset','undefined',['number','number','number']);
			//self._memcpy = that.module265.cwrap('HiMemcpy','undefined',['number','number','number']);
			//self._strcpy = that.module265.cwrap('HiStrcpy','undefined',['number','number']);

			self.decoder = new Decoder;
			
      onWasmLoaded();
    }
};

importScripts("commonff.js");
importScripts("libffmpeg.js");
  

//importScripts("libffmpeg.js");


console.log('Module=' + self.Module);



self.DECFRAME_LEN = 88;

self.g_width = 640;
self.g_height = 352;
         
         

  
function cptr_copy_to_arraybuffer(cptr,dst_array,bytesLen)
{
	//��c++ָ���ڴ濽�����ݵ�arraybuffer�ڴ���
	var dv = new Uint8Array(dst_array);
	var dv2 = new Uint8Array(that.module265.HEAPU8.subarray(cptr,cptr+bytesLen));
	dv.set(dv2.subarray(0,bytesLen));
}

function cptr_copy_from_arraybuffer_1(cptr,src_array,bytesLen)
{
	//��arraybuffer�ڴ��п������ݵ�c++ָ���ڴ�
	that.module265.writeArrayToMemory(new Uint8Array(src_array),cptr);
}

function cptr_copy_from_arraybuffer_2(cptr,src_array,bytesLen)
{
	//��arraybuffer�ڴ��п������ݵ�c++ָ���ڴ�
	var dst_dvt = new Uint8Array(that.module265.HEAPU8.subarray(cptr,cptr+bytesLen));
	//var src_dvt = new Uint8Array(src_array.buffer);
	dst_dvt.set(src_array);
	//dvt.set(new Uint8Array(src_array));
}
    
function array_copy(dstArray,pos,srcArray,nLength)
{
  var dst_dv = new Uint8Array(dstArray);
  var src_dv	= new Uint8Array(srcArray);
  dst_dv.set(srcArray,pos);
}

function Decoder() {
    this.wasmLoaded     = false;
    this.decCallback  = null;
    this.tmpReqQue      = [];
    this.cacheBuffer    = null;
    this.decodeTimer    = null;
    this.mhDecHandle = 0;
    this.mWidth = 740;
    this.mHeight = 352;
    this.mBufLen = this.mWidth*this.mHeight*3/2;
}

Decoder.prototype.onWasmLoaded= function(){
	this.wasmLoaded     = true;
	this.decCallback = that.module265.addFunction(function (buff, size, nwidth,nheight,timestamp) {
        var outArray = that.module265.HEAPU8.subarray(buff, buff + size);
        var data = new Uint8Array(outArray);
        //var recbuf = new ArrayBuffer(size);
        //cptr_copy_to_arraybuffer(buff,recbuf,size);
        var picw = nwidth;
        var pich = nheight;
        var objData = {
            buf:data,
            yuvlen:size,
            picw:nwidth,
            pich:nheight
            
        };
                
        self.postMessage(objData, [objData.buf.buffer]);
    });
    
	console.log('libffmpeg.wasm loaded');
};

Decoder.prototype.Hi264DecCreate = function (nWidth, nHeight) {
    
     
    
    this.mhDecHandle = 0;
    this.mWidth = nWidth;
    this.mHeight = nHeight;
    this.mBufLen = this.mWidth*this.mHeight*3/2;
    self.g_dec_frame_buf = self._malloc(nWidth*nHeight*3/2);
    self._memset(self.g_dec_frame_buf,0,this.mBufLen);
    self._memset(self.g_dec_frame_s,0,self.DECFRAME_LEN);
   
    var ret = self._Hi264DecCreate(nWidth, nHeight,this.decCallback);
    
    return ret;
    //self.postMessage(objData);
};

Decoder.prototype.Hi264DecDestroy = function (hDecHandle) {
    var ret = self._Hi264DecDestroy(hDecHandle);
    if(self.g_dec_frame_s != null)
    {
      self._free(self.g_dec_frame_s);
      self.g_dec_frame_s = null;
    }
    
    if(self.g_dec_frame_buf != null)
    {
    	self._free(self.g_dec_frame_buf);
    	self.g_dec_frame_buf = NULL;
    }
    
    if(self.g_rec_buf != null)
    {
    	
    	self.g_rec_buf = null;
    	self.g_rec_pos = 0;
    }
  
  
    self.CurPTS = 0;
    this.mhDecHandle = 0;
};

Decoder.prototype.Hi264DecFrame = function (hDecHandle,buf,len,pts,decframe,uflags) {
  
   
    var frame = new Uint8Array(buf);
    self._memset(self.g_dec_frame_s,0,self.DECFRAME_LEN);
    cptr_copy_from_arraybuffer_1(self.g_dec_frame_buf,frame,len);
    var ret = self._Hi264DecFrame(hDecHandle, self.g_dec_frame_buf, len, pts,self.g_dec_frame_s,uflags);
    
    //if(ret === 0)
     // this.getDecFrameInfo(self.g_dec_frame_s,decframe);
      
      return ret;
    //self.postMessage(objData);
};

Decoder.prototype.Hi265DecCreate = function (nWidth, nHeight) {
    var ret = self._Hi265DecCreate(nWidth, nHeight,this.decCallback);
    
    console.log('Hi265DecCreate ret=0x' + Number(ret).toString(16));
    
    self.g_dec_frame_s = self._malloc(self.DECFRAME_LEN);
    
    this.mhDecHandle = ret;
    this.mWidth = nWidth;
    this.mHeight = nHeight;
    this.mBufLen = this.mWidth*this.mHeight*3/2;
    self.g_dec_frame_buf = self._malloc(nWidth*nHeight*3/2);
    self._memset(self.g_dec_frame_buf,0,this.mBufLen);
    self._memset(self.g_dec_frame_s,0,self.DECFRAME_LEN);
   return ret;
    //self.postMessage(objData);
};

Decoder.prototype.Hi265DecDestroy = function (hDecHandle) {
	  console.log('Hi265DecCreate ret=0x' + Interger.toHexString(hDecHandle));
    var ret = self._Hi265DecDestroy(hDecHandle);
    if(self.g_dec_frame_s != null)
    {
      self._free(self.g_dec_frame_s);
      self.g_dec_frame_s = null;
    }
    
    if(self.g_dec_frame_buf != null)
    {
    	self._free(self.g_dec_frame_buf);
    	self.g_dec_frame_buf = NULL;
    }
    
    if(self.g_rec_buf != null)
    {
    	
    	self.g_rec_buf = null;
    	self.g_rec_pos = 0;
    }
    
    self.CurPTS = 0;
    this.mhDecHandle = 0;
};

Decoder.prototype.Hi265DecFrame = function (hDecHandle,buf,len,pts,decframe,uflags) {
  
   
    var frame = new Uint8Array(buf);
    self._memset(self.g_dec_frame_s,0,self.DECFRAME_LEN);
    cptr_copy_from_arraybuffer_1(self.g_dec_frame_buf,frame,len);
    var ret = self._Hi265DecFrame(hDecHandle, self.g_dec_frame_buf, len, pts,self.g_dec_frame_s,uflags);
    
    //if(ret === 0)
    //  this.getDecFrameInfo(self.g_dec_frame_s,decframe);
    
    return ret;
};

Decoder.prototype.getDecFrameInfo = function(cptr,decframeinfo){
	
	  var data = new Uint8Array(that.module265.HEAPU8.subarray(cptr,cptr+self.DECFRAME_LEN));
	  var dv = new DataView(data.buffer);
	  var yuvlen = this.mWidth*this.mHeight*3/2;
		
	  decframeinfo.pY = dv.getUint32(0,true); 
	
	  decframeinfo.yuvdata = new ArrayBuffer(yuvlen);
	  cptr_copy_to_arraybuffer(decframeinfo.pY,decframeinfo.yuvdata,yuvlen);
		  
	                    //Y plane base address of the picture
    decframeinfo.pU = dv.getUint32(4,true);;                   //U plane base address of the picture
    decframeinfo.pV = dv.getUint32(8,true);;                   //V plane base address of the picture
    decframeinfo.uWidth =dv.getUint32(12,true);;               //The width of output picture in pixel
    decframeinfo.uHeight = dv.getUint32(16,true);;              //The height of output picture in pixel
    decframeinfo.uYStride = dv.getUint32(20,true);;             //Luma plane stride in pixel
    decframeinfo.uUVStride = dv.getUint32(24,true);;            //Chroma plane stride in pixel
    decframeinfo.uCroppingLeftOffset  = dv.getUint32(28,true);;  //Crop information in pixel
    decframeinfo.uCroppingRightOffset = dv.getUint32(32,true);; 
    decframeinfo.uCroppingTopOffset = dv.getUint32(36,true);;   
    decframeinfo.uCroppingBottomOffset = dv.getUint32(40,true);;
    decframeinfo.uDpbIdx = dv.getUint32(44,true);;              //The index of dpb
    decframeinfo.uPicFlag = dv.getUint32(48,true);;             //0: Frame; 1: Top filed; 2: Bottom field  
    decframeinfo.bError = dv.getUint32(52,true);;               //0: picture is correct; 1: picture is corrupted
    decframeinfo.bIntra = dv.getUint32(56,true);;               //0: intra picture; 1:inter picture
    //8�ֽڶ���
    decframeinfo.ullPTS = dv.getUint32(64,true);;               //Time stamp
    decframeinfo.uPictureID = dv.getUint32(72,true);          //The sequence ID of this output picture decoded
    decframeinfo.uReserved = dv.getUint32(76,true);            //Reserved for future
    decframeinfo.pUserData = dv.getUint32(80,true);   				//Pointer to the first userdata
	  decframeinfo.pFrameInfo = dv.getUint32(84,true); 					//Pointer to the output information of one frame
};



}

var MYQueue = (function Queue(){
	     function constructor(){
          this.dataStore = [];
        this.enqueue = enqueue;
        this.dequeue = dequeue;
        this.front = front;
        this.back = back;
        this.toString = toString;
        this.empty = empty;
        this.get_count=get_count;
        //this.lockflag = 0;
      }
      
//��ӣ������������ĩβ����һ��Ԫ��
function enqueue(elm)
{
	
	 //this.lockflag = 1;
	 this.dataStore.push(elm);
	 //this.lockflag = 0;
	
}
//���ӣ�����ɾ������ĵ�һ��Ԫ��
function dequeue(){
	  //this.lockflag = 1
    return this.dataStore.shift();
    //this.lockflag = 0
}
//ȡ������ĵ�һ��Ԫ��
function front(){
    return this.dataStore[0];
}
//ȡ����������һ��Ԫ��
function back(){
    return this.dataStore[this.dataStore.length-1];
}

function toString(){
    var retStr = "";
    for (var i=0; i<this.dataStore.length; ++i) {
        retStr += this.dataStore[i] + "&nbsp;"
    }
    return retStr;
}
//�ж������Ƿ�Ϊ��
function empty(){
    if(this.dataStore.length == 0){
        return true;
    }else{
        return false;
    }    
}
//����������Ԫ�صĸ���
function get_count(){
    return this.dataStore.length;
}
    
    return constructor;  
})();


 self.initglobal = function(){
   	self.q_video = new MYQueue();
 };

self.Put_Group_Frame=function(pframe,gtype){
	if(gtype === 0)
	{
		//���Ǳ�Ҫ������,�Ȼ�������
		self.g_buf_frame = pframe;
		self.g_rec_pos = 0;//pframe.u32AVFrameLen; //pframe.u32AVFrameLen;
	}
	else
	{
		if(self.g_rec_pos === 0){
			array_copy(self.g_rec_buf,0,self.g_buf_frame.payload,self.g_buf_frame.u32AVFrameLen);
			self.g_rec_pos = self.g_buf_frame.u32AVFrameLen;
		}
		
		
		array_copy(self.g_rec_buf , self.g_rec_pos ,pframe.payload,pframe.u32AVFrameLen);
		self.g_buf_frame.u32AVFrameLen += pframe.u32AVFrameLen;
		self.g_buf_frame.payloadLen = self.g_buf_frame.u32AVFrameLen;
		self.g_rec_pos = self.g_buf_frame.payloadLen;
		
	}
};

self.Get_Group_Frame=function(){
	if(self.g_rec_pos === 0 )
	{
	   return self.g_buf_frame;
	 }
	else
	{
		  var tt = new Uint8Array(self.g_rec_buf);
		  var gg = new ArrayBuffer(self.g_rec_pos);
		  var dg = new Uint8Array(gg);
		  dg.set(tt.subarray(0,self.g_rec_pos));
		  
	    self.g_buf_frame.payload = dg;
	    return self.g_buf_frame;
	}
};

//�����������
self.decoder = null;
self.g_dec_frame_s = null;

self.g_dec_frame_buf = null;
self.g_decHandle = null;
self.g_codetype = 0; //0-264,1-265
self.q_video = null;
self.g_width = 640;
self.g_height = 352;
self.decoder = null;

//20191212
//֡������
self.g_buf_frame = null;
self.g_rec_buf = null;
self.g_rec_pos = 0;
self.CurPTS = 0;

 self.initglobal();
 
self.onmessage = function (evt) {
    
     
     var data = evt.data;
     switch(data.vtype)
     {
     	 case DATA_SYSTEMHEADER:
     	 {
     	 	 var ww=data.picw;
         var hh = data.pich;
         var codetype = data.codetype;
         self.g_codetype = codetype;
         self.g_width = ww;
         self.g_height = hh;
         if(self.g_decHandle != null){
           self.decoder.Hi265DecDestroy(self.g_decHandle);
           self.g_decHandle = null;
         }
          
          if(self.g_rec_buf != null)
            self.g_rec_buf = null;
             
          self.g_rec_buf = new ArrayBuffer(ww*hh*3/2);
     	  self.g_rec_pos = 0;
    
         console.log('sysheader:codec-' +codetype + ' widht=' +ww + ' height='+ hh );
         console.log('create decoder...');
         if(self.decoder !=null)
         {
         if(codetype === 1)
          self.g_decHandle=self.decoder.Hi265DecCreate(ww,hh);
         else
         	self.g_decHandle = self.decoder.Hi264DecCreate(ww,hh);
         	
         	self.g_codetype = codetype;
         	setTimeout(self.processdata,5);
        }
        else{
         	console.log('start createDecorder');
         	setTimeout(self.createDecorder,10);
        }
     	 }
     	 break;
     	 
     	 case DATA_VIDEO_DATA:
     	 {
     	 	var  frameData = new Uint8Array(data.buf);
     	 	 var frame = new HI_AVFrame(frameData.buffer);
     	 	 if(frame.u32AVFrameFlag == 0x46565848){
     	 	 	     	 	
     	 	 if(self.CurPTS == 0 || self.CurPTS  === frame.u32AVFramePTS)
     	 	  {
     	 	    if(self.CurPTS == 0){
      			self.CurPTS = frame.u32AVFramePTS;
      		  	self.Put_Group_Frame(frame,0);	
      		  }
      		  else
      		  {
      			self.Put_Group_Frame(frame,1);	
      		  }
      	   }
      	   else
      	   {
     	 	 	   
     	 	 	   self.CurPTS  = frame.u32AVFramePTS;
      			var curFrame = self.Get_Group_Frame();
      			self.Put_Group_Frame(frame,0);
      		
     	 	  	self.q_video.enqueue(curFrame);
     	 	   }
     	 	   
     	 	   //self.q_video.enqueue(frame);
     	 	  
     	 	 }
     	 	  else
     	 	  	{
     	 	  		console.log('recv error frame:'+ frame.u32AVFrameFlag);
     	 	  	}
     	 	  	
     	 	  	//console.log('q_video.length=' + qcount);
     	 }
     	 break;
     }
 
};

self.createDecorder = function(){
	
	console.log('createDecorder first-->decoder=' + self.decoder);
	if(self.decoder)
	{
				
		if(!self.decoder.wasmLoaded)
		{
			 console.log('libffmpeg.wasm is loading...');
			 
			 setTimeout(self.createDecorder,50);
		}
		else
			{
				if(self.g_codetype == 1)
				{
					self.g_decHandle=self.decoder.Hi265DecCreate(self.g_width,self.g_height);
				}
			else
				{
					self.g_decHandle = self.decoder.Hi264DecCreate(self.g_width,self.g_height);
				}
			
				console.log('self.g_decHandle ' + self.g_decHandle);
			
				setTimeout(self.processdata,5);
		}
			
				  
		 
	}
	else
		{
			console.log('decoder is null ,libffmpeg.wasm is loading...');
			setTimeout(self.createDecorder,50);
		}
			
};

self.processdata = function(){
            
      if(self.q_video.get_count() >= 1 && self.g_decHandle != 0)
      {
     
      	var frame = self.q_video.dequeue();
      	
        
        if(self.decoder != null )
        {
        	if(self.g_codetype === 0)
        	{
        	var ret = self.decoder.Hi264DecFrame(self.g_decHandle,frame.payload,frame.u32AVFrameLen,frame.u32AVFramePTS,self.g_dec_frame_s,0);
        	if(ret === 0)
        	{
        		//console.log('dec a pic');
        	}
        	else
        		{
        			//console.log('Hi264DecFrame ret=' + ret);
        		}
        	 
        	         	
        	}
        	else
        	{

						//console.log('frame type=' + frame.u32AVFrameType + ' len='+ frame.u32AVFrameLen);
        		var ret = self.decoder.Hi265DecFrame(self.g_decHandle,frame.payload,frame.u32AVFrameLen,frame.u32AVFramePTS,self.g_dec_frame_s,0);
        		if(ret === 0)
        		{
        			//console.log('dec a pic');
        	  }
        	  else
        		{
        			//console.log('Hi265DecFrame ret=' + ret);
        		}
        			
          }
        }
        //self.print_frame(frame);
      }
     
      setTimeout(self.processdata,2); 
   };
   
  function onWasmLoaded() {
    if (self.decoder) {
        self.decoder.onWasmLoaded();
    } 
    else {
        console.log("[ER] No decoder!");
    }
}