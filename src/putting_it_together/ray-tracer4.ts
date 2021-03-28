#!/usr/bin/env node

import {point, vector} from '../tuple';
import {Canvas} from '../canvas';
import {Color} from '../color';
import {Matrix, rotation_x, rotation_y, scaling, translation, view_transform} from '../matrix';
import {Material} from '../material';
import {World} from '../world';
import {Camera} from '../camera';
import {Plane, Sphere} from '../shapes';
import {checkers_pattern, combine_pattern, gradient_pattern} from '../pattern';
import {Light} from '../light';
import * as fs from 'fs';

function saveFile(canvas: Canvas) {

    fs.writeFile('./ppm/ray-tracer4.ppm', Canvas.canvas_to_ppm(canvas).join('\n'), function (err) {
        if (err) {
            return console.error(err);
        }
        console.log('File created!');
    });
}

const quarterPi = Math.PI / 4;

const defaultMaterial = new Material(new Color(1, 0.9, 0.9), 0.1, 0.9, 0, 200, 0.0, 0, 1, checkers_pattern(Color.BLACK, Color.WHITE));

const reflectiveCheckers = defaultMaterial.replace('reflective', 0.25).replace('pattern',
    combine_pattern(
        gradient_pattern(new Color(0.33, 0.33, 0.33), new Color(0.66, 0.66, 0.66), rotation_y(Math.PI / 2)),
        checkers_pattern(new Color(0.66, 0.66, 0.66), new Color(0.33, 0.33, 0.33), scaling(0.2, 0.2, 0.2))
    )
);

const floor = new Plane(
    Matrix.identity()
    , reflectiveCheckers,
);

const right_wall = new Plane(
    Matrix.multiply(translation(0, 0, 5),
        Matrix.multiply(rotation_y(quarterPi),
            rotation_x(2 * quarterPi),
        )
    ), defaultMaterial.replace('pattern', gradient_pattern(Color.BLACK, Color.WHITE))
);

const middle = new Sphere(
    translation(-0.5, 1, 0.5),
    new Material((new Color(246, 103, 51).scale(1 / 1020)), 0.1, 0.7, 0.9, 300, 0.9, 1.0, 2.25)
);

const right = new Sphere(
    Matrix.multiply(translation(1.5, 0.5, -0.5), scaling(0.5, 0.5, 0.5)),
    new Material(new Color(82, 45, 128).scale(1 / 255), 0.1, 0.7, 0.6, 200, 0.3)
);

const left = new Sphere(
    Matrix.multiply(translation(-1.5, 1 / 3, -0.75), scaling(1 / 3, 1 / 3, 1 / 3)),
    new Material(new Color(249, 228, 152).scale(1 / 255), 0.1, 0.7, 0.01, 200, 0.2)
);

const world = new World([
        new Light(point(-10, 10, -10), new Color(1, 1, 1))
    ],
    [
        floor,
        // left_wall,
        right_wall,
        // ceiling,
        middle,
        right,
        left
    ]);

const camera = new Camera(Math.floor(3200), Math.floor(2400), Math.PI / 4,
    view_transform(
        point(0, 5.0, -5),
        point(0, 1, 0),
        vector(0, 1, 0)
    )
);


console.time('Rendering');
const canvas = camera.render(world);
console.timeEnd('Rendering');

saveFile(canvas);
