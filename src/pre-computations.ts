import {position, Ray} from './ray';
import {Intersection} from './intersection';
import {Tuple} from './tuple';
import {Shape} from './shape';

export class PreComputations extends Intersection {
    public readonly over_point: Tuple;
    public readonly reflectv: Tuple;

    constructor(public readonly i: Intersection,
                public readonly p: Tuple,
                public readonly eyev: Tuple,
                public readonly normalv: Tuple,
                public readonly inside: boolean
    ) {
        super(i.obj, i.t);
        this.over_point = Tuple.add(p, Tuple.multiply(normalv, Tuple.EPSILON));
        this.reflectv = Tuple.reflect(eyev.negative, normalv);

    }

    public get point(): Tuple {
        return this.p;
    }

    public get object(): Shape {
        return this.obj;
    }

    public get n1(): number {
        return 0;
    }

    public get n2(): number {
        return 0;
    }

}

export function prepare_computations(i: Intersection, r: Ray, xs: Intersection[] = []): PreComputations {
    const p = position(r, i.t);
    const normalv = i.obj.normal_at(p);
    const eyev = r.direction.negative;

    if (Tuple.dot(normalv, eyev) < 0) {
        return new PreComputations(i, p, eyev, normalv.negative, true);
    }
    return new PreComputations(i, p, eyev, normalv, false);
}
