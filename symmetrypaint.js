function makeEventXY(canvas) {
    return {
        "x": function(e) {
            return e.offsetX != undefined
                 ? e.offsetX
                 : e.pageX - canvas.offset().left;
        },
        "y": function(e) {
            return e.offsetY != undefined
                 ? e.offsetY
                 : e.pageY - canvas.offset().top;
        }
    };
}

function setColor(ctx, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
}

function slider(min, max, defaultValue, onUpdate) {
    var container = $('<div class="slider">');

    var field = $('<input type="number">');
    field.attr("min", min);
    field.attr("max", max);
    container.append(field);
    
    var slider = $('<input type="range">');
    slider.attr("min", min);
    slider.attr("max", max);
    container.append(slider);
            
    var sliderObj = {
        "container": container,
        "slider": slider,
        "field": field,
        "value": undefined,
        "default": defaultValue
    };
                                                            
    var updateValue = function(value) {
        sliderObj.value = value;
        slider.attr("value", value);
        field.attr("value", value);
        if(onUpdate) {
            onUpdate(value);
        }
    };
    updateValue(defaultValue);

    slider.on("input change", function(e) {
        var value = slider.attr("value");
        updateValue(value);
    });
    
    field.on("input change", function(e) {
        var value = field.attr("value");
        updateValue(value);
    });
    
    return sliderObj;
}

function rgbSliders(ctx) {
    var container = $('<div class="sliders">');

    var slidersObj = {
        "container": container,
        "value": {},
        "cssColor": undefined
    };
    
    var colorBox = $('<div class="colorbox">');
    container.append(colorBox);
    
    var ranges = $('<div class="ranges">');
    {
        var components = ["red", "green", "blue"];
        for(var i = 0; i < components.length; i++) {
            var component = components[i];

            slidersObj.value[component] = undefined;
            var updateComponent = function(comp) {
                return function(value) {
                    var rgb = slidersObj.value
                    rgb[comp] = value;
                
                    var color = "rgb("
                              + components.map(function(c) { return rgb[c] }).join(", ")
                              + ")";
                    colorBox.css("background-color", color);
                    
                    if(ctx) {
                        setColor(ctx, color);
                    }
                };
            }(component);

            slidersObj[component] = slider(0, 255, 0, updateComponent);
            ranges.append(slidersObj[component].container);
        }
    }
    container.append(ranges);
        
    return slidersObj;
}

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
    
    var coord = makeEventXY(canvas);
    
    function fill() {
        ctx.fillRect(0, 0, width, height);
    }
    
    setColor(ctx, "#FFFFFF");
    fill();
    
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
    
    function sym_4_mirror(x, y) {
        var xs = sym_2_mirror_h(x, y);
        return [].concat.apply([], xs.map(function(p) {
            return sym_2_mirror_v(p.x, p.y);
        }));
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
        {name: "4-Mirror", func: sym_4_mirror, image: "4-mirror"},
        {name: "2-Rotate", func: sym_2_rotate, image: "2-rotate"},
        {name: "4-Rotate", func: sym_4_rotate, image: "4-rotate"}
    ];
    var symmetry;
    function setSymmetry(i) {
        symmetry = symmetries[i].func;
    }
    setSymmetry(0);
        
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
            ctx.arc(curr.x, curr.y, lineWidthSlider.value/2.0, 0, 2*Math.PI);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(last.x, last.y);
            ctx.lineWidth = lineWidthSlider.value;
            ctx.lineTo(curr.x, curr.y);
            ctx.stroke();
        }
        
        lastX = x;
        lastY = y;        
    }
    canvas.mousedown(function(e) {
        drawing = true;
        lastX = coord.x(canvas, e);
        lastY = coord.y(canvas, e);
        drawTo(coord.x(e), coord.y(e))
        e.preventDefault();
    });
    canvas.mousemove(function(e) {
        if(drawing) {
            drawTo(coord.x(e), coord.y(e));
        }
    });
    $(window).mouseup(function(e) {
        drawing = false;
    })
    
    var menu = $('<div id="menu">');
    
    var header = $('<h1>Symmetry Paint</h1>')
    menu.append(header);
    
    var github = $('<p id="github"><a href="https://github.com/ahihi/symmetrypaint">GitHub</a></p>')
    menu.append(github);
    
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
        
    var lineWidthSection = $('<section id="line-width-section">');
    var lineWidthSlider;
    {
        var lineWidthHeading = $("<h1>Line width:</h1>");
        lineWidthSection.append(lineWidthHeading);
        
        lineWidthSlider = slider(LINE_WIDTH_MIN, LINE_WIDTH_MAX, LINE_WIDTH_MIN);
        lineWidthSection.append(lineWidthSlider.container);
    }
    menu.append(lineWidthSection);
    
    var colorSection = $('<section id="color-section">');
    var colorSliders = rgbSliders(ctx);
    {
        colorSection.append($("<h1>Color:</h1>"));        
        colorSection.append(colorSliders.container);
    }
    menu.append(colorSection);
    
    var fillSection = $('<section id="fill-section">');
    {
        var fillButton = $("<button>Fill</button>");
        fillButton.click(function() {
            fill();
        });
        fillSection.append(fillButton);
    }
    menu.append(fillSection);
    
    var body = $("body");
    body.append(canvas);
    body.append(menu);
});
