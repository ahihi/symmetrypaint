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
    
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    
    var color;
    function setColor(col) {
        color = col;
        var colorVal = color ? "#000000" : "#FFFFFF";
        ctx.fillStyle = colorVal;
        ctx.strokeStyle = colorVal;
    };
    setColor(true);
    
    var drawing = false;
    var lastX;
    var lastY;
    function drawTo(x, y) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.arc(x, y, lineWidth/2.0, 0, 2*Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineWidth = lineWidth;
        ctx.lineTo(x, y);
        ctx.stroke();
        
        lastX = x;
        lastY = y;        
    }
    canvas.mousedown(function(e) {
        drawing = true;
        lastX = e.offsetX;
        lastY = e.offsetY;
        drawTo(e.offsetX, e.offsetY)
        e.preventDefault();
    });
    canvas.mousemove(function(e) {
        if(drawing) {
            drawTo(e.offsetX, e.offsetY);
        }
    });
    canvas.mouseup(function(e) {
        drawing = false;
    })
    
    var menu = $('<div id="menu">');
    
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
    
    var body = $("body");
    body.append(canvas);
    body.append(menu);
});