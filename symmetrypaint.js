$(function() {
    var CANVAS_SIZE = 512;
    var LINE_WIDTH_MIN = 1;
    var LINE_WIDTH_MAX = 128;
        
    var canvas = $('<canvas id="canvas">');
    canvas.attr("width", CANVAS_SIZE);
    canvas.attr("height", CANVAS_SIZE);
    var width = canvas.attr("width");
    var height = canvas.attr("height");
    var ctx = canvas[0].getContext("2d");
    
    function clear() {
        ctx.fillStyle = colorValue(!color);
        ctx.fillRect(0, 0, width, height);
        setColor(color);
    }
    
    function sym_2_mirror_h(x, y) {
        return [
            {x: x, y: y},
            {x: width-x, y: y}
        ];
    }
        
    function sym_2_mirror_v(x, y) {
        return [
            {x: x, y: y},
            {x: x, y: height-y}
        ];
    }
        
    function sym_2_rotate(x, y) {
        return [
            {x: x, y: y},
            {x: width-x, y: height-y}
        ]
    }
    
    function sym_4_rotate(x, y) {
        var tx = y;
        var ty = width-x;
        return [
            {x: x, y: y},
            {x: width-x, y: height-y},
            {x: tx, y: ty},
            {x: width-tx, y: height-ty}
        ]
    }
    
    var symmetries = [
        {name: "2-Mirror Horizontal", func: sym_2_mirror_h, image: "2-mirror-h"},
        {name: "2-Mirror Vertical", func: sym_2_mirror_v, image: "2-mirror-v"},
        {name: "2-Rotate", func: sym_2_rotate, image: "2-rotate"},
        {name: "4-Rotate", func: sym_4_rotate, image: "4-rotate"}
    ];
    var symmetry;
    function setSymmetry(i) {
        symmetry = symmetries[i].func;
    }
    setSymmetry(0);
    
    var color;
    function colorValue(col) {
        return col ? "#000000" : "#FFFFFF";
    }
    function setColor(col) {
        color = col;
        var colorVal = colorValue(color);
        ctx.fillStyle = colorVal;
        ctx.strokeStyle = colorVal;
    };
    setColor(true);
    clear();
    
    var drawing = false;
    var lastX;
    var lastY;
    function drawTo(x, y) {
        var lasts = symmetry(lastX, lastY);
        var currs = symmetry(x, y);
        
        for(var i = 0; i < lasts.length; i++) {
            var last = lasts[i];
            var curr = currs[i];
            
            ctx.beginPath();
            ctx.moveTo(last.x, last.y);
            ctx.arc(curr.x, curr.y, lineWidth/2.0, 0, 2*Math.PI);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(last.x, last.y);
            ctx.lineWidth = lineWidth;
            ctx.lineTo(curr.x, curr.y);
            ctx.stroke();
        }
        
        lastX = x;
        lastY = y;        
    }
    function eventX(e) {
        return e.offsetX != undefined ? e.offsetX : e.layerX;
    }
    function eventY(e) {
        return e.offsetY != undefined ? e.offsetY : e.layerY;
    }
    canvas.mousedown(function(e) {
        drawing = true;
        lastX = eventX(e);
        lastY = eventY(e);
        drawTo(eventX(e), eventY(e))
        e.preventDefault();
    });
    canvas.mousemove(function(e) {
        if(drawing) {
            drawTo(eventX(e), eventY(e));
        }
    });
    canvas.mouseup(function(e) {
        drawing = false;
    })
    
    var menu = $('<div id="menu">');
    
    var symmetrySection = $('<section id="symmetry-section">');
    {
        symmetrySection.append($("<h1>Symmetry:</h1>"));
        
        symmetryList = $("<ul>");
        for(var i = 0; i < symmetries.length; i++) {
            var sym = symmetries[i];
            var li = $("<li>");
            {
                var id = "symmetry-" + i;
                
                var symRadio = $('<input type="radio" name="symmetry">');
                symRadio.attr("id", id);
                symRadio.attr("value", i);
                if(i == 0) {
                    symRadio.attr("checked", "checked");
                }
                (function(j) {
                    symRadio.click(function() {
                        setSymmetry(j);
                    });
                })(i);
                li.append(symRadio);
                
                var symLabel = $('<label>');
                symLabel.attr("for", id);
                symLabel.text(sym.name);
                var symImg = $("<img>");
                symImg.attr("src", sym.image + ".png");
                symLabel.prepend(symImg);
                li.append(symLabel);
            }
            symmetryList.append(li);
        }
        symmetrySection.append(symmetryList);
    }
    menu.append(symmetrySection);
    
    var lineWidth = LINE_WIDTH_MIN;
    var lineWidthSection = $('<section id="line-width-section">');
    {
        var lineWidthHeading = $("<h1>");
        lineWidthSection.append(lineWidthHeading);
        
        var lineWidthCtl = $('<input type="range" id="line-width">');
        lineWidthCtl.attr("min", LINE_WIDTH_MIN);
        lineWidthCtl.attr("max", LINE_WIDTH_MAX);        
        lineWidthCtl.attr("value", lineWidth);
        lineWidthSection.append(lineWidthCtl);

        function updateLineWidth() {
            var newLineWidth = lineWidthCtl.attr("value");
            if(/^\d+$/.test(newLineWidth)) {
                lineWidth = Math.max(LINE_WIDTH_MIN, Math.min(LINE_WIDTH_MAX, parseInt(newLineWidth)));
            }
            lineWidthCtl.attr("value", lineWidth);
            lineWidthHeading.text("Line width: " + lineWidth);
        }
        lineWidthCtl.change(function(e) {
            updateLineWidth()
        });
        updateLineWidth();
        
    }
    menu.append(lineWidthSection);
    
    var colorSection = $('<section id="color-section">');
    {
        colorSection.append($("<h1>Color:</h1>"));
        
        var colorList = $("<ul>");
        {
            var blackLi = $("<li>");
            {
                var blackRadio = $('<input type="radio" id="color-black" name="color" value="black" checked>');
                blackRadio.click(function() {
                    setColor(true);
                });
                blackLi.append(blackRadio);
                blackLi.append($('<label for="color-black">Black</label>'));
            }
            colorList.append(blackLi);
            
            var whiteLi = $("<li>");
            {
                var whiteRadio = $('<input type="radio" id="color-white" name="color" value="white">');
                whiteRadio.click(function() {
                    setColor(false);
                });
                whiteLi.append(whiteRadio);
                whiteLi.append($('<label for="color-white">White</label>'));
            }
            colorList.append(whiteLi);
        }
        colorSection.append(colorList);
    }
    menu.append(colorSection);
    
    var clearSection = $('<section id="clear-section">');
    {
        var clearButton = $("<button>Clear</button>");
        clearButton.click(function() {
            clear();
        });
        clearSection.append(clearButton);
    }
    menu.append(clearSection);
    
    var body = $("body");
    body.append(canvas);
    body.append(menu);
});