//Player request.

const DECCODE_264         	= 0;
const DECCODE_265         	= 1;

const DATA_SYSTEMHEADER		  = 2;
const DATA_AV_DATA					=3;
const DATA_VIDEO_DATA				=4;
const DATA_AUDIO_DATA				=5;

function H264_DEC_FRAME_S()
{
	  this.yuvdata = null;
    this.pY = null;                   //Y plane base address of the picture
    this.pU = null;                   //U plane base address of the picture
    this.pV = null;                   //V plane base address of the picture
    this.uWidth =0;               //The width of output picture in pixel
    this.uHeight = 0;              //The height of output picture in pixel
    this.uYStride = 0;             //Luma plane stride in pixel
    this.uUVStride = 0;            //Chroma plane stride in pixel
    this.uCroppingLeftOffset  = 0;  //Crop information in pixel
    this.uCroppingRightOffset = 0; 
    this.uCroppingTopOffset = 0;   
    this.uCroppingBottomOffset = 0;
    this.uDpbIdx = 0;              //The index of dpb
    this.uPicFlag = 0;             //0: Frame; 1: Top filed; 2: Bottom field  
    this.bError = 0;               //0: picture is correct; 1: picture is corrupted
    this.bIntra = 0;               //0: intra picture; 1:inter picture
    this.ullPTS = 0;               //Time stamp
    this.uPictureID = 0;           //The sequence ID of this output picture decoded
    this.uReserved = 0;            //Reserved for future
    this.pUserData = 0;   //Pointer to the first userdata
	  this.pFrameInfo = null; //Pointer to the output information of one frame
}

function HISYSHEADER(data)
{
  	var dv = new DataView(data);
   	this.u32SysFlag = dv.getUint32(0,true);
    //console.log('header: ' + this.u32Flag);
    this.u32Width = dv.getUint32(4,true);
    this.u32Height = dv.getUint32(8,true);
    this.u32Format = dv.getUint32(12,true);
}
    
 function HI_AVFrame(data)
 {
    	
    	var dv = new DataView(data);
    	this.daollar = dv.getUint8(0,true);
    	this.channelid = dv.getUint8(1,true);
    	this.resv = dv.getUint16(2,true);
    	this.payloadLen = dv.getUint32(4,false);
    	this.payloadLen = this.payloadLen- 12;
    	    	
    	this.pt = dv.getUint8(9,true)& 0x7f;
    	this.seq=dv.getUint16(10,true) | 0;
    	
    	this.u32AVFramePTS = dv.getUint32(12,false)|0;
    	
    	if(this.pt === 49 || this.pt === 96 || this.pt === 100) //265
    	  this.u32AVFrameFlag = 0x46565848;
    	else if(this.pt === 8 || this.pt ===97 || this.pt ===98) //8-G711,97-G726
    	 	this.u32AVFrameFlag = 0x46415848;
    	
      //console.log('header: ' + this.u32AVFrameFlag);
    	this.u32AVFrameLen = this.payloadLen;
   
    
     var dv2 = new Uint8Array(data);
    	this.payload = dv2.subarray(20,data.byteLength);
    	
    	if(this.pt === 49){
    	//if (((this.payload[4] >> 1) & 0x3F) == 0x13)
    	if ((this.payload[4] >> 1) === 32)
    	   	  this.u32AVFrameType = 1;
    	   	else
    	 	  	this.u32AVFrameType = 2; 
    	}
    	else if(this.pt === 96)
    	{
    	  		if ((this.payload[4] & 0x1F) === 0x1)
    	  		  this.u32AVFrameType = 2;
    	  		else
    	  			this.u32AVFrameType = 1;
    	}
    	else if(this.pt === 100)
    		{
    			this.u32AVFrameType = 1;
    		}
    	 	  	
 }
 
 self.print_header=function(hHeader)
 {
    	var pHeader = hHeader;
    	console.log('u32SysFlag=0x' + pHeader.u32SysFlag.toString(16));
    	console.log('u32Width=' + pHeader.u32Width);
    	console.log('u32Height=' + pHeader.u32Height);
    	console.log('u32Format=' + pHeader.u32Format);
 };
    
 self.print_frame = function(hFrame)
 {
    	var pFrame = hFrame;
    	console.log('frameFlag=0x' + pFrame.u32AVFrameFlag.toString(16));
    	console.log('frameLen=' + pFrame.u32AVFrameLen);
    	console.log('framePTS=' + pFrame.u32AVFramePTS);
    	console.log('frameType=' + pFrame.u32AVFrameType);
 };


