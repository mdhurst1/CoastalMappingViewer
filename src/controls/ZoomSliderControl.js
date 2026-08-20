//import style
import "../styles/zoomslider.css";

export class ZoomSliderControl {

    onAdd(map) {

    this.map = map;

    this.container = document.createElement("div");
    this.container.className =
        "maplibregl-ctrl zoom-slider-control";

    // zoom in
    const zoomInButton = document.createElement("button");
    zoomInButton.className = "zoom-slider-button";
    zoomInButton.type = "button";
    zoomInButton.textContent = "+";
    zoomInButton.title = "Zoom in";

    zoomInButton.addEventListener("click", () => {
        this.map.zoomIn();
    });

    // slider
    this.slider = document.createElement("input");
    this.slider.className = "zoom-slider";
    this.slider.type = "range";
    this.slider.min = 3;
    this.slider.max = 20;
    this.slider.step = 0.1;
    this.slider.value = this.map.getZoom();

    this.slider.addEventListener("input", () => {
        this.map.setZoom(Number(this.slider.value));
    });

    // zoom out
    const zoomOutButton = document.createElement("button");
    zoomOutButton.className = "zoom-slider-button";
    zoomOutButton.type = "button";
    zoomOutButton.textContent = "−";
    zoomOutButton.title = "Zoom out";

    zoomOutButton.addEventListener("click", () => {
        this.map.zoomOut();
    });

    // zoom level
    this.label = document.createElement("div");
    this.label.className = "zoom-slider-label";
    this.label.textContent =
        this.map.getZoom().toFixed(1);

    // keep slider synchronised with map
    this.updateFromMap = () => {

        const zoom = this.map.getZoom();

        this.slider.value = zoom;
        this.label.textContent = zoom.toFixed(1);
    };

    this.map.on("zoom", this.updateFromMap);

    this.container.appendChild(zoomInButton);
    this.container.appendChild(this.slider);
    this.container.appendChild(zoomOutButton);
    this.container.appendChild(this.label);

    return this.container;
}

    onRemove() {
        this.map.off("zoom", this.updateFromMap);
        this.container.remove();
        this.map = undefined;
    }
}