import {binding, given, then, when} from 'cucumber-tsflow';
import {assert, expect} from 'chai';

import {point, Tuple, vector, VectorElement} from '../../src/tuple';
import {Color, RGBElement} from '../../src/color';
import {shouldEqualMsg, Workspace} from './Workspace';
import {Matrix} from '../../src/matrix';
import {parseArg, Util} from '../../src/util';

@binding([Workspace])
class TupleSteps {

    constructor(protected workspace: Workspace) {
    }

    private static createExpected(typ: string, xs: string, ys: string, zs: string, w = ''): Tuple {
        const x = parseArg(xs);
        const y = parseArg(ys);
        const z = parseArg(zs);
        if (typ === 'vector') {
            return vector(x, y, z);
        }
        if (typ === 'point') {
            return point(x, y, z);
        }
        if (typ === 'tuple') {
            return new Tuple(x, y, z, parseArg(w));
        }
        assert.fail('Unexpected type');
        return new Tuple(NaN, NaN, NaN, NaN);
    }

    @then(/^(\w+)\.([xyzw]) = (.*)$/)
    public tupleFieldEquals(id: string, field: VectorElement, value: string) {
        expect(this.workspace.tuples[id].getElement(field)).to.eq(parseArg(value));
    }

    @then(/^(\w+)\.(red|green|blue) = (.*)$/)
    public colorFieldEquals(id: string, field: RGBElement, value: string) {
        expect(this.workspace.colors[id].getElement(field)).to.eq(parseArg(value));
    }

    @then(/^(\w+) is (\w* *)a point/)
    public testPoint(id: string, not?: string) {
        expect(this.workspace.tuples[id].isPoint).to.eq(not !== 'not ');
    }

    @then(/^(\w+) is (\w* *)a vector/)
    public testVector(id: string, not?: string) {
        expect(this.workspace.tuples[id].isVector).to.eq(not !== 'not ');
    }

    @given(/^([\w\d_]+) ← (tuple|point|vector)\(([^,]+), ([^,]+), ([^,]+)[, ]*(.*)\)$/)
    public givenATupleType(id: string, expectedType: string, x: string, y: string, z: string, w: string): void {
        this.workspace.tuples[id] = TupleSteps.createExpected(expectedType, x, y, z, w);
    }

    @given(/^([\w\d_]+) ← (color)\(([^,]+), ([^,]+), ([^,]+)\)$/)
    public givenAColor(id: string, expectedType: string, x: string, y: string, z: string): void {
        this.workspace.colors[id] = new Color(parseArg(x), parseArg(y), parseArg(z));
    }

    @then(/^([\w\d_]+) = tuple\(([^,]+), ([^,]+), ([^,]+), ([^,]+)\)$/)
    public thenTupleEquals(id: string, x: string, y: string, z: string, w: string): void {
        expect(
            Tuple.equals(this.workspace.tuples[id], new Tuple(parseArg(x), parseArg(y), parseArg(z), parseArg(w)))
        ).to.be.true;
    }

    @then(/^([\w\d_]+) = (tuple|point|vector)\(([^,]+), ([^,]+), ([^,]+)\)$/)
    public thenTypedTupleEquals(id: string, expectedType: string, x: string, y: string, z: string): void {
        let expected = TupleSteps.createExpected(expectedType, x, y, z);
        const actual = this.workspace.tuples[id];
        expect(Tuple.equals(actual, expected), shouldEqualMsg(actual, expected)).to.be.true;
    }

    @then(/^([\w\d_]+) = color\(([^,]+), ([^,]+), ([^,]+)\)$/)
    public thenColorEquals(id: string, r: string, g: string, b: string): void {
        let expected = new Color(parseArg(r), parseArg(g), parseArg(b));
        const actual = this.workspace.colors[id];
        expect(Color.equals(actual, expected), shouldEqualMsg(actual, expected)).to.be.true;
    }

    @then(/^([\w\d_]+) (.) (.+) = (\w*)\(([^,]+), ([^,]+), ([^,]+)[, ]*([^,]*)\)$/)
    public testMixedOperation(lhs: string, op: string, rhs: string, expectedType: string, x: string, y: string, z: string, w: string): void {
        if (expectedType === 'color') {
            this.colorOp(op, lhs, rhs, x, y, z);
        } else {
            this.tupleOp(op, lhs, rhs, x, y, z, w, expectedType);
        }
    }

    @then(/^-([\w\d_]+) = tuple\(([^,]+), ([^,]+), ([^,]+), ([^,]+)\)$/)
    public thenNegateTest(id: string, x: string, y: string, z: string, w: string): void {
        expect(
            Tuple.equals(this.workspace.tuples[id].negative, new Tuple(parseArg(x), parseArg(y), parseArg(z), parseArg(w)))
        ).to.be.true;
    }

    @then(/^magnitude\(([\w\d_]+)\) = (.*)$/)
    public thenMagnitudeEquals(id: string, m: string): void {
        let mag = parseArg(m);
        expect(this.workspace.tuples[id].magnitude).to.be.eq(mag);
    }

