var backgroundColor = "#333333";
var lineColor = "#ffffffff";
var darkLineColor = "#555555";
var atlas = null;
var canvas = "#main-canvas";

var painter = {
    scale: 1,

    load_image(url) {
        return new Promise(r => {
            let i = new Image();
            i.onload = (() => r(i));
            i.src = url;
        });
    },

    get_context() { return $(canvas)[0].getContext('2d'); },

    fill(w, h, color) { painter.rect(0, 0, w, h, color); },

    rect(x, y, w, h, color) {
        let context = this.get_context();
        context.beginPath();
        context.rect(x, y, w, h);
        context.fillStyle = color;
        context.fill();
    },

    text(str, x, y, rotate = 0, align = "right", color = lineColor, size = 13, font = "Arial") {
        let ctx = this.get_context();
        ctx.save();
        ctx.translate(x, y);
        if (rotate > 0)
            ctx.rotate(rotate * Math.PI / 180);
        ctx.textAlign = align;
        ctx.font = size + "px " + font;
        ctx.fillStyle = color;
        ctx.fillText(str, 0, 0);
        ctx.restore();
    },

    line(x1, y1, x2, y2, width = 2, color = lineColor) {
        let ctx = this.get_context();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    },

    image(i, x, y) {
        let context = this.get_context();
        context.drawImage(i, x, y);
    },

    image_crop(i, x, y, w, h, cx, cy, cw, ch) {
        let context = this.get_context();
        context.drawImage(i, cx, cy, cw, ch, x * this.scale, y * this.scale, w * this.scale, h * this.scale);
    },

    resize_canvas() {
        $(canvas).css({"height": window.innerHeight, "width": window.innerWidth});
        $(canvas).attr("width", window.innerWidth);
        $(canvas).attr("height", window.innerHeight);
        painter.fill(window.innerWidth, window.innerHeight, backgroundColor);
        cs.resize(painter);
        painter.get_context().imageSmoothingEnabled = false;
    },

    draw_function() {
        c = $(canvas)[0];
        painter.fill(c.width, c.height, backgroundColor);
        cs.draw(painter);
        if (atlas !== null)
            config.draw(painter, cs);
    },

    update(time) {
        painter.draw_function();
        requestAnimationFrame(painter.update); // get next frame
    },
};

requestAnimationFrame(painter.update); // start animation

$(function() {
    $(window).on('resize', painter.resize_canvas);
    $(canvas).on('mousewheel', e => cs.scroll(e));
    $(canvas).on('click', e => cs.click(e));
    $(canvas).on('mousemove', e => cs.move(e));
    $(canvas).on('mouseup', e => cs.mouseup(e));
    $(window).on('keydown', e => config.on_button(e, true));
    $(window).on('keyup', e => config.on_button(e, false));
    $(canvas).on('contextmenu', function(e) {
        cs.click(e);
        e.preventDefault();
        return false;
    });

    painter.resize_canvas(); // Run once to get correct window size
    painter.load_image("../res/wasd.png").then(function(img) { atlas = img; });
    painter.get_context().imageSmoothingEnabled = false;

    $.getJSON('../res/wasd.json', function(data) { config.load_from_json(data); });
});
