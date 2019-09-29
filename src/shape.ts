import {Matrix} from './matrix';
import {Material} from './material';
import {Interceptable, Intersection} from './intersection';
import {Ray, transform} from './ray';
import {Tuple, vector} from './tuple';
import {Sphere} from './sphere';

export abstract class Shape implements Interceptable {

    protected constructor(public readonly transform: Matrix,
                          public readonly material: Material) {
    }

    abstract local_intersection(r: Ray): Intersection[];

    abstract local_normal_at(pt: Tuple): Tuple;

    abstract local_replace_transform(t: Matrix): Shape;

    abstract local_replace_material(m: Material): Shape;


    normal_at(point: Tuple): Tuple {
        const inverseTransform = this.transform.inverse;
        const local_point = Matrix.multiplyVector(inverseTransform, point);
        const local_normal = this.local_normal_at(local_point);
        let world_normal = Matrix.multiplyVector(inverseTransform.transpose, local_normal);
        world_normal = vector(world_normal.x, world_normal.y, world_normal.z);

        return world_normal.normalize;
    }


    intersect(r: Ray): Intersection[] {
        return this.local_intersection(transform(r, this.transform.inverse));
    }

    replace(prop: Matrix | Material): Shape {
        if (typeof prop === 'object') {
            if (prop instanceof Matrix) {
                return this.local_replace_transform(prop);
            }
            if (prop instanceof Material) {
                return this.local_replace_material(prop);
            }
        }
        throw 'Unknown replace for : ' + typeof prop;
    }
}

export class TestShape extends Shape {
    constructor(
        public readonly transform: Matrix = Matrix.identity(4),
        public readonly material = new Material()
    ) {
        super(transform, material);
    }

    intersect(r: Ray): Intersection[] {
        return [];
    }

    local_normal_at(pt: Tuple): Tuple {
        return (new Sphere()).normal_at(pt);
    }

    local_intersection(r: Ray): Intersection[] {
        return [];

    }

    local_replace_transform(t: Matrix): Shape {
        return new TestShape(t);
    }

    local_replace_material(m: Material): Shape {
        return new TestShape(this.transform, m);
    }


}

export function test_shape(): Shape {
    return new TestShape();
}

export function isShape(arg: any): arg is Shape {
    return true;
}
