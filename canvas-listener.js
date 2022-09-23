//Mostly based on https://codepen.io/chengarda/pen/wRxoyB
var CanvasListenerEventType;
(function (CanvasListenerEventType) {
    CanvasListenerEventType["pointerdown"] = "pointerdown";
    CanvasListenerEventType["pointerup"] = "pointerup";
    CanvasListenerEventType["pointerout"] = "pointerout";
    CanvasListenerEventType["pointerenter"] = "pointerenter";
    CanvasListenerEventType["pointermove"] = "pointermove";
    CanvasListenerEventType["pointerdrag"] = "pointerdrag";
    CanvasListenerEventType["pinch"] = "pinch";
    CanvasListenerEventType["wheel"] = "wheel";
})(CanvasListenerEventType || (CanvasListenerEventType = {}));
var CanvasListener = /** @class */ (function () {
    function CanvasListener(canvas) {
        var _this = this;
        this.isDragging = false;
        this._prevXYInvalid = true;
        this._prevX = 0;
        this._prevY = 0;
        this._prevPinchSizeInvalid = true;
        this._prevPinchSize = 0;
        this.onenvent = function (event) { };
        this.onpointermove = function (event) { };
        this.onpointerdown = function (event) { };
        this.onpointerup = function (event) { };
        this.onpointerout = function (event) { };
        this.onpointerdrag = function (event) { };
        this.onpointerenter = function (event) { };
        this.onwheel = function (event) { };
        this.onpinch = function (event) { };
        this.canvas = canvas;
        var getXY = function (event) {
            var canvasRect = _this.canvas.getBoundingClientRect();
            var xy = { x: 0, y: 0 };
            if (event.touches && event.touches.length >= 1) {
                xy.x = event.touches[0].clientX - canvasRect.x;
                xy.y = event.touches[0].clientY - canvasRect.y;
            }
            else if (event.clientX) {
                xy.x = event.clientX - canvasRect.x;
                xy.y = event.clientY - canvasRect.y;
            }
            else {
                xy.x = _this._prevX;
                xy.y = _this._prevY;
            }
            return xy;
        };
        var createEvent = function (event, eventType) {
            var xy = getXY(event);
            if (_this._prevXYInvalid) {
                _this._prevX = xy.x;
                _this._prevY = xy.y;
                _this._prevXYInvalid = false;
            }
            var lightCellEvent = {
                x: xy.x,
                y: xy.y,
                prevX: _this._prevX,
                prevY: _this._prevY,
                pinchSize: 0,
                prevPinchSize: 0,
                pinchX: 0,
                pinchY: 0,
                isDragging: _this.isDragging,
                type: eventType,
                wheelDelta: 0
            };
            _this._prevX = xy.x;
            _this._prevY = xy.y;
            return lightCellEvent;
        };
        var onPointerDown = function (event) {
            _this.isDragging = true;
            var parsedEvent = createEvent(event, CanvasListenerEventType.pointerdown);
            _this.onpointerdown(createEvent(event, CanvasListenerEventType.pointerdown));
            _this.onenvent(parsedEvent);
        };
        var onPointerUp = function (event) {
            _this.isDragging = false;
            var parsedEvent = createEvent(event, CanvasListenerEventType.pointerup);
            _this.onpointerup(parsedEvent);
            _this.onenvent(parsedEvent);
        };
        var onPointerMove = function (event) {
            var parsedEvent = createEvent(event, CanvasListenerEventType.pointermove);
            _this.onpointermove(parsedEvent);
            _this.onenvent(parsedEvent);
            if (_this.isDragging) {
                parsedEvent.type = CanvasListenerEventType.pointerdrag;
                _this.onpointerdrag(parsedEvent);
                _this.onenvent(parsedEvent);
            }
        };
        var onPointerOut = function (event) {
            _this.isDragging = false;
            var parsedEvent = createEvent(event, CanvasListenerEventType.pointerout);
            _this.onpointerout(parsedEvent);
            _this.onenvent(parsedEvent);
        };
        var onPointerEnter = function (event) {
            _this._prevXYInvalid = true;
            var parsedEvent = createEvent(event, CanvasListenerEventType.pointerenter);
            _this.onpointerenter(parsedEvent);
            _this.onenvent(parsedEvent);
        };
        var onWheel = function (event) {
            var parsedEvent = createEvent(event, CanvasListenerEventType.wheel);
            parsedEvent.wheelDelta = event.deltaY;
            _this.onwheel(parsedEvent);
            _this.onenvent(parsedEvent);
        };
        var onTouch = function (event, singleTouchHandler) {
            event.preventDefault();
            if (event.touches && event.touches.length >= 2) {
                var canvasRect = _this.canvas.getBoundingClientRect();
                var cx1 = event.touches[0].clientX - canvasRect.x;
                var cy1 = event.touches[0].clientY - canvasRect.y;
                var cx2 = event.touches[1].clientX - canvasRect.x;
                var cy2 = event.touches[1].clientY - canvasRect.y;
                var centerX = (cx1 + cx2) * 0.5;
                var centerY = (cy1 + cy2) * 0.5;
                var size = Math.pow((cx1 - cx2), 2) + Math.pow((cy1 - cy2), 2);
                size = Math.sqrt(size);
                if (_this._prevPinchSizeInvalid) {
                    _this._prevPinchSize = size;
                    _this._prevPinchSizeInvalid = false;
                }
                var pinchEvent = createEvent(event, CanvasListenerEventType.pinch);
                pinchEvent.pinchX = centerX;
                pinchEvent.pinchY = centerY;
                pinchEvent.pinchSize = size;
                pinchEvent.prevPinchSize = _this._prevPinchSize;
                _this._prevPinchSize = size;
                _this.onpinch(pinchEvent);
                _this.onenvent(pinchEvent);
            }
            else {
                _this._prevPinchSizeInvalid = true;
                singleTouchHandler(event);
            }
        };
        canvas.addEventListener('mousedown', onPointerDown);
        canvas.addEventListener('mouseup', onPointerUp);
        canvas.addEventListener('mousemove', onPointerMove);
        canvas.addEventListener('mouseleave', onPointerOut);
        canvas.addEventListener('mouseenter', onPointerEnter);
        canvas.addEventListener('wheel', onWheel);
        canvas.addEventListener('touchstart', function (event) {
            _this._prevPinchSizeInvalid = true;
            onTouch(event, function (e) {
                onPointerDown(e);
                onPointerEnter(e);
            });
        });
        canvas.addEventListener('touchmove', function (event) { onTouch(event, onPointerMove); });
        canvas.addEventListener('touchend', function (event) {
            onTouch(event, (function (e) {
                onPointerUp(e);
                onPointerOut(e);
            }));
        });
        canvas.addEventListener('touchcancel', function (event) {
            onTouch(event, (function (e) {
                onPointerUp(e);
                onPointerOut(e);
            }));
        });
    }
    return CanvasListener;
}());
