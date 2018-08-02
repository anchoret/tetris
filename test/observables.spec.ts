import { expect } from 'chai';
import * as sinon from 'sinon';
import {
    createGameSpeed,
    createLevel,
    createNonNegativeReceivedPoints,
    createReceivedPointsSubject,
    createScore
} from '../src/observables';
import {TestScheduler} from 'rxjs/testing/TestScheduler';

describe('Observables utils', function() {
    beforeEach(function() {
        this.testScheduler = new TestScheduler((actual, expected) => {
            expect(actual).to.deep.equal(expected);
        });
    });

    describe('Create received points subject', function() {
        let tests = [
            {args: [],   expected: 0},
            {args: [0],  expected: 0},
            {args: [1],  expected: 1},
            {args: [-1], expected: 0}
        ];
        tests.forEach((test) => {
            it('Return number behavior subject with non-negative initial value', () => {
                let receivedPoints = createReceivedPointsSubject.apply(null, test.args);
                receivedPoints.subscribe((value) => {
                    expect(value).to.be.equals(test.expected);
                });
            });
        });
    });

    describe('Create non negative received points', function() {
        let tests = [
            {actual: '^a', expected: '-a', values: {a: 0}},
            {actual: '^ab', expected: '-a-', values: {a: 0, b: -2}},
            {actual: '^abc', expected: '-a-c', values: {a: 0, b: -2, c: 3}},
        ];

        tests.forEach(function(test, index) {
            it('Filter negative received points', function() {
                let receivedPoints$ = this.testScheduler
                    .createHotObservable(test.actual, test.values);
                let nonNegativeReceivedPoints$ = createNonNegativeReceivedPoints(receivedPoints$);

                this.testScheduler.expectObservable(nonNegativeReceivedPoints$)
                    .toBe(test.expected, test.values);
                this.testScheduler.flush();
            });
        });
    });

    describe('Create score', function() {
        it('Check accumulate', function() {
            let actual = '^abc';
            let expected = '-ade';
            let values = {
                a: 0,
                b: 10,
                c: 30,
                d: 0 + 10,
                e: 10 + 30,
            };
            let receivedPoints$ = this.testScheduler.createHotObservable(actual, values);
            let score$ = createScore(receivedPoints$);

            this.testScheduler.expectObservable(score$).toBe(expected, values);
            this.testScheduler.flush();
        });
    });

    describe('Create level', function() {
        it('Check level calculation', function() {
            let actual = '^abcde';
            let expected = '-f--gh';
            let values = {
                a: 0,
                b: 900,
                c: 1999,
                d: 2001,
                e: 3150,
                f: 1,
                g: 2,
                h: 3,
            };
            let score$ = this.testScheduler.createHotObservable(actual, values);
            let calculateLevelMock = sinon.stub();
            calculateLevelMock.withArgs(values.a).returns(1);
            calculateLevelMock.withArgs(values.b).returns(1);
            calculateLevelMock.withArgs(values.c).returns(1);
            calculateLevelMock.withArgs(values.d).returns(2);
            calculateLevelMock.withArgs(values.e).returns(3);

            let level$ = createLevel(score$, calculateLevelMock);
            this.testScheduler.expectObservable(level$).toBe(expected, values);
            this.testScheduler.flush();
        });
    });

    describe('Create game speed', function() {
        it('Check game speed calculation', function() {
            let actual = '^ab';
            let expected = '-cd';
            let values = {
                a: 1,
                b: 2,
                c: 1 * 2,
                d: 2 * 2,
            };
            let score$ = this.testScheduler.createHotObservable(actual, values);
            let calculateSpeedMock = sinon.stub();
            calculateSpeedMock.withArgs(values.a).returns(values.c);
            calculateSpeedMock.withArgs(values.b).returns(values.d);

            let gameSpeed$ = createGameSpeed(score$, calculateSpeedMock);
            this.testScheduler.expectObservable(gameSpeed$).toBe(expected, values);
            this.testScheduler.flush();
        });
    });
});