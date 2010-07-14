
var indent = "";
function var_dump(arr, showTypes){
    var result = "";
    var t = typeof(arr);
    if(showTypes) result+="("+t+")";
    result+=" ";
    if (t=="object" || t=="function"){
        result+="{<br>";
        indent += "&nbsp;&nbsp;&nbsp;&nbsp;";
        for (var n in arr){
            result+=indent + "["+n+"]"+var_dump(arr[n]);
        }
        indent = indent.substr(24);
        result+=indent+"}<br>";
    }
    else if(arr!=null) result+= arr.toString() + "<br>";
    else result+= "null<br>";



    document.getElementById('debug').innerHTML=
        document.getElementById('debug').innerHTML+result;

    return result;
}




// annots is an object containing the coordinates for the rectangles and
// text we want to draw on the canvas.  It should already be defined.
function ColorList() {}


colors = new ColorList();
colors.white = "#ffffff";
colors.red = "#ff0000";
colors.green = "#00ff00";
colors.blue = "#0000ff";
colors.orange = "#ff8040";
colors.purple = "#800080";
colors.black = "#000000";

function JSONSequencePicture( sequence_length, size ){
    if (size == null) size = [1000,5000];
    this.SUFFIX = '.js';
    this.colors = colors;

    this.SEQUENCE_HEIGHT = 2;

    this.SEQUENCE_TICK_HEIGHT = 6;
    this.SEQUENCE_TICK_WIDTH = 2;

    this.SEQUENCE_BASE = 50;                 // horizontal margin
    this.SEQUENCE_OFFSET = 50;               // vertical margin
    this.SEQUENCE_TEXT_OFFSET = 48;          // vertical margin for text

    this.FEATURE_HEIGHT = 8;
    this.THIN_FEATURE_HEIGHT = 2;
    this.THIN_FEATURE_OFFSET = 3;
    this.FEATURE_SPACING = 12;



    //  __init__
    this.size = size;
    // resolution controls the granularity used to calculate overlaps.
    this.resolution = size[0] / 2;        // good default?
    // sequence_length is used only to calculate the tick spacing
    this.sequence_length = sequence_length;


    this.left_margin_offset = 0;

    // for final y-cropping.
    this.max_y = 2*this.SEQUENCE_OFFSET + this.SEQUENCE_HEIGHT;



    this.rectangles = [];
    this.texts = [];




    this.set_left_margin_offset=function(x){
        x+=0 // convert to number... should be int
        this.left_margin_offset = x + this.SEQUENCE_BASE;

        this.w = this.size[0] + x;
        this.h = this.size[1];

        var canvas_width = this.w - this.SEQUENCE_BASE - this.left_margin_offset;
        this.seq_to_canvas = canvas_width / this.resolution;
    }

    this.set_left_margin_offset(0);

    this.draw_sequence_line=function(){
        //Draw the black line at the top representing the sequence with ticks
        //indicating resolution.

        var start_x = this.left_margin_offset;
        var start_y = this.SEQUENCE_OFFSET + this.SEQUENCE_TICK_HEIGHT / 2
                  - this.SEQUENCE_HEIGHT / 2;

        var w = this.w - this.SEQUENCE_BASE - this.left_margin_offset;
        var h = this.SEQUENCE_HEIGHT;

        this.rectangles.push({"rect":[start_x, start_y, w, h],
                            "fill":colors.black});

        this._calc_tick_spacing();
        var n_ticks = this.sequence_length / this.TICKSPACING;
        //ticklocations = [ i * this.TICKSPACING for i in range(n_ticks + 1) ]

        var ticklocations = [];
        for (i=0;  i< n_ticks + 1; i++ ){
            ticklocations.push(i * this.TICKSPACING);
        }

        start_y = this.SEQUENCE_OFFSET;

        // conversion factor
        w = this.w - this.SEQUENCE_BASE - this.left_margin_offset;
        var seq_to_canvas = w / this.sequence_length;

        for each (var loc in ticklocations){
            start_x = this.left_margin_offset + Math.floor(loc * seq_to_canvas);

            this.rectangles.push({"rect":[start_x, start_y,
                                    this.SEQUENCE_TICK_WIDTH,
                                    this.SEQUENCE_TICK_HEIGHT],
                                    "fill":colors.black});
        }
    }

//    this._draw_feature(slot, start, stop, color=None, name=''){
    this._draw_feature = function(slot, start, stop, color, name){

        //Draw an annotation, or part of an annotation, as a thick line.

        if (color == null){
            color = this.colors.red;
        }

        var start_y = this.SEQUENCE_OFFSET + (slot+1)*this.FEATURE_SPACING;


        var start_x = Math.floor(start*this.seq_to_canvas + 0.5) + this.left_margin_offset;
        var width = Math.floor( (stop - start) * this.seq_to_canvas + 0.5 );
        width = Math.max(width, 1);

        this.rectangles.push({"rect":[start_x, start_y, width, this.FEATURE_HEIGHT ],
                            "fill":color, "outline":colors.black});
        this.max_y = Math.max(start_y + this.FEATURE_HEIGHT, this.max_y);



    }

    this._draw_feature_name=function(name, start_x, slot){
        //Draw the name of the annotation next to it.

        start_x = Math.floor( (start_x) * this.seq_to_canvas + 0.5);
        start_x += this.left_margin_offset;

        var start_y = this.SEQUENCE_TEXT_OFFSET + (slot + 1.75)*this.FEATURE_SPACING;

        // use js to calculate text width and x poisitioning
        var xsize = this._calc_textsize(name)[0];
        this.texts.push({"text":[name, start_x - xsize, start_y],
                            "fill":colors.black} );
    }

    this._calc_textsize=function(text){

        //Calculate the width of the text label for an annotation.

        var text_size = text.length*7;
        return [text_size];
    }


//    this._draw_thin_feature=function(slot, start, stop, color=None){
    this._draw_thin_feature=function(slot, start, stop, color){
        //Draw an annotation as a thin line.

        if (color == null){
            color = this.colors.red;
        }
        var start_y = this.SEQUENCE_OFFSET + (slot+1)*this.FEATURE_SPACING +
                  this.THIN_FEATURE_OFFSET;

        var start_x = Math.floor(start*this.seq_to_canvas+0.5) + this.left_margin_offset;
        var width = Math.floor( (stop - start) * this.seq_to_canvas + 0.5);
        width = Math.max(width, 1);

//        if width + start_x > this.w - this.SEQUENCE_OFFSET:
//            width = this.w - this.SEQUENCE_OFFSET - start_x

        this.rectangles.push({"rect":[start_x, start_y, width,
                                this.THIN_FEATURE_HEIGHT],
                                "fill":color, "outline":color});
        this.max_y = Math.max(start_y + this.THIN_FEATURE_HEIGHT, this.max_y);
    }


    this.set_left_margin_offset=function(x){
        this.left_margin_offset = x;
    }


    this._calc_tick_spacing=function(){
        for (var tickunit=12; tickunit > 0;  tickunit--){//in range(12, 0, -1):
            if (Math.floor(this.sequence_length / Math.pow(10,tickunit)) >= 2)
                break;
        }

        this.TICKSPACING = Math.pow(10,tickunit);
    }




//    this.draw_annotations=function(nlmsa, start_slot=0){
    this.draw_annotations=function(annotations){
        for each (var annotation in annotations){


            var name = annotation[0];

            // we need to perserve name, so we will have to determine if it
            // is a group some other way than naming it 'thin'
            var is_group=false;
            if (name.substr(0,4)=="thin"){
                is_group=true;
                name=name.substr(4);
            }

            var slot = annotation[1];

//            feat_start = annotation.feature_start
            var start = annotation[2];

//            stop = annotation.sequence.stop
            var stop = annotation[3];

//            color = annotation.color
            var color = annotation[4];

            //this._draw_feature_name(name, start, slot);

            if (is_group){
                this._draw_thin_feature(slot, start, stop, color, name );
            }else{

                this._draw_feature(slot, start, stop, color, name);
            }
        }


        return {"rectangles":this.rectangles,"texts":this.texts};
    }


}






