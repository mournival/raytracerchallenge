import {Color} from './color';

export class Canvas {

    data: Color[][] = [];

    constructor(public readonly width: number, public readonly height: number) {
        for (let h = 0; h < height; h++) {
            const row: Color[] = [];
            for (let w = 0; w < width; w++) {
                row[w] = new Color(0, 0, 0);
            }
            this.data[h] = row;
        }
    }

    get colors(): Color[][] {
        return this.data;
    }

    static write_pixel(canvas: Canvas, row: number, col: number, color: Color): void {
        canvas.colors[row][col] = color;
    }

    static canvas_to_ppm(canvas: Canvas): string[] {
        const ppm = ['P3', canvas.width.toString() + ' ' + canvas.height.toString(), '255'];

        for (let h = 0; h < canvas.height; h++) {
            let r = '';

            for (let w = 0; w < canvas.width; w++) {
                if (w > 0) {
                    r += ' '
                }
                r += canvas.colors[h][w].asPPMString();
            }

            let strings = r.split(' ');
            // while (strings.length > 0) {
            //     ppm.push(strings.slice(0, 17).join(' '));
            //     strings = strings.slice(17);
            // }
            while (strings.length > 0) {
                let ll = 0;
                let i = 0;
                while (ll < 66 && i < strings.length) {
                    ll += strings[i].length + 1;
                    ++i;
                }
                ppm.push(strings.slice(0, i).join(' '));
                strings = strings.slice(i);
            }
        }
        ppm.push('');

        return ppm;
    }


}
