//Mostly based on https://codepen.io/chengarda/pen/wRxoyB

enum CanvasListenerEventType {
    pointerdown = "pointerdown",
    pointerup = "pointerup",
    pointerout = "pointerout",
    pointerenter = "pointerenter",
    pointermove = "pointermove",
    pointerdrag = "pointerdrag",

    pinch = "pinch",
    wheel = "wheel"
}

type CanvasListenerEvent = {
    x: number;
    y: number;
    prevX : number;
    prevY : number;
    pinchSize: number;
    prevPinchSize : number;
    pinchX: number;
    pinchY: number;
    type: CanvasListenerEventType;
    isDragging: boolean;
    wheelDelta : number;
}

class CanvasListener{
    canvas: HTMLCanvasElement;
    isDragging: boolean = false;

    _prevXYInvalid: boolean = true;
    _prevX: number = 0;
    _prevY: number = 0;

    _prevPinchSizeInvalid: boolean = true;
    _prevPinchSize: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        const getXY = (event) => {
            let canvasRect = this.canvas.getBoundingClientRect();
            let xy = { x: 0, y: 0 };

            if (event.touches && event.touches.length >= 1) {
                xy.x = event.touches[0].clientX - canvasRect.x;
                xy.y = event.touches[0].clientY - canvasRect.y;
            } else if(event.clientX){
                xy.x = event.clientX - canvasRect.x;
                xy.y = event.clientY - canvasRect.y;
            }else{
                xy.x = this._prevX;
                xy.y = this._prevY;
            }

            return xy;
        }

        const createEvent = (event, eventType: CanvasListenerEventType) => {
            let xy = getXY(event);

            if (this._prevXYInvalid) {
                this._prevX = xy.x;
                this._prevY = xy.y;
                this._prevXYInvalid = false;
            }

            let lightCellEvent: CanvasListenerEvent = {
                x: xy.x,
                y: xy.y,
                prevX : this._prevX,
                prevY : this._prevY,
                pinchSize: 0,
                prevPinchSize : 0,
                pinchX: 0,
                pinchY: 0,
                isDragging: this.isDragging,
                type: eventType,
                wheelDelta : 0
            }

            this._prevX = xy.x;
            this._prevY = xy.y;

            return lightCellEvent;
        }

        const onPointerDown = (event) => {
            this.isDragging = true;
            let parsedEvent =  createEvent(event, CanvasListenerEventType.pointerdown);
            this.onpointerdown(createEvent(event, CanvasListenerEventType.pointerdown));
            this.onenvent(parsedEvent)
        }

        const onPointerUp = (event) => {
            this.isDragging = false;
            let parsedEvent = createEvent(event, CanvasListenerEventType.pointerup); 
            this.onpointerup(parsedEvent);
            this.onenvent(parsedEvent);
        }

        const onPointerMove = (event) => {
            let parsedEvent = createEvent(event, CanvasListenerEventType.pointermove);
            this.onpointermove(parsedEvent);
            this.onenvent(parsedEvent);
            if (this.isDragging) {
                parsedEvent.type = CanvasListenerEventType.pointerdrag;
                this.onpointerdrag(parsedEvent);
                this.onenvent(parsedEvent);
            }
        }

        const onPointerOut = (event) => {
            this.isDragging = false
            let parsedEvent = createEvent(event, CanvasListenerEventType.pointerout);
            this.onpointerout(parsedEvent);
            this.onenvent(parsedEvent);
        }

        const onPointerEnter = (event) => {
            this._prevXYInvalid = true;
            let parsedEvent = createEvent(event, CanvasListenerEventType.pointerenter);
            this.onpointerenter(parsedEvent);
            this.onenvent(parsedEvent)
        }

        const onWheel = (event : WheelEvent) =>{
            let parsedEvent = createEvent(event, CanvasListenerEventType.wheel);
            parsedEvent.wheelDelta = event.deltaY;
            this.onwheel(parsedEvent);
            this.onenvent(parsedEvent);
        }

        const onTouch = (event: TouchEvent, singleTouchHandler : Function) => {
            event.preventDefault();
            if(event.touches && event.touches.length >= 2) {
                let canvasRect = this.canvas.getBoundingClientRect();
                let cx1 = event.touches[0].clientX - canvasRect.x;
                let cy1 = event.touches[0].clientY - canvasRect.y;

                let cx2 = event.touches[1].clientX - canvasRect.x;
                let cy2 = event.touches[1].clientY - canvasRect.y;

                let centerX = (cx1 + cx2) * 0.5;
                let centerY = (cy1 + cy2) * 0.5;

                let size = (cx1 - cx2) ** 2 + (cy1 - cy2) ** 2;
                size = Math.sqrt(size);

                if (this._prevPinchSizeInvalid) {
                    this._prevPinchSize = size;
                    this._prevPinchSizeInvalid = false;
                }

                let pinchEvent: CanvasListenerEvent = createEvent(event, CanvasListenerEventType.pinch);
                pinchEvent.pinchX = centerX;
                pinchEvent.pinchY = centerY;
                pinchEvent.pinchSize = size;
                pinchEvent.prevPinchSize = this._prevPinchSize;

                this._prevPinchSize = size;

                this.onpinch(pinchEvent);
                this.onenvent(pinchEvent);
            }
            else{
                this._prevPinchSizeInvalid = true;
                singleTouchHandler(event);
            }
        }

        canvas.addEventListener('mousedown', onPointerDown);
        canvas.addEventListener('mouseup', onPointerUp);
        canvas.addEventListener('mousemove', onPointerMove);
        canvas.addEventListener('mouseleave', onPointerOut);
        canvas.addEventListener('mouseenter', onPointerEnter);

        canvas.addEventListener('wheel', onWheel)

        canvas.addEventListener('touchstart', (event) => {
            this._prevPinchSizeInvalid = true;
            onTouch(event, e=>{
                onPointerDown(e);
                onPointerEnter(e);
            })
        })
        canvas.addEventListener('touchmove', event => { onTouch(event, onPointerMove) })
        canvas.addEventListener('touchend', (event) => { onTouch(event, (e=>{
            onPointerUp(e);
            onPointerOut(e);
        })) })
        canvas.addEventListener('touchcancel', (event) => { onTouch(event, (e=>{
            onPointerUp(e);
            onPointerOut(e);
        })) })
    }


    onenvent: (event: CanvasListenerEvent) => void = (event) => { };
    onpointermove: (event: CanvasListenerEvent) => void = (event) => { };
    onpointerdown: (event: CanvasListenerEvent) => void = (event) => { };
    onpointerup: (event: CanvasListenerEvent) => void = (event) => { };
    onpointerout: (event: CanvasListenerEvent) => void = (event) => { };
    onpointerdrag: (event: CanvasListenerEvent) => void = (event) => { };
    onpointerenter: (event: CanvasListenerEvent) => void = (event) => { };
    onwheel: (event: CanvasListenerEvent) => void = (event) => { };
    onpinch: (event: CanvasListenerEvent) => void = (event) => { };
}

