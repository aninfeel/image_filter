//var requestNextFrame=window.requestAnimationFrame;
var $readyDeferred = $.Deferred(),frameDuration,frameStart=Date.now(),frameCount= 0,frameFunc=function(){
    if(++frameCount==100){
        frameDuration=(Date.now()-frameStart)/100;
        go();
        return;
    }

    requestAnimationFrame(frameFunc);
};
requestAnimationFrame(frameFunc);

var $imgLoadDeferred=$.Deferred();

(function() {
    // try to create a WebGL canvas (will fail if WebGL isn't supported)
    var canvas;
    try {
        canvas = fx.canvas();
    } catch (e) {
        alert(e);
        return;
    }

    var image = document.getElementById('image');

    var imageLoaded=function(){
        var texture = canvas.texture(image);
        image.parentNode.insertBefore(canvas, image);
        image.parentNode.removeChild(image);
        canvas.draw(texture).update();

        $('#start').on('click',function(){
            $readyDeferred.done(function(animate){
                var selecteds=$('#operation input:checked').toArray().map(function(e){return e.value});
                var c={};
                for(var i=0;i<selecteds.length;i++){
                    c[selecteds[i]]=config[selecteds[i]];
                }
                animate(canvas,texture,c,configParam);
            });
        });
    };
    $(image).on('load',imageLoaded);

})();

function go(){
    function animate(canvas,texture,config,configParam){
        var runner=[],runConfig=[],maxTotal= 0,filter;
        for(filter in config){
            var segments=config[filter],
                diffs=[];

            var i= 1,total= 0,segment0=segments[0],segment1,duration,maxCount,diffArg,arg0=segment0.slice(1),arg1;
            while(segment1=segments[i++]){
                duration=(segment1[0]-segment0[0])*1000;
                maxCount=duration/frameDuration;
                arg1=segment1.slice(1);
                diffArg=arg0.map(function(a,i){
                    return (arg1[i]-a)/maxCount;
                });

                total+=maxCount;
                diffArg.splice(0,0,total);
                diffs.push(diffArg);
                segment0=segment1;
                arg0=arg1;
            }

            if(configParam[filter]){
                runner.push(canvas[filter].apply(canvas,configParam[filter]));
            }else{
                runner.push(canvas[filter])
            }
            runConfig.push({
                args:segments[0].slice(1),
                diffs:diffs,
                total:total
            });

            maxTotal=Math.max(maxTotal,total);
        }

        var count=0;
        var draw=function(){
            var filter,rc,args,diffs,diff,ci,cl,i,l,ii,ll;
            canvas.draw(texture);
            for(ci=0,cl=runConfig.length;ci<cl;ci++){
                rc=runConfig[ci];

                if(rc.total<count){
                    continue;
                }
                diffs=rc.diffs;

                for(i=0,l=diffs.length;i<l;i++){
                    var diff=diffs[i];
                    if(diff[0]>=count){
                        args=rc.args;
                        for(ii=0,ll=args.length;ii<ll;ii++){
                            args[ii]+=diff[ii+1];
                        }
                        runner[ci].apply(canvas,args);
                        break;
                    }
                }
            }

            if(count++<maxTotal){
                canvas.update();
                requestAnimationFrame(draw);
            }else{
                for(var i=0;i<runner.length;i++){
                    runner[i].destroy && runner[i].destroy();
                }
            }
        };

        draw();
    }

    $imgLoadDeferred.done(function(){
        $readyDeferred.resolve(animate);
    });
}

var config={
    hueSaturation:[
        [0,0,0],
        [5,0,-1]
    ],
    'opacityLayer':[
        [0,0],
        [1,255],
        [3,255],
        [5,0]
    ],
    brightnessContrast:[
        [0,0,0],
        [2.5,0,72.0/254],
        [5,0,0]
    ],
    vignette:[
        [0,0.5,0.4],
        [2.5,0.5,0.8],
        [5,0.5,0.4]
    ]
};

var configParam={
    'opacityLayer':['images/ramp1.png']
}

var cacheRamp1=new Image();
cacheRamp1.src='images/ramp1.png';
cacheRamp1.onload=function(){
    $imgLoadDeferred.resolve();
}