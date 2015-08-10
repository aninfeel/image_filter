function opacityLayer(imageUrl) {

        var _this=this,
            $img=(function(url){
            var $this=$(this),
                $parent=$this.parent();
            var $img=$(document.createElement('img')).attr('src',url).css({
                position:'absolute',
                'z-index':$this.css('z-index'),
                width:$this.width(),
                height:$this.height(),
                opacity:0
            });
            $img.css($this.position());
            $parent.append($img);

            return $img;
        }).call(this,imageUrl);

    var fun= function(opacity){
        $img.css('opacity',opacity/255.0);
        return _this;
    };

    fun.destroy=function(){
        $img.remove();
    }

    return fun;
}