    @then(/^normalize\(([\w\d_]+)\) = (approximately )?vector\(([^,]+), ([^,]+), ([^,]+)\)$/)
    public thenVectorEquals(id: string, approx: string, x: string, y: string, z: string): void {
        let actualVal = this.workspace.tuples[id].normalize;
        let expectedVal = vector(parseArg(x), parseArg(y), parseArg(z));
        expect(Tuple.equals(actualVal, expectedVal)).to.be.true;
    }

    @when(/^([\w\d_]+) ← normalize\(([\w\d_]+)\)$/)
    public whenNormed(id: string, src: string): void {
        this.workspace.tuples[id] = this.workspace.tuples[src].normalize;
    }

    @then(/^dot\(([\w\d_]+), ([\w\d_]+)\) = ([^,]+)$/)
    public thenDotEquals(lhs: string, rhs: string, product: string): void {
        expect(
            Util.closeTo(Tuple.dot(this.workspace.tuples[lhs], this.workspace.tuples[rhs]), parseArg(product))
        ).to.be.true;
    }

    @when(/^([\w\d_]+) ← reflect\(([\w\d_]+), ([\w\d_]+)\)/)
    public thenVectorOperation(id: string, vId: string, nId: string): void {
        this.workspace.tuples[id] = Tuple.reflect(this.workspace.tuples[vId], this.workspace.tuples[nId]);
    }

    @then(/^cross\(([\w\d_]+), ([\w\d_]+)\) = vector\(([^,]+), ([^,]+), ([^,]+)\)$/)
    public thenCrossEquals(lhs: string, rhs: string, x: string, y: string, z: string): void {
        let actualVal = Tuple.cross(this.workspace.tuples[lhs], this.workspace.tuples[rhs]);
        let expectedVal = vector(parseArg(x), parseArg(y), parseArg(z));
        expect(Tuple.equals(actualVal, expectedVal)).to.be.true;
    }

    @then(/tuple (.*) is not equal to (.*)/)
    public thenTuplesNotEqual(lhs: string, rhs: string) {
        expect(Tuple.equals(this.workspace.tuples[lhs], this.workspace.tuples[rhs])).to.be.false
    }

    private colorOp(op: string, lhs: string, rhs: string, x: string, y: string, z: string) {
        switch (op) {
            case '+':
                expect(
                    Color.equals(Color.add(this.workspace.colors[lhs], this.workspace.colors[rhs]), new Color(parseArg(x), parseArg(y), parseArg(z)))
                ).to.be.true;
                break;
            case '-':
                expect(
                    Color.equals(Color.subtract(this.workspace.colors[lhs], this.workspace.colors[rhs]), new Color(parseArg(x), parseArg(y), parseArg(z)))
                ).to.be.true;
                break;
            case '*':
                if (this.workspace.colors[rhs]) {
                    expect(
                        Color.equals(Color.multiply(this.workspace.colors[lhs], this.workspace.colors[rhs]), new Color(parseArg(x), parseArg(y), parseArg(z)))
                    ).to.be.true;
                } else {
                    expect(
                        Color.equals(this.workspace.colors[lhs].scale(parseArg(rhs)), new Color(parseArg(x), parseArg(y), parseArg(z)))
                    ).to.be.true;
                }
                break;
            default:
                assert.fail('Unexpected op code');

        }
    }

    private tupleOp(op: string, lhs: string, rhs: string, x: string, y: string, z: string, w: string, expectedType: string) {
        switch (op) {
            case '+':
                expect(
                    Tuple.equals(Tuple.add(this.workspace.tuples[lhs], this.workspace.tuples[rhs]), new Tuple(parseArg(x), parseArg(y), parseArg(z), parseArg(w)))
                ).to.be.true;
                break;
            case '-':
                expect(
                    Tuple.equals(Tuple.subtract(this.workspace.tuples[lhs], this.workspace.tuples[rhs]), TupleSteps.createExpected(expectedType, x, y, z))
                ).to.be.true;
                break;
            case '*':
                if (this.workspace.matrices[lhs]) {
                    const actual = Matrix.multiplyVector(this.workspace.matrices[lhs], this.workspace.tuples[rhs]);
                    const expected = TupleSteps.createExpected(expectedType, x, y, z, w);
                    expect(Tuple.equals(actual, expected), shouldEqualMsg(actual, expected)).to.be.true;
                } else {
                    expect(
                        Tuple.equals(Tuple.multiply(this.workspace.tuples[lhs], parseArg(rhs)), new Tuple(parseArg(x), parseArg(y), parseArg(z), parseArg(w)))
                    ).to.be.true;
                }
                break;
            case '/':
                expect(
                    Tuple.equals(Tuple.divide(this.workspace.tuples[lhs], parseArg(rhs)), new Tuple(parseArg(x), parseArg(y), parseArg(z), parseArg(w)))
                ).to.be.true;
                break;
            default:
                assert.fail('Unexpected op code');
        }
    }
}


export = TupleSteps;