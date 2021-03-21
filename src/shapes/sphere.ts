import {Ray} from '../ray';
import {point, Tuple, vector} from '../tuple';
import {Intersection} from '../intersection';
import {Matrix} from '../matrix';
import {Material} from '../material';
import {Shape} from './shape';

export class Sphere extends Shape {

    constructor(
        public readonly transform: Matrix = Matrix.identity(),
        public readonly material: Material = new Material(),
        public readonly parent: Shape | null = null
    ) {
        super(transform, material, parent);
    }

    public local_intersection(r: Ray): Intersection[] {
        const sphere_to_ray = Tuple.subtract(r.origin, point(0, 0, 0));
        const a = Tuple.dot(r.direction, r.direction);
        const b = 2 * Tuple.dot(r.direction, sphere_to_ray);
        const c = Tuple.dot(sphere_to_ray, sphere_to_ray) - 1;
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            return [];
        }

        const rootDisc = Math.sqrt(discriminant);
        const t1 = (-b - rootDisc) / (2 * a);
        const t2 = (-b + rootDisc) / (2 * a);

        return [new Intersection(this, t1), new Intersection(this, t2)];
    }

    local_normal_at(object_point: Tuple): Tuple {
        const object_normal = Tuple.subtract(object_point, point(0, 0, 0));
        return vector(object_normal.x, object_normal.y, object_normal.z).normalize;
    }

    local_replace_transform(t: Matrix): Shape {
        return new Sphere(t, this.material, this.parent);
    }

    local_replace_material(m: Material): Shape {
        return new Sphere(this.transform, m, this.parent);
    }

    local_replace_parent(s: Shape): Shape {
        return new Sphere(this.transform, this.material, s);
    }

    equals(rhs: Shape): boolean {
        return rhs instanceof Sphere
            && Matrix.equals(this.transform, rhs.transform)
            && Material.equals(this.material, rhs.material)
            // && this.parent.equals(rhs.parent)
            ;
    }
}

export function glass_sphere(): Sphere {
    return new Sphere().replace(new Material().replace('transparency', 1.0).replace('refractive_index', 1.5));
}

export class TestShape extends Shape {
    constructor(
        public readonly transform: Matrix = Matrix.identity(4),
        public readonly material = new Material(),
        public readonly parent: Shape | null = null
    ) {
        super(transform, material, parent);
    }

    intersect(r: Ray): Intersection[] {
        return [];
    }

    local_normal_at(pt: Tuple): Tuple {
        return (new Sphere()).local_normal_at(pt);
    }

    local_intersection(r: Ray): Intersection[] {
        return [];

    }

    local_replace_transform(t: Matrix): Shape {
        return new TestShape(t, this.material, this.parent);
    }

    local_replace_material(m: Material): Shape {
        return new TestShape(this.transform, m, this.parent);
    }

    local_replace_parent(s: Shape): Shape {
        return new TestShape(this.transform, this.material, s);
    }

    equals(rhs: Shape): boolean {
        return rhs instanceof TestShape
            && Matrix.equals(this.transform, rhs.transform)
            && Material.equals(this.material, rhs.material)
            // && this.parent.equals(rhs.parent)
            ;

    }


}

export function test_shape(): Shape {
    return new TestShape();
}
