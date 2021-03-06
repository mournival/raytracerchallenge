import {Matrix} from '../matrix';
import {Material} from '../material';
import {Tuple, vector} from '../tuple';
import {Shape} from './shape';
import {Ray} from '../ray';
import {Intersection} from '../intersection';
import {Util} from '../util';

export class Cone extends Shape {

    constructor(
        public readonly transform: Matrix = Matrix.identity(),
        public readonly material = new Material(),
        public readonly minimum = Number.NEGATIVE_INFINITY,
        public readonly maximum = Number.POSITIVE_INFINITY,
        public readonly closed = false,
        public readonly parent: Shape | null = null
    ) {
        super(transform, material, parent);
    }

    local_intersection(r: Ray): Intersection[] {
        const a = r.direction.x * r.direction.x - r.direction.y * r.direction.y + r.direction.z * r.direction.z;
        const b = 2 * r.origin.x * r.direction.x - 2 * r.origin.y * r.direction.y + 2 * r.origin.z * r.direction.z;
        const c = r.origin.x * r.origin.x - r.origin.y * r.origin.y + r.origin.z * r.origin.z;

        const disc = b * b - 4 * a * c;
        if (disc < 0) {
            return []
        }

        if (Util.closeTo(a, 0)) {
            if (!Util.closeTo(b, 0)) {
                return [
                    new Intersection(this, -c / (2 * b)),
                    ...this.intersect_cap(r)
                ];
            }
            return this.intersect_cap(r);
        }

        let t0 = (-b - Math.sqrt(disc)) / (2 * a)
        let t1 = (-b + Math.sqrt(disc)) / (2 * a)
        if (t1 < t0) {
            let t = t0
            t0 = t1
            t1 = t
        }
        let xs: Intersection[] = [];
        const y0 = r.origin.y + t0 * r.direction.y;
        if (this.minimum < y0 && y0 < this.maximum) {
            xs.push(new Intersection(this, t0));
        }

        const y1 = r.origin.y + t1 * r.direction.y;
        if (this.minimum < y1 && y1 < this.maximum) {
            xs.push(new Intersection(this, t1));
        }

        return [...xs, ...this.intersect_cap(r)];
    }

    local_normal_at(pt: Tuple): Tuple {
        const dist = pt.x * pt.x + pt.z * pt.z;
        if (dist < 1 && pt.y >= this.maximum - Util.EPSILON) {
            return vector(0, 1, 0);
        }
        if (dist < 1 && pt.y <= this.minimum + Util.EPSILON) {
            return vector(0, -1, 0);
        }

        let y = Math.sqrt(dist)
        if (pt.y >= 0) { // >= due to -0 error ...
            y = -y
        }
        return vector(pt.x, y, pt.z);
    }

    local_replace_transform(t: Matrix): Shape {
        return new Cone(t, this.material, this.minimum, this.maximum, this.closed, this.parent);
    }

    local_replace_material(m: Material): Shape {
        return new Cone(this.transform, m, this.minimum, this.maximum, this.closed, this.parent);
    }

    local_replace_parent(s: Shape): Shape {
        return new Cone(this.transform, this.material, this.minimum, this.maximum, this.closed, s);
    }

    check_cap(r: Ray, t: number, capRadius: number): boolean {
        const x = r.origin.x + t * r.direction.x;
        const z = r.origin.z + t * r.direction.z;

        return x * x + z * z <= Math.abs(capRadius);
    }

    intersect_cap(r: Ray): Intersection[] {
        const dir_y = r.direction.y;
        if (!this.closed || Util.closeTo(dir_y, 0)) {
            return [];
        }

        const xs: Intersection[] = [];
        const t0 = (this.minimum - r.origin.y) / dir_y;
        if (this.check_cap(r, t0, this.minimum)) {
            xs.push(new Intersection(this, t0));
        }

        const t1 = (this.maximum - r.origin.y) / dir_y;
        if (this.check_cap(r, t1, this.maximum)) {
            xs.push(new Intersection(this, t1));
        }
        return xs;
    }

    equals(rhs: Shape): boolean {
        return rhs instanceof Cone
            && Util.closeTo(this.minimum, rhs.minimum)
            && Util.closeTo(this.maximum, rhs.maximum)
            && this.closed === rhs.closed
            && Matrix.equals(this.transform, rhs.transform)
            && Material.equals(this.material, rhs.material)
            // && this.parent.equals(rhs.parent)
            ;
    }

}

