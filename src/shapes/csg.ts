import {Matrix} from '../matrix';
import {Material} from '../material';
import {Shape} from './shape';
import {Ray} from '../ray';
import {Intersection} from '../intersection';
import {Tuple, vector} from '../tuple';

export enum CSGOperation {
    UNION, INTERSECTION, DIFFERENCE
}

export class CSG extends Shape {

    constructor(
        public readonly left: Shape,
        public readonly right: Shape,
        public readonly operation: CSGOperation,
        public readonly transform: Matrix = Matrix.identity(4),
        public readonly material = new Material(),
        public readonly parent: Shape | null = null
    ) {
        super(transform, material, parent);
        this.left = left.replace(this);
        this.right = right.replace(this);
    }

    static intersectionAllowed(op: CSGOperation, lhit: boolean, inl: boolean, inr: boolean): boolean {
        switch (op) {
            case CSGOperation.UNION:
                return (lhit && !inr) || (!lhit && !inl);
            case CSGOperation.INTERSECTION:
                return (lhit && inr) || (!lhit && inl);
            case CSGOperation.DIFFERENCE:
                return (lhit && !inr) || (!lhit && inl);
        }
        return false;
    }

    local_intersection(r: Ray): Intersection[] {
        const leftxs: Intersection[] = this.left.intersect(r);
        const rightxs: Intersection[] = this.right.intersect(r);
        return this.filter_intersections([...leftxs, ...rightxs].sort((a, b) => a.t - b.t));
    }

    local_normal_at(_pt: Tuple): Tuple {
        return vector(0, 1, 0);
    }

    local_replace_transform(t: Matrix): Shape {
        return new CSG(this.left, this.right, this.operation, t, this.material, this.parent);
    }

    local_replace_material(m: Material): Shape {
        return new CSG(this.left, this.right, this.operation, this.transform, m, this.parent);
    }

    local_replace_parent(s: Shape): Shape {
        return new CSG(this.left, this.right, this.operation, this.transform, this.material, s);
    }

    local_includes(obj: Shape): boolean {
        return this.left.includes(obj) || this.right.includes(obj);
    }

    equals(rhs: Shape): boolean {
        return rhs instanceof CSG
            && Matrix.equals(this.transform, rhs.transform)
            && Material.equals(this.material, rhs.material)
            // && this.parent.equals(rhs.parent)
            ;
    }

    filter_intersections(xs: Intersection[]): Intersection[] {
        let inl = false;
        let inr = false;

        const result: Intersection[] = [];

        xs.forEach(i => {
            const lhit = this.left.includes(i.obj);

            if (CSG.intersectionAllowed(this.operation, lhit, inl, inr)) {
                result.push(i);
            }

            if (lhit) {
                inl = !inl;
            } else {
                inr = !inr;
            }
        });

        return result;
    }
}