function Draw(){

    //$.ajax({url:"http://lyorn.idyll.org:8000/js/json-canvas-draw.js", dataType: 'script', method:'get'});
    //$.ajax({url:"http://lyorn.idyll.org:8000/js/preprocessed.js", dataType: 'json', method:'get', success:function(data){annots=data;}});
    console.log("starting draw!");

    var j = new JSONSequencePicture(annots.length);
    j.draw_sequence_line();
    var rectangles= j.draw_annotations(annots);

    

    var canvas = document.getElementById("canvas");
    if (!canvas.getContext) {
        console.log("unable to get canvas context");
        return;
    }

    var ctx = canvas.getContext('2d');

    console.log("Now drawing "+rectangles["rectangles"].length+" rectangles");
    for each (var r in rectangles["rectangles"]){
        ctx.fillStyle = r["fill"];
        ctx.fillRect(
            r["rect"][0],
            r["rect"][1],
            r["rect"][2],
            r["rect"][3]
            );

        
        // this is causing canvas warnings
        //ctx.strokeStyle = r["outline"];
        ctx.strokeRect(
            r["rect"][0],
            r["rect"][1],
            r["rect"][2],
            r["rect"][3]
            );
    }

    console.log("drawing texts");
    
    for each (var t in rectangles["texts"]){
        console.log(t);
        ctx.fillStyle = t["fill"];
        ctx.fillText(
            t["text"][0],
            t["text"][1],
            t["text"][2]
            );
    }
    
    console.log("Finished Drawing!");

}

