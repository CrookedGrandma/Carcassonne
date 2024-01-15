class Controls {

    view = {x: 0, y: 0, zoom: 1};
    viewPos: { prevY?: number; prevX?: number; isDragging: boolean } = { prevX: undefined,  prevY: undefined, isDragging: false };

    move() {
        const controls = this;
        function mousePressed(e: MouseEvent) {
            controls.viewPos.isDragging = true;
            controls.viewPos.prevX = e.clientX;
            controls.viewPos.prevY = e.clientY;
        }

        function mouseDragged(e: MouseEvent) {
            const {prevX, prevY, isDragging} = controls.viewPos;
            if (!isDragging) return;

            const pos = {x: e.clientX, y: e.clientY};
            const dx = pos.x - prevX!;
            const dy = pos.y - prevY!;

            if (prevX || prevY) {
                controls.view.x += dx;
                controls.view.y += dy;
                controls.viewPos.prevX = pos.x;
                controls.viewPos.prevY = pos.y;
                controls.log();
            }
        }

        function mouseReleased(_: MouseEvent) {
            controls.viewPos.isDragging = false;
            controls.viewPos.prevX = undefined;
            controls.viewPos.prevY = undefined;
        }

        return {
            mousePressed,
            mouseDragged,
            mouseReleased
        }
    }

    zoom() {
        const controls = this;

        function worldZoom(e: any) {
            const {x, y, deltaY} = e;
            const direction = deltaY > 0 ? -1 : 1;
            const factor = 0.025;
            const zoom = 1 * direction * factor;

            const wx = (x-controls.view.x)/(width*controls.view.zoom);
            const wy = (y-controls.view.y)/(height*controls.view.zoom);

            controls.view.x -= wx*width*zoom;
            controls.view.y -= wy*height*zoom;
            controls.view.zoom += zoom;
        }

        return {worldZoom}
    }

    log() {
        console.log(controls.view);
        console.log(controls.viewPos);
    }
}
