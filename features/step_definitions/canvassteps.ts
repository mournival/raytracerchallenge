import {binding, given, then, when} from 'cucumber-tsflow';
import {expect} from 'chai';
import {Canvas} from "../../src/canvas";
import {Color} from "../../src/color";
import {Workspace} from "./Workspace";

type PPM = string[];

interface PPMArray {
    [index: string]: PPM;
}

@binding([Workspace])
class CanvasSteps {

    ppm: PPMArray = {};

    constructor(protected workspace: Workspace) {
    }

    @given(/^(\w+) ← canvas\(([+-]?\d*?\.?\d*), ([+-]?\d*?\.?\d*)\)$/)
    public givenACanvas(id: string, x: string, y: string): void {
        this.workspace.canvases[id] = new Canvas(parseInt(x), parseInt(y));
    }

    @then(/^(\w+)\.width = (.*)$/)
    public canvasWidthEquals(id: string, value: string) {
        expect(this.workspace.canvases[id].width).to.eq(parseInt(value));
    }

    @then(/^(\w+)\.height = (.*)$/)
    public canvasHeightEquals(id: string, value: string) {
        expect(this.workspace.canvases[id].height).to.eq(parseInt(value));
    }

    @then(/^every pixel of c is color\(0, 0, 0\)$/)
    public testDefaultColor() {
        let canvas = this.workspace.canvases['c'];
        for (let col = canvas.width; col < 10; ++col)
            for (let row = canvas.height; row < 20; ++row)
                expect(
                    Color.equals(canvas.colors[row][col], new Color(0, 0, 0))
                ).to.be.true;

    }

    @when(/^write_pixel\((\w+), (\d+), (\d+), (\w+)\)$/)
    public doWritePixel(canvasId: string, col: string, row: string, colorId: string) {
        Canvas.write_pixel(this.workspace.canvases[canvasId], parseInt(row), parseInt(col), this.workspace.colors[colorId] as Color);
    }

    @then(/^pixel_at\((\w+), (\d+), (\d+)\) = (\w+)$/)
    public checkPixelAt(canvasId: string, col: string, row: string, colorId: string) {
        const pixel = this.workspace.canvases[canvasId].colors[parseInt(row)][parseInt(col)];
        expect(
            Color.equals(pixel, this.workspace.colors[colorId] as Color)
        ).to.be.true;
    }

    @when(/^(\w+) ← canvas_to_ppm\((\w+)\)$/)
    public createPPMFromCanvas(ppmId: string, canvasId: string) {
        this.ppm[ppmId] = Canvas.canvas_to_ppm(this.workspace.canvases[canvasId]);
    }

    @then(/^lines (\d+)-(\d+) of (\w+) are$/)
    public checkPPMLines(start: string, end: string, ppmID: string, contents: string) {
        let f = this.ppm[ppmID];
        let strings = contents.split('\n');
        let j = 0;
        for (let i = parseInt(start) - 1; i < parseInt(end); ++i) {
            expect(f[i]).to.be.eq(strings[j++]);
        }
    }

    @then(/^(\w+) ends with a newline character$/)
    public ppmEndsWIthNewline(ppmId: string) {
        let f = this.ppm[ppmId];
        expect(f[f.length - 1]).to.be.eq('');
    }

    @when(/^every pixel of (\w+) is set to color\((.*), (.*), (.*)\)$/)
    public everyPixelSetToColor(canvasId: string, red: string, green: string, blue: string) {
        const color = new Color(parseFloat(red), parseFloat(green), parseFloat(blue));
        const canvas = this.workspace.canvases[canvasId];
        for (let c = 0; c < canvas.width; ++c) {
            for (let r = 0; r < canvas.height; ++r) {
                Canvas.write_pixel(canvas, r, c, color);
            }
        }
    }

}

export = CanvasSteps;