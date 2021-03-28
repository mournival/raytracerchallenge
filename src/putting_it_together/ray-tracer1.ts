#!/usr/bin/env node

import {point, Tuple} from '../tuple';
import {Canvas} from '../canvas';
import {Color} from '../color';
import {position, Ray} from '../ray';
import {Sphere} from '../shapes';
import {Matrix} from '../matrix';
import {Material} from '../material';
import {Light} from '../light';
import {Intersection} from '../intersection';
import * as fs from 'fs';

function saveFile() {

    fs.writeFile('./ppm/ray-tracer1.ppm', Canvas.canvas_to_ppm(canvas).join('\n'), function (err) {
        if (err) {
            return console.error(err);
        }
        console.log('File created!');
    });
}

function hit(xs: Intersection[]): Intersection {
    if (xs.length === 1)
        return xs[0];
    return (xs[0].t < xs[1].t) ? xs[0] : xs[1];
}

const ray_origin = point(0, 0, -5);

const wall_z = 10;

const wall_size = 7.0;

const canvas_pixels = 1500;

const pixel_size = wall_size / canvas_pixels;

const half = wall_size / 2;

const canvas = new Canvas(canvas_pixels, canvas_pixels);

const sphere = new Sphere(Matrix.identity(4), new Material(new Color(0.964, 0.403, 0.2)));

const light_position = point(-10, 10, -10);
const light_color = new Color(1, 1, 1);
const light = new Light(light_position, light_color);

const COLOR = new Color(0.5, 0.5, 0.5);

const p = canvas.width / 2;
for (let n = 0; n < canvas.width; ++n) {
    canvas.colors[n][p] = COLOR;
    canvas.colors[p][n] = COLOR;
}

console.time('Rendering');
for (let y = 0; y < canvas.height; ++y) {
    const world_y = half - pixel_size * y;
    for (let x = 0; x < canvas.width; ++x) {
        const world_x = -half + pixel_size * x;
        const pos = point(world_x, world_y, wall_z);
        const ray = new Ray(ray_origin, Tuple.subtract(pos, ray_origin).normalize);
        const xs = sphere.intersect(ray);
        if (xs.length > 0) {
            const intersection = hit(xs);
            const point = position(ray, intersection.t);
            const normal = intersection.obj.normal_at(point);
            const eye = ray.direction.negative;
            const color = intersection.obj.material.lighting(point, eye, normal, light, false);
            Canvas.write_pixel(canvas, x, y, color);
        }
    }
}
console.timeEnd('Rendering');

saveFile();
