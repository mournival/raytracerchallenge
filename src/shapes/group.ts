import {Matrix} from '../matrix';
import {Shape} from './shape';
import {Ray} from '../ray';
import {Intersection} from '../intersection';
import {Tuple, vector} from '../tuple';
import {Material} from '../material';


export class Group extends Shape {
    public readonly children: Shape[];

    constructor(public readonly transform: Matrix = Matrix.identity(),
                public readonly material = new Material(),
                children: Shape[] = [],
                public readonly parent: Shape | null = null) {
        super(transform, material, parent);
        this.children = children.map(t => t.replace(this))
    }

    get empty(): boolean {
        return this.children.length === 0;
    }

    local_intersection(r: Ray): Intersection[] {
        return this.children.flatMap(x => x.intersect(r)).sort((a, b) => a.t - b.t);
    }

    local_normal_at(_pt: Tuple): Tuple {
        return vector(0, 0, 0);
    }

    local_replace_transform(t: Matrix): Shape {
        return new Group(t, this.material, this.children, this.parent);
    }

    local_replace_material(m: Material): Shape {
        return new Group(this.transform, m, this.children, this.parent);
    }

    local_replace_parent(s: Shape): Shape {
        return new Group(this.transform, this.material, this.children, s);
    }

    add_child(shape: Shape): Group {
        return new Group(this.transform, this.material, [...this.children, shape], this.parent);
    }

    local_includes(shape: Shape): boolean {
        return !!this.children.find(s => Shape.equals(s, shape));
    }

    equals(rhs: Shape): boolean {
        return rhs instanceof Group
            && Matrix.equals(this.transform, rhs.transform)
            && Material.equals(this.material, rhs.material)
            && shapeArraysEqual(this.children, rhs.children)
            // && this.parent.equals(rhs.parent)
            ;

    }
}

function shapeArraysEqual(lhs: Shape[], rhs: Shape[]): boolean {
    if (lhs.length !== rhs.length) {
        return false;
    }
    for (let i = 0; i < lhs.length; ++i) {
        if (!lhs[i].equals(rhs[i])) {
            return false;
        }
    }
    return true;
}