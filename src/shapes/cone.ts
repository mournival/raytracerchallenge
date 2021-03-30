import {Matrix} from '../matrix';
import {Material} from '../material';
import {Tuple, vector} from '../tuple';
import {Shape} from './shape';
import {Ray} from '../ray';
import {Intersection} from '../intersection';
import {Util} from '../util';
import {intersect_wall} from "./cylinder";

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
        const a = r.direction.x * r.direction.x
            - r.direction.y * r.direction.y
            + r.direction.z * r.direction.z;
        const b = 2 * r.origin.x * r.direction.x
            - 2 * r.origin.y * r.direction.y
            + 2 * r.origin.z * r.direction.z;
        const c = r.origin.x * r.origin.x
            - r.origin.y * r.origin.y
            + r.origin.z * r.origin.z;

        if (Util.closeTo(a, 0)) {
            if (b !== 0) {
                return [
                    new Intersection(this, -c / (2 * b)),
                    ...this.intersect_cap(r)
                ];
            }
            return this.intersect_cap(r);
        }

        return intersect_wall(this, b, a, c, r);
    }

    local_normal_at(pt: Tuple): Tuple {
        const dist = pt.x * pt.x + pt.z * pt.z;
        const y = pt.y < 0 ? Math.sqrt(dist) : -Math.sqrt(dist);
        if (dist < 1 && pt.y > this.maximum - Util.EPSILON) {
            return vector(0, y, 0);
        }
        if (dist < 1 && pt.y < this.minimum + Util.EPSILON) {
            return vector(0, -y, 0);
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
        let xs: Intersection[] = [];
        if (!this.closed || Util.closeTo(r.direction.y, 0)) {
            return xs;
        }

        let t = (this.minimum - r.origin.y) / r.direction.y;
        if (this.check_cap(r, t, this.minimum)) {
            xs = [new Intersection(this, t)];
        }

        t = (this.maximum - r.origin.y) / r.direction.y;
        if (this.check_cap(r, t, this.maximum)) {
            xs = [...xs, new Intersection(this, t)];
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