function showInterval(relation){

    var obj = {
        rel: relation,
        sequence: sequence,
        start: start,
        stop: stop,
        dataType: 'json'
    };


    if(relation=='view'){
        // they clicked the view button instead of a link
        obj.sequence = $('input[name="sequence"]').val();
        obj.start = $('input[name="start"]').val();
        obj.stop = $('input[name="stop"]').val();
    }

    // add a "known" field to avoid duplicate requesting of the same dataz
    // this information should be kept in annots, or another obj that keeps track
    // of this information. start, stop, sequence should be in there too.
    //
    // add "rbound" and "lbound" fields that can be 'inclusive' or 'exclusive'
    // to determine if annotations that overlap the boundaries should be included.
    // this should avoid duplicates.  however, slot calculations may be problematic.
    // 


    // for this ajax call the we
    // send:
    //      rel: relation - "view", "left", "right", "zin", "zout"
    //      sequence:
    //      start: - set for all request so later we can trim dataz
    //      stop:  - set for all request so later we can trim dataz
    //
    // recieve:
    //      sequence:
    //      start:
    //      stop:
    //      data: the new annots object
    //
    
    console.log(obj);
    $("#canvas").hide();
    $("#loading").show();
    $.ajax({
        url:"../json",
        method: 'post',
        data: obj,
        dataType: 'json',
        success: function(data, textStatus, XMLHttpRequest){
            sequence = data.sequence;
            start = data.start;
            stop = data.stop;
            // later this data should be appended to annots
            annots = eval(data.data);


            $('input[name="sequence"]').val(sequence);
            $('input[name="start"]').val(start);
            $('input[name="stop"]').val(stop);
            var title = 'Interval: '+sequence+' from '+start+' to '+stop;
            $('#interval').html(title);
            document.title = title;

            // we want to change the displayed url, but we have to change some
            // server stuff first because we can't change teh address.  we only
            // have access to the hash or the get request.
//            window.location.get = "sequence="+sequence+"&start="+start+"&stop="+stop;
//            window.location.hash = sequence+":"+start+"-"+stop;


            // draw last so texts are updated without the lag of Draw.
            $("#canvas").show();
            $("#loading").hide();
            Draw();
        },
        error: function(xhr, textStatus, errorThrown){
            $("#error").html(xhr.status+" "+xhr.statusText+"<br>"+
                        xhr.responseText.replace(/\n/g, "<br>").replace(/ /g, "&nbsp;"));
            $("#canvas").show();
            $("#loading").hide();
        }
    });

}


// sequence, start and stop are global variables that will track the interval
// currently being displayed on the page
var annots={};
var sequence;
var start;
var stop;
$(function(){
    // when the page loads, grab sequence, start and stop from their text boxes
    sequence = $('input[name="sequence"]').val();
    start = $('input[name="start"]').val();
    stop = $('input[name="stop"]').val();

    $('input[name="view"]').click(function(){showInterval("view");});
    $("#left").click(function(){showInterval("left");});
    $("#zin").click(function(){showInterval("zin");});
    $("#zout").click(function(){showInterval("zout");});
    $("#right").click(function(){showInterval("right");});

    showInterval("view");
});

// we want to do an ajax request on load to get the data
//window.onload = Draw;