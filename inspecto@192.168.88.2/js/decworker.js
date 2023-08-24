if( 'undefined' === typeof window){
    importScripts('g711.js');
    this.that = this;
    that.g711_module = Module;
    
    that.decoderFunc = that.g711_module.cwrap('G711Decoder','number',['number','number','number','number']);
    that.encoderFunc = that.g711_module.cwrap('G711Encoder','undefined',['number','number','number','number']);
                 
    var AUDIO_FRAME_LEN = 160;
    
    function cptr_copy_to_arraybuffer(cptr,dst_array,bytesLen)
    {
        //��c++ָ���ڴ濽�����ݵ�arraybuffer�ڴ���
        var dv = new Uint8Array(dst_array);
        dv.set(that.g711_module.HEAPU8.subarray(cptr,cptr+bytesLen));
    }
    
    function cptr_copy_from_arraybuffer_1(cptr,src_array,bytesLen)
    {
        //��arraybuffer�ڴ��п������ݵ�c++ָ���ڴ�
        that.g711_module.writeArrayToMemory(new Uint8Array(src_array),cptr);
    }
    
    function cptr_copy_from_arraybuffer_2(cptr,src_array,bytesLen)
    {
        //��arraybuffer�ڴ��п������ݵ�c++ָ���ڴ�
        var dst_dvt = new Uint8Array(g711_module.HEAPU8.subarray(cptr,cptr+bytesLen));
        //var src_dvt = new Uint8Array(src_array.buffer);
        dst_dvt.set(src_array);
        //dvt.set(new Uint8Array(src_array));
    
        
    }
    
     
     onmessage = function (event)
     {
     var dv = event.data;
     var audioG711data =new Uint8Array(dv.buffer);
     //console.log('recv main thread data:'+audioG711data.length);
     var headLen = 24;
     var dataLen = audioG711data.length;
      AUDIO_FRAME_LEN = dataLen - headLen;
      var short16Buf = that.g711_module._malloc(2*AUDIO_FRAME_LEN);
      var char8Buf =   that.g711_module._malloc(AUDIO_FRAME_LEN);
      
      that.g711_module._memset(short16Buf,0,2*AUDIO_FRAME_LEN);
      that.g711_module._memset(char8Buf,0,1*AUDIO_FRAME_LEN);
          
      
      that.g711_module._memset(short16Buf,0,2*AUDIO_FRAME_LEN);
      that.g711_module._memset(char8Buf,0,1*AUDIO_FRAME_LEN);
        
                   
      var frameP = new Uint8Array(audioG711data.subarray(headLen,headLen +  AUDIO_FRAME_LEN));
      cptr_copy_from_arraybuffer_1(char8Buf,frameP,AUDIO_FRAME_LEN);
                        
      that.decoderFunc(short16Buf,char8Buf,AUDIO_FRAME_LEN,0);
          
       var dv2 = new Uint8Array(that.g711_module.HEAPU8.subarray(short16Buf,short16Buf+2*AUDIO_FRAME_LEN));
       var wavdata = new ArrayBuffer(dv2.length);
       var wavview = new Uint8Array(wavdata);
       wavview.set(dv2);
          
       var dv = new DataView(wavdata);
       postMessage(dv,[dv.buffer]);
            
      
      g711_module._free(short16Buf);
      g711_module._free(char8Buf);
    
     };
    }
    
    
    